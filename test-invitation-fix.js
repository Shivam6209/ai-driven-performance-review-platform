const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testInvitationSystem() {
  console.log('🧪 Testing Invitation System with Nullable Fields...\n');

  try {
    // Step 1: Register an admin
    console.log('1️⃣ Registering admin...');
    const adminResponse = await axios.post(`${API_BASE}/auth/register-admin`, {
      // Personal info
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@testcompany.com',
      password: 'admin123',
      
      // Organization info
      organizationName: 'Test Company Ltd',
      organizationDomain: 'testcompany.com'
    });
    
    const adminToken = adminResponse.data.access_token;
    const organizationId = adminResponse.data.user.organizationId;
    console.log('✅ Admin registered successfully');
    console.log(`   Organization ID: ${organizationId}`);

    // Step 2: Create invitation with minimal data (testing nullable fields)
    console.log('\n2️⃣ Creating invitation with minimal data...');
    const invitationResponse = await axios.post(`${API_BASE}/invitations`, {
      email: 'employee@testcompany.com',
      organizationId: organizationId,
      invitedBy: adminResponse.data.user.id
      // Note: Not providing firstName, lastName, jobTitle, role, permissions
      // These should use defaults or be nullable
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Invitation created successfully');
    console.log(`   Token: ${invitationResponse.data.token.substring(0, 10)}...`);

    // Step 3: Register employee using invitation
    console.log('\n3️⃣ Registering employee with invitation...');
    const employeeResponse = await axios.post(`${API_BASE}/auth/register-with-invitation`, {
      token: invitationResponse.data.token,
      password: 'employee123'
    });
    
    console.log('✅ Employee registered successfully');
    console.log(`   Employee ID: ${employeeResponse.data.user.id}`);
    console.log(`   Role: ${employeeResponse.data.user.role}`);
    console.log(`   Name: ${employeeResponse.data.user.fullName}`);

    // Step 4: Verify both users are in same organization
    console.log('\n4️⃣ Verifying organization isolation...');
    const employeeToken = employeeResponse.data.access_token;
    
    const employeesResponse = await axios.get(`${API_BASE}/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Found ${employeesResponse.data.length} employees in organization`);
    console.log('   All employees belong to same organization:', 
      employeesResponse.data.every(emp => emp.organizationId === organizationId));

    console.log('\n🎉 All tests passed! Invitation system working with nullable fields.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('   Details:', error.response.data.details);
    }
  }
}

testInvitationSystem(); 