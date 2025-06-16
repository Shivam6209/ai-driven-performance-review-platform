import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacService } from '../modules/rbac/rbac.service';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Employee } from '../modules/employees/entities/employee.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function createAdminEmployee() {
  const logger = new Logger('CreateAdminEmployee');
  
  try {
    logger.log('🚀 Creating admin employee and assigning role...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);
    const employeeRepository = app.get<Repository<Employee>>(getRepositoryToken(Employee));

    const adminUserId = '3717e889-2495-455c-b8e4-1b045b363414';
    const adminEmail = 'owner@mailinator.com';
    
    // Check if admin employee exists
    let adminEmployee = await employeeRepository.findOne({ where: { id: adminUserId } });
    
    if (!adminEmployee) {
      logger.log('👤 Creating admin employee record...');
      
      // Create admin employee with specific ID
      adminEmployee = employeeRepository.create({
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        employeeCode: 'ADMIN001',
        role: 'admin',
        isActive: true,
        hireDate: new Date(),
      });
      
      // Set the specific ID we need
      adminEmployee.id = adminUserId;
      
      await employeeRepository.save(adminEmployee);
      logger.log('✅ Admin employee created successfully');
    } else {
      logger.log('✅ Admin employee already exists');
    }
    
    // Now assign admin role
    logger.log('🔧 Assigning admin role...');
    await rbacService.syncUserRole(adminUserId, 'admin');
    
    // Verify the assignment
    const roleAssignments = await rbacService.getEmployeeRoles(adminUserId);
    logger.log(`👤 Admin user now has ${roleAssignments.length} role assignments:`);
    
    roleAssignments.forEach(assignment => {
      logger.log(`   - ${assignment.role.name} (${assignment.role.permissions?.length || 0} permissions)`);
    });
    
    // Test the specific permission
    const hasRbacReadRoles = await rbacService.hasPermission(adminUserId, 'rbac', 'read_roles');
    logger.log(`🔑 Admin has 'rbac:read_roles' permission: ${hasRbacReadRoles}`);
    
    if (hasRbacReadRoles) {
      logger.log('🎉 SUCCESS! Admin user now has proper permissions');
    } else {
      logger.log('❌ FAILED! Admin user still does not have rbac:read_roles permission');
    }

    await app.close();
  } catch (error: any) {
    logger.error('❌ Create admin employee failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createAdminEmployee();
}

export { createAdminEmployee }; 