import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacService } from '../modules/rbac/rbac.service';
import { Logger } from '@nestjs/common';

async function bootstrapRbac() {
  const logger = new Logger('RbacBootstrap');
  
  try {
    logger.log('🚀 Starting RBAC Bootstrap...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);

    // Create basic permissions
    const permissions = [
      // Reviews permissions
      { name: 'reviews:read', description: 'Read reviews', resource: 'reviews', action: 'read' },
      { name: 'reviews:write', description: 'Write reviews', resource: 'reviews', action: 'write' },
      { name: 'reviews:delete', description: 'Delete reviews', resource: 'reviews', action: 'delete' },
      
      // OKRs permissions
      { name: 'okrs:read', description: 'Read OKRs', resource: 'okrs', action: 'read' },
      { name: 'okrs:write', description: 'Write OKRs', resource: 'okrs', action: 'write' },
      { name: 'okrs:delete', description: 'Delete OKRs', resource: 'okrs', action: 'delete' },
      
      // Feedback permissions
      { name: 'feedback:read', description: 'Read feedback', resource: 'feedback', action: 'read' },
      { name: 'feedback:write', description: 'Write feedback', resource: 'feedback', action: 'write' },
      { name: 'feedback:delete', description: 'Delete feedback', resource: 'feedback', action: 'delete' },
      
      // Analytics permissions
      { name: 'analytics:read', description: 'Read analytics', resource: 'analytics', action: 'read' },
      { name: 'analytics:write', description: 'Write analytics', resource: 'analytics', action: 'write' },
      
      // Employees permissions
      { name: 'employees:read', description: 'Read employees', resource: 'employees', action: 'read' },
      { name: 'employees:write', description: 'Write employees', resource: 'employees', action: 'write' },
      { name: 'employees:delete', description: 'Delete employees', resource: 'employees', action: 'delete' },
      
      // RBAC permissions
      { name: 'rbac:read_roles', description: 'Read roles', resource: 'rbac', action: 'read_roles' },
      { name: 'rbac:create_role', description: 'Create roles', resource: 'rbac', action: 'create_role' },
      { name: 'rbac:update_role', description: 'Update roles', resource: 'rbac', action: 'update_role' },
      { name: 'rbac:delete_role', description: 'Delete roles', resource: 'rbac', action: 'delete_role' },
      { name: 'rbac:read_permissions', description: 'Read permissions', resource: 'rbac', action: 'read_permissions' },
      { name: 'rbac:assign_role', description: 'Assign roles', resource: 'rbac', action: 'assign_role' },
      { name: 'rbac:revoke_role', description: 'Revoke roles', resource: 'rbac', action: 'revoke_role' },
    ];

    logger.log('📝 Creating permissions...');
    const createdPermissions = [];
    for (const permissionData of permissions) {
      try {
        const permission = await rbacService.createPermission(permissionData);
        createdPermissions.push(permission);
        logger.log(`✅ Created permission: ${permission.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          logger.log(`⚠️  Permission already exists: ${permissionData.name}`);
          // Get existing permission
          const existingPermissions = await rbacService.getAllPermissions();
          const existing = existingPermissions.find(p => p.name === permissionData.name);
          if (existing) {
            createdPermissions.push(existing);
          }
        } else {
          logger.error(`❌ Failed to create permission ${permissionData.name}:`, error.message);
        }
      }
    }

    // Create basic roles that match UserRole enum
    const roles = [
      {
        name: 'admin',
        description: 'System administrator with full access',
        permissionIds: createdPermissions.map(p => p.id), // All permissions
        is_system_role: true,
        is_custom: false,
      },
      {
        name: 'hr',
        description: 'HR personnel with HR management capabilities',
        permissionIds: createdPermissions
          .filter(p => !p.name.includes('delete') || p.resource === 'employees')
          .map(p => p.id),
        is_system_role: true,
        is_custom: false,
      },
      {
        name: 'manager',
        description: 'Manager with team oversight capabilities',
        permissionIds: createdPermissions
          .filter(p => !p.name.includes('delete') && !p.name.includes('rbac'))
          .map(p => p.id),
        is_system_role: true,
        is_custom: false,
      },
      {
        name: 'employee',
        description: 'Basic employee access',
        permissionIds: createdPermissions
          .filter(p => p.action === 'read' || (p.resource === 'feedback' && p.action === 'write'))
          .map(p => p.id),
        is_system_role: true,
        is_custom: false,
      },
    ];

    logger.log('👥 Creating roles...');
    for (const roleData of roles) {
      try {
        const role = await rbacService.createRole(roleData);
        logger.log(`✅ Created role: ${role.name} with ${roleData.permissionIds.length} permissions`);
      } catch (error: any) {
        logger.error(`❌ Failed to create role ${roleData.name}:`, error.message);
      }
    }

    logger.log('🎉 RBAC Bootstrap completed successfully!');
    
    await app.close();
  } catch (error: any) {
    logger.error('❌ RBAC Bootstrap failed:', error);
    process.exit(1);
  }
}

// Run the bootstrap if this file is executed directly
if (require.main === module) {
  bootstrapRbac();
}

export { bootstrapRbac }; 