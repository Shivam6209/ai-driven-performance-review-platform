const { Client } = require('pg');

async function checkDatabaseRoles() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'performance_review_db',
    user: 'postgres',
    password: 'postgres123',
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database');

    // Check employees table
    const result = await client.query(`
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        role, 
        is_active,
        organization_id
      FROM employees 
      ORDER BY role, first_name
    `);

    console.log(`\n📊 Found ${result.rows.length} employees in database:\n`);

    result.rows.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.first_name} ${emp.last_name}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Role: ${emp.role}`);
      console.log(`   Active: ${emp.is_active}`);
      console.log(`   Org ID: ${emp.organization_id}`);
      console.log('');
    });

    // Check role distribution
    const roleDistribution = result.rows.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Role Distribution:');
    Object.entries(roleDistribution).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabaseRoles(); 