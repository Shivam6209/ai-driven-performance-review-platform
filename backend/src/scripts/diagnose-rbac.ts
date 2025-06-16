import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacService } from '../modules/rbac/rbac.service';
import { Logger } from '@nestjs/common';

async function diagnoseRbac() {
  const logger = new Logger('DiagnoseRbac');
  
  try {
    logger.log('🔍 Starting RBAC Diagnosis...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);

    // Check permissions
    const permissions = await rbacService.getAllPermissions();
    logger.log(`📋 Found ${permissions.length} permissions:`);
    permissions.forEach(p => {
      logger.log(`   - ${p.name} (${p.resource}:${p.action})`);
    });

    // Check roles
    const roles = await rbacService.getAllRoles();
    logger.log(`\n👥 Found ${roles.length} roles:`);
    for (const role of roles) {
      logger.log(`   - ${role.name}: ${role.description}`);
      logger.log(`     System role: ${role.is_system_role}, Custom: ${role.is_custom}`);
      logger.log(`     Permissions: ${role.permissions?.length || 0}`);
    }

    // Check admin user assignments
    const adminUserId = '3717e889-2495-455c-b8e4-1b045b363414';
    try {
      const adminRoles = await rbacService.getEmployeeRoles(adminUserId);
      logger.log(`\n👤 Admin user (${adminUserId}) has ${adminRoles.length} role assignments:`);
      adminRoles.forEach(assignment => {
        logger.log(`   - Role: ${assignment.role.name}`);
        logger.log(`     Permissions: ${assignment.role.permissions?.length || 0}`);
      });
    } catch (error: any) {
      logger.error(`❌ Error getting admin roles: ${error.message}`);
    }

    // Check if admin role exists and has permissions
    const adminRole = roles.find(r => r.name === 'admin');
    if (adminRole) {
      logger.log(`\n🔑 Admin role details:`);
      logger.log(`   - ID: ${adminRole.id}`);
      logger.log(`   - Name: ${adminRole.name}`);
      logger.log(`   - Permissions: ${adminRole.permissions?.length || 0}`);
      if (adminRole.permissions?.length > 0) {
        logger.log(`   - Permission names: ${adminRole.permissions.map(p => p.name).join(', ')}`);
      }
    } else {
      logger.error(`❌ Admin role not found!`);
    }

    logger.log('\n🎉 RBAC Diagnosis completed!');
    
    await app.close();
  } catch (error: any) {
    logger.error('❌ RBAC Diagnosis failed:', error);
    process.exit(1);
  }
}

// Run the diagnosis if this file is executed directly
if (require.main === module) {
  diagnoseRbac();
}

export { diagnoseRbac }; 