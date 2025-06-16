import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Department } from '../departments/entities/department.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterWithInvitationDto } from './dto/register-with-invitation.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from './enums/user-role.enum';
import { InvitationStatus } from '../invitations/entities/invitation.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private rbacService: RbacService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['employee', 'employee.department', 'employee.manager', 'organization'],
    });
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Update last login time
      await this.usersRepository.update(user.id, { lastLogin: new Date() });
      
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(userId: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['employee', 'employee.department', 'employee.manager', 'organization'],
    });
    
    if (user) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if there's a pending invitation for this user and accept it
    const pendingInvitation = await this.invitationRepository.findOne({
      where: { 
        email: user.email,
        status: InvitationStatus.PENDING 
      }
    });

    if (pendingInvitation) {
      // Accept the invitation automatically on successful login
      pendingInvitation.status = InvitationStatus.ACCEPTED;
      await this.invitationRepository.save(pendingInvitation);
      console.log(`✅ Automatically accepted invitation for ${user.email}`);

      // Send real-time notification to the invitor
      try {
        const inviteeName = user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email;
        await this.notificationsService.sendInvitationAcceptedNotification(
          pendingInvitation.invitedBy,
          user.email,
          inviteeName
        );
        console.log(`🔔 Sent invitation accepted notification to invitor ${pendingInvitation.invitedBy}`);
      } catch (error) {
        console.error('❌ Failed to send invitation accepted notification:', error);
      }
    }

    const payload = {
      email: user.email,
      sub: user.id,
      employeeId: user.employeeId,
      organizationId: user.organizationId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        employeeId: user.employeeId,
        organizationId: user.organizationId,
        organization: user.organization,
        // Employee information
        firstName: user.employee?.firstName || null,
        lastName: user.employee?.lastName || null,
        fullName: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : null,
        jobTitle: user.employee?.jobTitle || null,
        profileImageUrl: user.employee?.profileImageUrl || null,
        departmentId: user.employee?.departmentId || null,
        department: user.employee?.department?.name || null,
        managerId: user.employee?.managerId || null,
        manager: user.employee?.manager ? `${user.employee.manager.firstName} ${user.employee.manager.lastName}` : null,
      }
    };
  }

  async register(registerData: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerData.email }
    });
    
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Check if employee with same email exists
    const existingEmployee = await this.employeeRepository.findOne({
      where: { email: registerData.email }
    });

    if (existingEmployee) {
      throw new BadRequestException('Employee with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    const emailVerificationToken = uuidv4();
    
    // Create user first (authentication)
    const newUser = this.usersRepository.create({
      email: registerData.email,
      password: hashedPassword,
      role: registerData.role,
      emailVerificationToken,
    });

    const savedUser = await this.usersRepository.save(newUser);

    // Create corresponding employee record (profile)
    const employeeCode = `EMP${Date.now()}`;
    const newEmployee = this.employeeRepository.create({
      employeeCode,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      jobTitle: registerData.jobTitle,
      role: registerData.role as 'admin' | 'hr' | 'manager' | 'employee', // Role from registration form
      departmentId: registerData.departmentId,
      managerId: registerData.managerId,
      employmentStatus: 'active',
      isActive: true,
    });

    const savedEmployee = await this.employeeRepository.save(newEmployee);

    // Link user to employee
    await this.usersRepository.update(savedUser.id, {
      employeeId: savedEmployee.id,
    });

    // Auto-assign RBAC role based on user role
    try {
      await this.rbacService.syncUserRole(savedUser.id, savedUser.role);
      console.log(`✅ Auto-assigned RBAC role '${savedUser.role}' to registered user ${savedUser.email}`);
    } catch (error) {
      console.error(`❌ Failed to assign RBAC role to registered user ${savedUser.email}:`, error);
    }

    const { password: _, ...user } = savedUser;
    
    // Generate JWT token for the new user
    const payload = {
      email: user.email,
      sub: user.id,
      employeeId: savedEmployee.id,
      organizationId: user.organizationId || null,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        employeeId: savedEmployee.id,
        organizationId: user.organizationId || null,
        // Employee information
        firstName: savedEmployee.firstName,
        lastName: savedEmployee.lastName,
        fullName: `${savedEmployee.firstName} ${savedEmployee.lastName}`,
        jobTitle: savedEmployee.jobTitle,
        profileImageUrl: null,
        departmentId: savedEmployee.departmentId,
        department: null,
        managerId: savedEmployee.managerId,
        manager: null,
      }
    };
  }

  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerAdminDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Create organization first - ensure unique domain
    const baseDomain = registerAdminDto.email.split('@')[1];
    let uniqueDomain = baseDomain;
    
    // Check if domain already exists and make it unique if needed
    const existingOrg = await this.organizationRepository.findOne({
      where: { domain: baseDomain }
    });
    
    if (existingOrg) {
      // Make domain unique by adding timestamp
      uniqueDomain = `${baseDomain}-${Date.now()}`;
    }
    
    const organization = this.organizationRepository.create({
      name: registerAdminDto.organizationName,
      domain: uniqueDomain,
    });
    const savedOrganization = await this.organizationRepository.save(organization);

    // Create default HR department
    const hrDepartment = this.departmentRepository.create({
      name: 'Human Resources',
      description: 'Human Resources Department',
      organizationId: savedOrganization.id,
    });
    const savedHrDepartment = await this.departmentRepository.save(hrDepartment);

    // Create admin user
    const hashedPassword = await bcrypt.hash(registerAdminDto.password, 10);
    const adminUser = this.usersRepository.create({
      email: registerAdminDto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      organizationId: savedOrganization.id,
      isEmailVerified: true, // Admin doesn't need email verification
    });
    const savedUser = await this.usersRepository.save(adminUser);

    // Create admin employee profile
    const employeeCode = `ADM${Date.now()}`;
    const adminEmployee = this.employeeRepository.create({
      employeeCode,
      firstName: registerAdminDto.firstName,
      lastName: registerAdminDto.lastName,
      email: registerAdminDto.email,
      jobTitle: registerAdminDto.jobTitle,
      role: savedUser.role as 'admin' | 'hr' | 'manager' | 'employee', // Admin role assigned automatically for organization creators
      departmentId: savedHrDepartment.id,
      organizationId: savedOrganization.id,
      employmentStatus: 'active',
      isActive: true,
    });
    const savedEmployee = await this.employeeRepository.save(adminEmployee);

    // Link user to employee
    await this.usersRepository.update(savedUser.id, {
      employeeId: savedEmployee.id,
    });

    // Update department head
    await this.departmentRepository.update(savedHrDepartment.id, {
      manager: savedEmployee,
    });

    // Auto-assign RBAC role based on user role
    try {
      await this.rbacService.syncUserRole(savedUser.id, savedUser.role);
      console.log(`✅ Auto-assigned RBAC role '${savedUser.role}' to admin user ${savedUser.email}`);
    } catch (error) {
      console.error(`❌ Failed to assign RBAC role to admin user ${savedUser.email}:`, error);
    }

    // Generate JWT token
    const payload = {
      email: savedUser.email,
      sub: savedUser.id,
      employeeId: savedEmployee.id,
      organizationId: savedOrganization.id,
      role: savedUser.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        isActive: savedUser.isActive,
        employeeId: savedEmployee.id,
        organizationId: savedOrganization.id,
        organization: savedOrganization,
        firstName: savedEmployee.firstName,
        lastName: savedEmployee.lastName,
        fullName: `${savedEmployee.firstName} ${savedEmployee.lastName}`,
        jobTitle: savedEmployee.jobTitle,
        departmentId: savedEmployee.departmentId,
        department: savedHrDepartment.name,
      }
    };
  }

  async registerWithInvitation(registerDto: RegisterWithInvitationDto) {
    // Find and validate invitation
    const invitation = await this.invitationRepository.findOne({
      where: { token: registerDto.invitationToken },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation already used or expired');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: invitation.email }
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Create user with invitation data
    const hashedPassword = await bcrypt.hash(invitation.tempPassword || 'temp123', 10);
    const newUser = this.usersRepository.create({
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role || UserRole.EMPLOYEE, // Use role from invitation with fallback
      organizationId: invitation.organizationId,
      isEmailVerified: true, // Invited users don't need email verification
    });
    const savedUser = await this.usersRepository.save(newUser);

    // Create employee profile with invitation data
    const employeeCode = `EMP${Date.now()}`;
    const newEmployee = this.employeeRepository.create({
      employeeCode,
      firstName: invitation.firstName || 'Unknown',
      lastName: invitation.lastName || 'User',
      email: invitation.email,
      jobTitle: invitation.jobTitle,
      role: invitation.role || 'employee', // Role selected by admin/HR in invitation UI
      organizationId: invitation.organizationId,
      employmentStatus: 'active',
      isActive: true,
    });
    const savedEmployee = await this.employeeRepository.save(newEmployee);

    // Link user to employee
    await this.usersRepository.update(savedUser.id, {
      employeeId: savedEmployee.id,
    });

    // Mark invitation as accepted
    await this.invitationRepository.update(invitation.id, {
      status: InvitationStatus.ACCEPTED,
    });

    // Auto-assign RBAC role based on user role
    try {
      await this.rbacService.syncUserRole(savedUser.id, savedUser.role);
      console.log(`✅ Auto-assigned RBAC role '${savedUser.role}' to invited user ${savedUser.email}`);
    } catch (error) {
      console.error(`❌ Failed to assign RBAC role to invited user ${savedUser.email}:`, error);
    }

    // Generate JWT token
    const payload = {
      email: savedUser.email,
      sub: savedUser.id,
      employeeId: savedEmployee.id,
      organizationId: invitation.organizationId,
      role: savedUser.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        isActive: savedUser.isActive,
        employeeId: savedEmployee.id,
        organizationId: invitation.organizationId,
        organization: invitation.organization,
        firstName: savedEmployee.firstName,
        lastName: savedEmployee.lastName,
        fullName: `${savedEmployee.firstName} ${savedEmployee.lastName}`,
        jobTitle: savedEmployee.jobTitle,
        departmentId: savedEmployee.departmentId,
      }
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: forgotPasswordDto.email }
    });
    
    if (!user) {
      // Don't reveal that the user doesn't exist
      return { message: 'If your email is registered, you will receive a password reset link' };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token valid for 1 hour
    
    await this.usersRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });
    
    // In a real app, send email with reset link
    
    return { message: 'If your email is registered, you will receive a password reset link' };
  }

  async resetPassword(resetToken: string, resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { 
        passwordResetToken: resetToken,
        passwordResetExpires: MoreThan(new Date())
      }
    });
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
    
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: '',
      passwordResetExpires: new Date(),
    });
    
    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token }
    });
    
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }
    
    await this.usersRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: '',
    });
    
    return { message: 'Email verified successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword, 
      user.password
    );
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    
    // Update password
    await this.usersRepository.update(userId, {
      password: hashedNewPassword,
    });
    
    return { message: 'Password changed successfully' };
  }

  async getCurrentUserProfile(userId: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId, isActive: true },
        relations: ['employee', 'employee.department', 'employee.manager', 'organization'],
        select: ['id', 'email', 'role', 'isActive', 'lastLogin', 'createdAt', 'employeeId', 'organizationId']
      });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        employeeId: user.employeeId,
        organizationId: user.organizationId,
        organization: user.organization,
        // Employee information
        firstName: user.employee?.firstName,
        lastName: user.employee?.lastName,
        fullName: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : null,
        jobTitle: user.employee?.jobTitle,
        phoneNumber: user.employee?.phoneNumber,
        bio: user.employee?.bio,
        profileImageUrl: user.employee?.profileImageUrl,
        departmentId: user.employee?.departmentId,
        department: user.employee?.department?.name,
        managerId: user.employee?.managerId,
        manager: user.employee?.manager ? `${user.employee.manager.firstName} ${user.employee.manager.lastName}` : null,
        hireDate: user.employee?.hireDate,
        employmentStatus: user.employee?.employmentStatus,
      };
    } catch (error: any) {
      console.error('❌ Database error in getCurrentUserProfile:', error.message);
      throw error;
    }
  }

  async logout(userId: string) {
    // Update user's last logout time for audit purposes
    await this.usersRepository.update(userId, { 
      lastLogin: new Date() // We can use this field to track last activity
    });
    
    // In a real application, you might want to:
    // - Invalidate refresh tokens
    // - Add to a token blacklist
    // - Clear session data
    // - Log the logout event
    
    return { 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    };
  }

  async updateUserProfile(userId: string, updateData: any) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['employee']
    });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    if (!user.employee) {
      throw new BadRequestException('Employee profile not found');
    }
    
    // Update employee fields (all profile data is in Employee entity)
    const employeeAllowedFields = ['firstName', 'lastName', 'jobTitle', 'phoneNumber', 'bio', 'profileImageUrl', 'displayName'];
    const employeeUpdateFields: any = {};
    
    for (const field of employeeAllowedFields) {
      if (updateData[field] !== undefined) {
        employeeUpdateFields[field] = updateData[field];
      }
    }
    
    // Update employee if there are fields to update
    if (Object.keys(employeeUpdateFields).length > 0) {
      await this.employeeRepository.update(user.employee.id, employeeUpdateFields);
    } else {
      throw new BadRequestException('No valid fields to update');
    }
    
    // Return updated profile
    return this.getCurrentUserProfile(userId);
  }
} 