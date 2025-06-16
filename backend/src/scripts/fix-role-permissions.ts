import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacService } from '../modules/rbac/rbac.service';
import { Logger } from '@nestjs/common';

async function fixRolePermissions() {
  const logger = new Logger('FixRolePermissions');
  
  try {
    logger.log('🔧 Fixing role permissions...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);

    // Get all permissions
    const allPermissions = await rbacService.getAllPermissions();
    logger.log(`📋 Found ${allPermissions.length} permissions in system`);

    // Define permission mappings for each role
    const rolePermissionMappings = {
      admin: allPermissions.map(p => p.id), // All permissions
      hr: allPermissions
        .filter(p => !p.name.includes('delete') || p.resource === 'employees')
        .map(p => p.id),
      manager: allPermissions
        .filter(p => !p.name.includes('delete') && !p.name.includes('rbac'))
        .map(p => p.id),
      employee: allPermissions
        .filter(p => p.action === 'read' || (p.resource === 'feedback' && p.action === 'write'))
        .map(p => p.id),
    };

    // Get all existing roles
    const roles = await rbacService.getAllRoles();
    logger.log(`🎭 Found ${roles.length} roles`);

    for (const role of roles) {
      const expectedPermissionIds = rolePermissionMappings[role.name as keyof typeof rolePermissionMappings];
      
      if (!expectedPermissionIds) {
        logger.warn(`⚠️  No permission mapping found for role: ${role.name}`);
        continue;
      }

      logger.log(`\n🔧 Fixing role: ${role.name}`);
      logger.log(`   Current permissions: ${role.permissions?.length || 0}`);
      logger.log(`   Expected permissions: ${expectedPermissionIds.length}`);

      // Update the role with correct permissions
      try {
        await rbacService.updateRole(role.id, {
          permissionIds: expectedPermissionIds
        });
        
        logger.log(`✅ Updated role '${role.name}' with ${expectedPermissionIds.length} permissions`);
      } catch (error: any) {
        logger.error(`❌ Failed to update role '${role.name}': ${error.message}`);
      }
    }

    // Verify the fix
    logger.log('\n🔍 Verifying role permissions after fix...');
    const updatedRoles = await rbacService.getAllRoles();
    
    for (const role of updatedRoles) {
      logger.log(`🎭 ${role.name}: ${role.permissions?.length || 0} permissions`);
      if (role.permissions && role.permissions.length > 0) {
        const permissionNames = role.permissions.map(p => p.name).join(', ');
        logger.log(`   Permissions: ${permissionNames}`);
      }
    }

    logger.log('\n🎉 Role permissions fix completed!');
    
    await app.close();
  } catch (error: any) {
    logger.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
fixRolePermissions(); 