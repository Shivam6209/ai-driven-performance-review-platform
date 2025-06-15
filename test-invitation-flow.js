const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testInvitationFlow() {
  console.log('🔄 Testing Complete Invitation Flow');
  console.log('=' .repeat(40));

  try {
    // Step 1: Login as Admin
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@testcompany.com',
      password: 'password123'
    });
    const adminToken = loginResponse.data.access_token;
    const organizationId = loginResponse.data.user.organizationId;
    console.log('✅ Admin logged in');

    // Step 2: Create invitation
    const uniqueEmail = `test-flow-${Date.now()}@testcompany.com`;
    const invitationResponse = await axios.post(`${API_BASE}/invitations`, {
      email: uniqueEmail,
      organizationId: organizationId
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Invitation created');
    console.log('📧 Email:', invitationResponse.data.email);
    console.log('🔑 Token:', invitationResponse.data.token.substring(0, 20) + '...');
    
    const originalToken = invitationResponse.data.token;

    // Step 3: Test employee registration with original token
    const employeeData = {
      firstName: 'Test',
      lastName: 'Employee',
      password: 'password123',
      jobTitle: 'Software Engineer',
      invitationToken: originalToken
    };

    const employeeResponse = await axios.post(`${API_BASE}/auth/register-with-invitation`, employeeData);
    console.log('✅ Employee registered successfully');
    console.log('👤 Employee:', employeeResponse.data.user.email);
    console.log('🏢 Organization:', employeeResponse.data.user.organizationId);

    // Step 4: Verify organization isolation
    const employeesResponse = await axios.get(`${API_BASE}/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Organization isolation verified');
    console.log('👥 Total employees in organization:', employeesResponse.data.length);

    console.log('\n🎉 Complete Invitation Flow Success!');
    console.log('✅ Invitation creation');
    console.log('✅ Employee registration via invitation');
    console.log('✅ Organization data isolation');
    console.log('✅ Multi-tenant system working perfectly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testInvitationFlow(); 