import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacService } from '../modules/rbac/rbac.service';
import { Logger } from '@nestjs/common';

async function fixRbacRoles() {
  const logger = new Logger('FixRbacRoles');
  
  try {
    logger.log('🚀 Starting RBAC Role Fix...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);

    // Get all existing roles
    const existingRoles = await rbacService.getAllRoles();
    logger.log(`📋 Found ${existingRoles.length} existing roles`);

    // Delete old roles that don't match UserRole enum
    const oldRoleNames = ['HR Admin', 'Manager', 'Employee'];
    for (const roleName of oldRoleNames) {
      const oldRole = existingRoles.find(role => role.name === roleName);
      if (oldRole && !oldRole.is_system_role) {
        try {
          await rbacService.deleteRole(oldRole.id);
          logger.log(`🗑️  Deleted old role: ${roleName}`);
        } catch (error: any) {
          logger.warn(`⚠️  Could not delete role ${roleName}: ${error.message}`);
        }
      }
    }

    // Get all permissions
    const permissions = await rbacService.getAllPermissions();
    logger.log(`🔑 Found ${permissions.length} permissions`);

    // Create roles that match UserRole enum
    const rolesToCreate = [
      {
        name: 'admin',
        description: 'System administrator with full access',
        permissionIds: permissions.map(p => p.id), // All permissions
        is_system_role: true,
        is_custom: false,
      },
      {
        name: 'hr',
        description: 'HR personnel with HR management capabilities',
        permissionIds: permissions
          .filter(p => !p.name.includes('delete') || p.resource === 'employees')
          .map(p => p.id),
        is_system_role: true,
        is_custom: false,
      },
      {
        name: 'manager',
        description: 'Manager with team oversight capabilities',
        permissionIds: permissions
          .filter(p => !p.name.includes('delete') && !p.name.includes('rbac'))
          .map(p => p.id),
        is_system_role: true,
        is_custom: false,
      },
      {
        name: 'employee',
        description: 'Basic employee access',
        permissionIds: permissions
          .filter(p => p.action === 'read' || (p.resource === 'feedback' && p.action === 'write'))
          .map(p => p.id),
        is_system_role: true,
        is_custom: false,
      },
    ];

    // Create new roles
    for (const roleData of rolesToCreate) {
      try {
        // Check if role already exists
        const existingRole = existingRoles.find(role => role.name === roleData.name);
        if (existingRole) {
          logger.log(`⚠️  Role '${roleData.name}' already exists`);
        } else {
          const role = await rbacService.createRole(roleData);
          logger.log(`✅ Created role: ${role.name} with ${roleData.permissionIds.length} permissions`);
        }
      } catch (error: any) {
        logger.error(`❌ Failed to create role ${roleData.name}: ${error.message}`);
      }
    }

    // Now sync the admin user
    const adminUserId = '3717e889-2495-455c-b8e4-1b045b363414';
    try {
      await rbacService.syncUserRole(adminUserId, 'admin');
      logger.log('✅ Synced admin user role');
      
      // Verify admin permissions
      const adminRoles = await rbacService.getEmployeeRoles(adminUserId);
      logger.log(`📊 Admin user now has ${adminRoles.length} role(s):`);
      adminRoles.forEach(assignment => {
        logger.log(`   - ${assignment.role.name} (${assignment.role.permissions.length} permissions)`);
      });
      
    } catch (error: any) {
      logger.error(`❌ Failed to sync admin user: ${error.message}`);
    }

    logger.log('🎉 RBAC Role Fix completed!');
    
    await app.close();
  } catch (error: any) {
    logger.error('❌ RBAC Role Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix if this file is executed directly
if (require.main === module) {
  fixRbacRoles();
}

export { fixRbacRoles }; 