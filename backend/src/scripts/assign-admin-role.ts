import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacService } from '../modules/rbac/rbac.service';
import { Logger } from '@nestjs/common';

async function assignAdminRole() {
  const logger = new Logger('AssignAdminRole');
  
  try {
    logger.log('🚀 Assigning admin role to admin user...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);

    const adminUserId = '3717e889-2495-455c-b8e4-1b045b363414';
    
    try {
      await rbacService.syncUserRole(adminUserId, 'admin');
      logger.log('✅ Successfully assigned admin role to admin user');
      
      // Verify
      const adminRoles = await rbacService.getEmployeeRoles(adminUserId);
      logger.log(`👤 Admin user now has ${adminRoles.length} role assignments:`);
      adminRoles.forEach(assignment => {
        logger.log(`   - ${assignment.role.name} (${assignment.role.permissions?.length || 0} permissions)`);
      });
      
    } catch (error: any) {
      logger.error(`❌ Failed to assign admin role: ${error.message}`);
    }

    logger.log('🎉 Admin role assignment completed!');
    
    await app.close();
  } catch (error: any) {
    logger.error('❌ Admin role assignment failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  assignAdminRole();
}

export { assignAdminRole }; 