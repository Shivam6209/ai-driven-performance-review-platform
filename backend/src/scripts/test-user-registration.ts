import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../modules/auth/auth.service';
import { RbacService } from '../modules/rbac/rbac.service';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

async function testUserRegistration() {
  const logger = new Logger('TestUserRegistration');
  
  try {
    logger.log('🧪 Testing user registration and RBAC assignment...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);
    const rbacService = app.get(RbacService);
    const dataSource = app.get(DataSource);

    // Test admin registration
    const adminData = {
      email: `test-admin-${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Admin',
      jobTitle: 'System Administrator',
      organizationName: `Test Org ${Date.now()}`
    };

    logger.log(`📝 Registering admin user: ${adminData.email}`);
    
    try {
      const result = await authService.registerAdmin(adminData);
      logger.log(`✅ Admin registered successfully: ${result.user.email}`);
      logger.log(`👤 User ID: ${result.user.id}`);
      logger.log(`👨‍💼 Employee ID: ${result.user.employeeId}`);
      logger.log(`🎭 Role: ${result.user.role}`);

      // Check if user exists in database
      const userCheck = await dataSource.query(`
        SELECT u.id, u.email, u.role, u.employee_id, e.id as emp_id, e.role as emp_role
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.id 
        WHERE u.email = $1
      `, [adminData.email]);

      if (userCheck.length > 0) {
        const user = userCheck[0];
        logger.log(`🔍 Database check - User found:`);
        logger.log(`   - User ID: ${user.id}`);
        logger.log(`   - User Role: ${user.role}`);
        logger.log(`   - Employee ID: ${user.employee_id}`);
        logger.log(`   - Employee Role: ${user.emp_role}`);

        // Check RBAC role assignments
        if (user.employee_id) {
          const roleAssignments = await rbacService.getEmployeeRoles(user.employee_id);
          logger.log(`🔐 RBAC Role Assignments: ${roleAssignments.length}`);
          
          roleAssignments.forEach(assignment => {
            logger.log(`   - Role: ${assignment.role.name} (${assignment.role.permissions?.length || 0} permissions)`);
          });

          if (roleAssignments.length === 0) {
            logger.error(`❌ NO RBAC ROLES ASSIGNED! This is the problem.`);
            
            // Try to manually sync the role
            logger.log(`🔧 Attempting manual role sync...`);
            await rbacService.syncUserRole(user.id, user.role);
            
            // Check again
            const newRoleAssignments = await rbacService.getEmployeeRoles(user.employee_id);
            logger.log(`🔍 After manual sync - RBAC Role Assignments: ${newRoleAssignments.length}`);
            
            newRoleAssignments.forEach(assignment => {
              logger.log(`   - Role: ${assignment.role.name} (${assignment.role.permissions?.length || 0} permissions)`);
            });
          }

          // Test permission check
          const hasReviewsRead = await rbacService.hasPermission(user.employee_id, 'reviews', 'read');
          logger.log(`🔍 Permission check - reviews:read: ${hasReviewsRead}`);

        } else {
          logger.error(`❌ User has no employee_id linked! This is a major problem.`);
        }
      } else {
        logger.error(`❌ User not found in database after registration!`);
      }

    } catch (error: any) {
      logger.error(`❌ Admin registration failed: ${error.message}`);
    }

    await app.close();
  } catch (error: any) {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testUserRegistration(); 