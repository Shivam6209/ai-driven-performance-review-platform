const axios = require('axios');

async function testDepartmentAssignments() {
  try {
    console.log('🧪 Testing Department Assignments...\n');

    // Login as admin to get all data
    const adminLogin = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@mailinator.com',
      password: 'password123'
    });
    
    const adminToken = adminLogin.data.access_token;
    
    // Get all employees
    console.log('📊 Getting all employees...');
    const employeesResponse = await axios.get('http://localhost:3001/employees', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const employees = employeesResponse.data;
    console.log(`Found ${employees.length} employees:\n`);
    
    employees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName} (${emp.role})`);
      console.log(`  Email: ${emp.email}`);
      console.log(`  Department: ${emp.department?.name || 'NONE'}`);
      console.log(`  Department ID: ${emp.department?.id || 'NONE'}`);
      console.log('');
    });

    // Get all departments
    console.log('\n🏢 Getting all departments...');
    const departmentsResponse = await axios.get('http://localhost:3001/departments', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const departments = departmentsResponse.data;
    console.log(`Found ${departments.length} departments:\n`);
    
    departments.forEach(dept => {
      console.log(`- ${dept.name} (ID: ${dept.id})`);
      console.log(`  Manager: ${dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'NONE'}`);
      console.log(`  HR Personnel: ${dept.hrPersonnel?.length || 0} assigned`);
      if (dept.hrPersonnel?.length > 0) {
        dept.hrPersonnel.forEach(hr => {
          console.log(`    - ${hr.firstName} ${hr.lastName}`);
        });
      }
      console.log(`  Employees: ${dept.employees?.length || 0} assigned`);
      console.log('');
    });

    // Test HR login
    console.log('\n👩‍💼 Testing HR Access...');
    try {
      const hrLogin = await axios.post('http://localhost:3001/auth/login', {
        email: 'sarah.hr@mailinator.com',
        password: 'password123'
      });
      
      const hrToken = hrLogin.data.access_token;
      const hrEmployees = await axios.get('http://localhost:3001/employees', {
        headers: { 'Authorization': `Bearer ${hrToken}` }
      });
      
      console.log(`HR sees ${hrEmployees.data.length} employees:`);
      hrEmployees.data.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.role}) - Dept: ${emp.department?.name || 'None'}`);
      });
    } catch (hrError) {
      console.log(`HR access failed: ${hrError.response?.data?.message || hrError.message}`);
    }

    // Test Manager login
    console.log('\n👨‍💼 Testing Manager Access...');
    try {
      const managerLogin = await axios.post('http://localhost:3001/auth/login', {
        email: 'john.manager@mailinator.com',
        password: 'password123'
      });
      
      const managerToken = managerLogin.data.access_token;
      const managerEmployees = await axios.get('http://localhost:3001/employees', {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      
      console.log(`Manager sees ${managerEmployees.data.length} employees:`);
      managerEmployees.data.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.role}) - Dept: ${emp.department?.name || 'None'}`);
      });
    } catch (managerError) {
      console.log(`Manager access failed: ${managerError.response?.data?.message || managerError.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDepartmentAssignments(); 