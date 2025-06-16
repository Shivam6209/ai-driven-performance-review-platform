import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacService } from '../modules/rbac/rbac.service';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../modules/rbac/entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function comprehensiveRbacFix() {
  const logger = new Logger('ComprehensiveRbacFix');
  
  try {
    logger.log('🚀 Starting Comprehensive RBAC Fix...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);
    const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));

    // Step 1: Get all permissions and roles
    const permissions = await rbacService.getAllPermissions();
    const roles = await rbacService.getAllRoles();
    
    logger.log(`📋 Found ${permissions.length} permissions and ${roles.length} roles`);

    // Step 2: Clean up duplicate roles - keep the ones that match UserRole enum
    const validRoleNames = ['admin', 'hr', 'manager', 'employee'];
    const rolesToDelete = roles.filter(role => 
      !validRoleNames.includes(role.name) || 
      (validRoleNames.includes(role.name) && roles.filter(r => r.name === role.name).length > 1 && role.name !== role.name.toLowerCase())
    );

    logger.log(`🗑️  Deleting ${rolesToDelete.length} duplicate/invalid roles`);
    for (const role of rolesToDelete) {
      try {
        // Delete role assignments first
        await roleRepository.query('DELETE FROM role_assignments WHERE role_id = $1', [role.id]);
        // Delete role-permission relationships
        await roleRepository.query('DELETE FROM role_permissions WHERE role_id = $1', [role.id]);
        // Delete the role
        await roleRepository.remove(role);
        logger.log(`   ✅ Deleted role: ${role.name}`);
      } catch (error: any) {
        logger.warn(`   ⚠️  Could not delete role ${role.name}: ${error.message}`);
      }
    }

    // Step 3: Get clean roles list
    const cleanRoles = await rbacService.getAllRoles();
    logger.log(`👥 After cleanup: ${cleanRoles.length} roles remaining`);

    // Step 4: Assign permissions to roles
    const rolePermissionMap = {
      admin: permissions.map(p => p.id), // All permissions
      hr: permissions
        .filter(p => !p.name.includes('delete') || p.resource === 'employees')
        .map(p => p.id),
      manager: permissions
        .filter(p => !p.name.includes('delete') && !p.name.includes('rbac'))
        .map(p => p.id),
      employee: permissions
        .filter(p => p.action === 'read' || (p.resource === 'feedback' && p.action === 'write'))
        .map(p => p.id),
    };

    for (const [roleName, permissionIds] of Object.entries(rolePermissionMap)) {
      const role = cleanRoles.find(r => r.name === roleName);
      if (role) {
        try {
          // Clear existing permissions
          await roleRepository.query('DELETE FROM role_permissions WHERE role_id = $1', [role.id]);
          
          // Add new permissions
          for (const permissionId of permissionIds) {
            await roleRepository.query(
              'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [role.id, permissionId]
            );
          }
          
          logger.log(`✅ Assigned ${permissionIds.length} permissions to role: ${roleName}`);
        } catch (error: any) {
          logger.error(`❌ Failed to assign permissions to role ${roleName}: ${error.message}`);
        }
      } else {
        logger.warn(`⚠️  Role ${roleName} not found`);
      }
    }

    // Step 5: Assign admin role to admin user
    const adminUserId = '3717e889-2495-455c-b8e4-1b045b363414';
    const adminRole = cleanRoles.find(r => r.name === 'admin');
    
    if (adminRole) {
      try {
        // Check if assignment already exists
        const existingAssignment = await roleRepository.query(
          'SELECT * FROM role_assignments WHERE employee_id = $1 AND role_id = $2',
          [adminUserId, adminRole.id]
        );

                 if (existingAssignment.length === 0) {
           await roleRepository.query(
             `INSERT INTO role_assignments (id, employee_id, role_id, scope, is_active, assigned_at, assigned_by_id) 
              VALUES (gen_random_uuid(), $1, $2, '{}', true, NOW(), $1)`,
             [adminUserId, adminRole.id]
           );
          logger.log('✅ Assigned admin role to admin user');
        } else {
          logger.log('⚠️  Admin user already has admin role assigned');
        }
      } catch (error: any) {
        logger.error(`❌ Failed to assign admin role to user: ${error.message}`);
      }
    }

    // Step 6: Verify the fix
    logger.log('\n🔍 Verification:');
    const finalRoles = await rbacService.getAllRoles();
    const finalPermissions = await rbacService.getAllPermissions();
    
    logger.log(`📋 Final state: ${finalPermissions.length} permissions, ${finalRoles.length} roles`);
    
    for (const role of finalRoles) {
      logger.log(`   - ${role.name}: ${role.permissions?.length || 0} permissions`);
    }

    const adminRoleAssignments = await rbacService.getEmployeeRoles(adminUserId);
    logger.log(`👤 Admin user has ${adminRoleAssignments.length} role assignments`);

    logger.log('\n🎉 Comprehensive RBAC Fix completed successfully!');
    
    await app.close();
  } catch (error: any) {
    logger.error('❌ Comprehensive RBAC Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix if this file is executed directly
if (require.main === module) {
  comprehensiveRbacFix();
}

export { comprehensiveRbacFix }; 