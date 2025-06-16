const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testDepartmentAssignmentNotifications() {
  console.log('🧪 Testing Department Assignment Notifications...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const adminToken = loginResponse.data.access_token;
    console.log('✅ Admin logged in successfully');

    // Step 2: Get all employees
    console.log('\n2. Getting all employees...');
    const employeesResponse = await axios.get(`${API_BASE_URL}/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const employees = employeesResponse.data;
    console.log(`✅ Found ${employees.length} employees`);

    // Find an employee to assign (not admin)
    const employeeToAssign = employees.find(emp => emp.role === 'employee');
    if (!employeeToAssign) {
      console.log('❌ No employee found for testing');
      return;
    }

    console.log(`📋 Selected employee: ${employeeToAssign.firstName} ${employeeToAssign.lastName} (${employeeToAssign.email})`);

    // Step 3: Get all departments
    console.log('\n3. Getting all departments...');
    const departmentsResponse = await axios.get(`${API_BASE_URL}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const departments = departmentsResponse.data;
    if (departments.length === 0) {
      console.log('❌ No departments found for testing');
      return;
    }

    const targetDepartment = departments[0];
    console.log(`🏢 Selected department: ${targetDepartment.name}`);

    // Step 4: Assign employee to department
    console.log('\n4. Assigning employee to department...');
    const assignResponse = await axios.post(`${API_BASE_URL}/employees/assign-department`, {
      employeeId: employeeToAssign.id,
      departmentId: targetDepartment.id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Employee assigned to department successfully');
    console.log('📧 Notification should be sent to employee');

    console.log('\n🎉 Department assignment notification test completed!');
    console.log('\n📝 To verify notifications:');
    console.log('1. Login as the assigned employee');
    console.log('2. Check the notification bell in the header');
    console.log('3. You should see department assignment notification');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDepartmentAssignmentNotifications(); 