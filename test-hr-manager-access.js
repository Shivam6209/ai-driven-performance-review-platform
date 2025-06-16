const axios = require('axios');

async function testRoleBasedAccess() {
  try {
    console.log('🧪 Testing Role-Based Employee Access...\n');

    // Test Admin access
    console.log('1️⃣ Testing Admin Access:');
    const adminLogin = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@mailinator.com',
      password: 'password123'
    });
    
    const adminToken = adminLogin.data.access_token;
    const adminEmployees = await axios.get('http://localhost:3001/employees', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    console.log(`   Admin sees ${adminEmployees.data.length} employees`);
    adminEmployees.data.forEach(emp => {
      console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.role}) - Dept: ${emp.department?.name || 'None'}`);
    });

    // Test HR access
    console.log('\n2️⃣ Testing HR Access:');
    try {
      const hrLogin = await axios.post('http://localhost:3001/auth/login', {
        email: 'sarah.hr@mailinator.com',
        password: 'password123'
      });
      
      const hrToken = hrLogin.data.access_token;
      const hrEmployees = await axios.get('http://localhost:3001/employees', {
        headers: { 'Authorization': `Bearer ${hrToken}` }
      });
      
      console.log(`   HR sees ${hrEmployees.data.length} employees`);
      hrEmployees.data.forEach(emp => {
        console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.role}) - Dept: ${emp.department?.name || 'None'}`);
      });
    } catch (hrError) {
      console.log(`   HR login failed: ${hrError.response?.data?.message || hrError.message}`);
    }

    // Test Manager access
    console.log('\n3️⃣ Testing Manager Access:');
    try {
      const managerLogin = await axios.post('http://localhost:3001/auth/login', {
        email: 'john.manager@mailinator.com',
        password: 'password123'
      });
      
      const managerToken = managerLogin.data.access_token;
      const managerEmployees = await axios.get('http://localhost:3001/employees', {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      
      console.log(`   Manager sees ${managerEmployees.data.length} employees`);
      managerEmployees.data.forEach(emp => {
        console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.role}) - Dept: ${emp.department?.name || 'None'}`);
      });
    } catch (managerError) {
      console.log(`   Manager login failed: ${managerError.response?.data?.message || managerError.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRoleBasedAccess(); 