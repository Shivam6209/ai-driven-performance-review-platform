import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserRole } from '../auth/enums/user-role.enum';
import { User } from '../auth/entities/user.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { RbacService } from '../rbac/rbac.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface CreateInvitationDto {
  email: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  role?: UserRole;
  permissions?: string[];
  organizationId: string;
  invitedBy: string;
}

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private organizationsService: OrganizationsService,
    private notificationsService: NotificationsService,
    private rbacService: RbacService,
  ) {}

  async create(createInvitationDto: CreateInvitationDto): Promise<Invitation> {
    // Check if organization exists
    const organization = await this.organizationsService.findOne(createInvitationDto.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if invitation already exists for this email and organization
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        email: createInvitationDto.email,
        organizationId: createInvitationDto.organizationId,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new Error('Invitation already exists for this email');
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createInvitationDto.email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Generate secure token and temporary password
    const token = crypto.randomBytes(32).toString('hex');
    const tempPassword = this.generateTempPassword();

    // Create user account immediately with temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const newUser = this.usersRepository.create({
      email: createInvitationDto.email,
      password: hashedPassword,
      role: createInvitationDto.role || UserRole.EMPLOYEE,
      organizationId: createInvitationDto.organizationId,
      isEmailVerified: true, // Invited users don't need email verification
      isActive: true,
    });
    const savedUser = await this.usersRepository.save(newUser);

    // Create employee profile
    const employeeCode = `EMP${Date.now()}`;
    const newEmployee = this.employeeRepository.create({
      employeeCode,
      firstName: createInvitationDto.firstName || 'Unknown',
      lastName: createInvitationDto.lastName || 'User',
      email: createInvitationDto.email,
      jobTitle: createInvitationDto.jobTitle,
      role: createInvitationDto.role || 'employee', // Role selected by admin/HR in invitation UI
      organizationId: createInvitationDto.organizationId,
      employmentStatus: 'active',
      isActive: true,
    });
    const savedEmployee = await this.employeeRepository.save(newEmployee);

    // Link user to employee
    await this.usersRepository.update(savedUser.id, {
      employeeId: savedEmployee.id,
    });

    console.log(`✅ Created user account for ${createInvitationDto.email} with role ${createInvitationDto.role}`);
    console.log(`✅ Created employee profile with ID: ${savedEmployee.id}`);
    
    // Auto-assign RBAC role based on user role
    try {
      await this.rbacService.syncUserRole(savedUser.id, savedUser.role);
      console.log(`✅ Auto-assigned RBAC role '${savedUser.role}' to invited user ${savedUser.email}`);
    } catch (error) {
      console.error(`❌ Failed to assign RBAC role to invited user ${savedUser.email}:`, error);
    }
    
    // Create invitation with 7 days expiry and ensure all required fields are set
    const invitation = this.invitationRepository.create({
      email: createInvitationDto.email,
      firstName: createInvitationDto.firstName || 'Unknown',
      lastName: createInvitationDto.lastName || 'User',
      jobTitle: createInvitationDto.jobTitle,
      role: createInvitationDto.role || UserRole.EMPLOYEE,
      permissions: createInvitationDto.permissions,
      organizationId: createInvitationDto.organizationId,
      invitedBy: createInvitationDto.invitedBy,
      token,
      tempPassword,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Send invitation email with credentials
    await this.sendInvitationEmail(savedInvitation, organization);

    // Send real-time notification to the invitor
    try {
      await this.notificationsService.sendInvitationSentNotification(
        createInvitationDto.invitedBy,
        createInvitationDto.email
      );
      console.log(`🔔 Sent invitation sent notification to invitor ${createInvitationDto.invitedBy}`);
    } catch (error) {
      console.error('❌ Failed to send invitation sent notification:', error);
    }

    return savedInvitation;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    return this.invitationRepository.findOne({
      where: { token },
      relations: ['organization'],
    });
  }

  async acceptInvitation(token: string): Promise<Invitation> {
    const invitation = await this.findByToken(token);
    
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error('Invitation already processed');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    invitation.status = InvitationStatus.ACCEPTED;
    return this.invitationRepository.save(invitation);
  }

  async findByOrganization(organizationId: string): Promise<Invitation[]> {
    return this.invitationRepository.find({
      where: { organizationId },
      relations: ['organization', 'inviter'],
      order: { createdAt: 'DESC' },
    });
  }

  async resendInvitation(invitationId: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new Error('Cannot resend accepted invitation');
    }

    // Generate new temporary password
    const newTempPassword = this.generateTempPassword();

    // Update invitation with new token, temp password and expiry
    invitation.token = crypto.randomBytes(32).toString('hex');
    invitation.tempPassword = newTempPassword;
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    invitation.status = InvitationStatus.PENDING;

    const updatedInvitation = await this.invitationRepository.save(invitation);

    // Update user's password with new temporary password
    const user = await this.usersRepository.findOne({
      where: { email: invitation.email }
    });

    if (user) {
      const hashedPassword = await bcrypt.hash(newTempPassword, 10);
      await this.usersRepository.update(user.id, {
        password: hashedPassword,
      });
      console.log(`✅ Updated password for user ${invitation.email}`);
    }

    // Send invitation email again with new credentials
    await this.sendInvitationEmail(updatedInvitation, invitation.organization);

    return updatedInvitation;
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new Error('Cannot cancel accepted invitation');
    }

    // Mark as expired instead of deleting
    invitation.status = InvitationStatus.EXPIRED;
    await this.invitationRepository.save(invitation);
  }

  private generateTempPassword(): string {
    // Generate a secure temporary password
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async sendInvitationEmail(invitation: Invitation, organization: any): Promise<void> {
    const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/auth/login` : 'http://localhost:3000/auth/login';
    
    // Log email details to console for debugging
    console.log('\n📧 =============== SENDING INVITATION EMAIL ===============');
    console.log(`To: ${invitation.email}`);
    console.log(`Name: ${invitation.firstName} ${invitation.lastName}`);
    console.log(`Organization: ${organization.name}`);
    console.log(`Role: ${invitation.role}`);
    console.log(`Job Title: ${invitation.jobTitle || 'Not specified'}`);
    console.log(`Temporary Password: ${invitation.tempPassword}`);
    console.log(`Login URL: ${loginUrl}`);
    console.log('=========================================================\n');

    // Check if Mailjet is configured
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET) {
      console.log('❌ Mailjet not configured. Please set MAILJET_API_KEY and MAILJET_API_SECRET environment variables.');
      console.log('📧 Email credentials logged above for manual sending.');
      return;
    }

    try {
      // Import and initialize Mailjet client
      const Mailjet = require('node-mailjet');
      const mailjetClient = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_API_SECRET
      );

      // Email content
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Welcome to ${organization.name}!</h1>
          </div>
          
          <p style="font-size: 16px; color: #374151;">Hello <strong>${invitation.firstName} ${invitation.lastName}</strong>,</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You have been invited to join <strong>${organization.name}</strong> on our performance management platform.
          </p>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1f2937; margin-top: 0;">Your Account Details:</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> ${invitation.email}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${invitation.tempPassword}</code></p>
            <p style="margin: 8px 0; color: #374151;"><strong>Role:</strong> ${invitation.role}</p>
            ${invitation.jobTitle ? `<p style="margin: 8px 0; color: #374151;"><strong>Job Title:</strong> ${invitation.jobTitle}</p>` : ''}
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-weight: 600;">
              ⚠️ Important: Please log in and change your password immediately for security.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Login to Platform
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            If you have any questions, please contact your administrator or reply to this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Best regards,<br>
            <strong>The PerformAI Platform Team</strong>
          </p>
        </div>
      `;

      const emailText = `
        Welcome to ${organization.name}!
        
        Hello ${invitation.firstName} ${invitation.lastName},
        
        You have been invited to join ${organization.name} on our performance management platform.
        
        Your Account Details:
        Email: ${invitation.email}
        Temporary Password: ${invitation.tempPassword}
        Role: ${invitation.role}
        ${invitation.jobTitle ? `Job Title: ${invitation.jobTitle}` : ''}
        
        Please log in using the credentials above and change your password immediately.
        
        Login URL: ${loginUrl}
        
        If you have any questions, please contact your administrator.
        
        Best regards,
        The PerformAI Platform Team
      `;

      // Send email using Mailjet
      const result = await mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [{
          From: {
            Email: process.env.FROM_EMAIL || 'noreply@performai.com',
            Name: 'PerformAI Platform'
          },
          To: [{
            Email: invitation.email,
            Name: `${invitation.firstName} ${invitation.lastName}`
          }],
          Subject: `Welcome to ${organization.name} - Your Account Details`,
          TextPart: emailText,
          HTMLPart: emailHtml
        }]
      });

      console.log('✅ Email sent successfully via Mailjet!');
      console.log('📧 Message ID:', result.body.Messages[0].To[0].MessageID);
      console.log('📧 Status:', result.body.Messages[0].Status);
      
    } catch (error) {
      console.error('❌ Failed to send invitation email via Mailjet:', error);
      console.log('📧 Email failed, but invitation created successfully.');
      
      // Don't throw error - invitation is still valid even if email fails
      console.log('\n📧 =============== EMAIL CREDENTIALS (BACKUP) ===============');
      console.log(`Email: ${invitation.email}`);
      console.log(`Password: ${invitation.tempPassword}`);
      console.log(`Login: ${loginUrl}`);
      console.log('===========================================================\n');
    }
  }
} 