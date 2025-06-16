const axios = require('axios');

async function testEmployeeRoles() {
  try {
    console.log('🧪 Testing Employee Roles API...\n');

    // Test HR Admin login (this is the main admin in seed data)
    console.log('1️⃣ Testing HR Admin Access:');
    const hrAdminLogin = await axios.post('http://localhost:3001/auth/login', {
      email: 'hr.admin@company.com',
      password: 'password123'
    });

    const hrAdminToken = hrAdminLogin.data.access_token;
    console.log('✅ HR Admin login successful');

    // Get employees list as HR Admin
    const employeesResponse = await axios.get('http://localhost:3001/employees', {
      headers: {
        'Authorization': `Bearer ${hrAdminToken}`
      }
    });

    const employees = employeesResponse.data;
    console.log(`📊 HR Admin sees ${employees.length} employees:\n`);

    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Role: ${emp.role}`);
      console.log(`   Department: ${emp.department ? emp.department.name : 'None'}`);
      console.log(`   Active: ${emp.isActive}`);
      console.log('');
    });

    // Check if roles are correct
    const roleDistribution = employees.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Role Distribution:');
    Object.entries(roleDistribution).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

    // Test Manager access
    console.log('\n2️⃣ Testing Engineering Manager Access:');
    try {
      const managerLogin = await axios.post('http://localhost:3001/auth/login', {
        email: 'john.smith@company.com',
        password: 'password123'
      });
      
      const managerToken = managerLogin.data.access_token;
      const managerEmployees = await axios.get('http://localhost:3001/employees', {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      
      console.log(`Engineering Manager sees ${managerEmployees.data.length} employees:`);
      managerEmployees.data.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.role}) - Dept: ${emp.department?.name || 'None'}`);
      });
    } catch (managerError) {
      console.log(`Manager access failed: ${managerError.response?.data?.message || managerError.message}`);
    }

    // Test Marketing Manager access
    console.log('\n3️⃣ Testing Marketing Manager Access:');
    try {
      const mktManagerLogin = await axios.post('http://localhost:3001/auth/login', {
        email: 'emily.davis@company.com',
        password: 'password123'
      });
      
      const mktManagerToken = mktManagerLogin.data.access_token;
      const mktManagerEmployees = await axios.get('http://localhost:3001/employees', {
        headers: { 'Authorization': `Bearer ${mktManagerToken}` }
      });
      
      console.log(`Marketing Manager sees ${mktManagerEmployees.data.length} employees:`);
      mktManagerEmployees.data.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.role}) - Dept: ${emp.department?.name || 'None'}`);
      });
    } catch (mktManagerError) {
      console.log(`Marketing Manager access failed: ${mktManagerError.response?.data?.message || mktManagerError.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEmployeeRoles(); 