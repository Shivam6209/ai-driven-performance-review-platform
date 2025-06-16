import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

async function checkRolePermissions() {
  const logger = new Logger('CheckRolePermissions');
  
  try {
    logger.log('🔍 Checking role permissions...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    // Check all roles and their permissions
    const rolesWithPermissions = await dataSource.query(`
      SELECT 
        r.id as role_id,
        r.name as role_name,
        r.description,
        COUNT(rp.permission_id) as permission_count,
        STRING_AGG(p.name, ', ') as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name, r.description
      ORDER BY r.name
    `);

    logger.log(`📊 Found ${rolesWithPermissions.length} roles:`);
    
    rolesWithPermissions.forEach(role => {
      logger.log(`\n🎭 Role: ${role.role_name}`);
      logger.log(`   Description: ${role.description}`);
      logger.log(`   Permissions: ${role.permission_count}`);
      if (role.permissions) {
        logger.log(`   List: ${role.permissions}`);
      } else {
        logger.error(`   ❌ NO PERMISSIONS ASSIGNED!`);
      }
    });

    // Check if permissions exist at all
    const allPermissions = await dataSource.query(`
      SELECT id, name, resource, action FROM permissions ORDER BY name
    `);

    logger.log(`\n📋 Total permissions in system: ${allPermissions.length}`);
    allPermissions.forEach(perm => {
      logger.log(`   - ${perm.name} (${perm.resource}:${perm.action})`);
    });

    // Check role_permissions table
    const rolePermissionMappings = await dataSource.query(`
      SELECT 
        r.name as role_name,
        p.name as permission_name
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      ORDER BY r.name, p.name
    `);

    logger.log(`\n🔗 Role-Permission mappings: ${rolePermissionMappings.length}`);
    if (rolePermissionMappings.length === 0) {
      logger.error(`❌ NO ROLE-PERMISSION MAPPINGS FOUND! This is the problem!`);
    } else {
      rolePermissionMappings.forEach(mapping => {
        logger.log(`   ${mapping.role_name} -> ${mapping.permission_name}`);
      });
    }

    await app.close();
  } catch (error: any) {
    logger.error('❌ Check failed:', error);
    process.exit(1);
  }
}

// Run the check
checkRolePermissions(); 