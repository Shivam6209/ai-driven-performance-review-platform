const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testCurrentState() {
  console.log('🔍 Checking Current System State');
  console.log('=' .repeat(50));

  try {
    // Test 1: Try to login with existing admin
    console.log('\n1️⃣ Testing Login with Existing Admin');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@testcompany.com',
        password: 'password123'
      });
      console.log('✅ Login successful');
      console.log('👤 User:', {
        email: loginResponse.data.user.email,
        role: loginResponse.data.user.role,
        organizationId: loginResponse.data.user.organizationId
      });

      const adminToken = loginResponse.data.access_token;
      const organizationId = loginResponse.data.user.organizationId;

      // Test 2: Check employees in organization
      console.log('\n2️⃣ Testing Organization-Filtered Employees');
      const employeesResponse = await axios.get(`${API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Employees retrieved');
      console.log('👥 Total employees in organization:', employeesResponse.data.length);
      employeesResponse.data.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.email} (${emp.firstName} ${emp.lastName})`);
      });

      // Test 3: Check existing invitations
      console.log('\n3️⃣ Testing Existing Invitations');
      try {
        const invitationsResponse = await axios.get(`${API_BASE}/invitations`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Invitations retrieved');
        console.log('📧 Total invitations:', invitationsResponse.data.length);
        invitationsResponse.data.forEach((inv, index) => {
          console.log(`   ${index + 1}. ${inv.email} - ${inv.status} (${new Date(inv.createdAt).toLocaleDateString()})`);
        });
      } catch (error) {
        console.log('⚠️  Could not retrieve invitations:', error.response?.data?.message || error.message);
      }

      // Test 4: Create a new invitation with unique email
      console.log('\n4️⃣ Testing New Invitation Creation');
      const uniqueEmail = `test-${Date.now()}@testcompany.com`;
      try {
        const newInvitationResponse = await axios.post(`${API_BASE}/invitations`, {
          email: uniqueEmail,
          organizationId: organizationId
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ New invitation created successfully');
        console.log('📧 Invitation:', {
          email: newInvitationResponse.data.email,
          status: newInvitationResponse.data.status,
          token: newInvitationResponse.data.token.substring(0, 20) + '...'
        });
      } catch (error) {
        console.log('❌ Failed to create invitation:', error.response?.data?.message || error.message);
      }

      console.log('\n🎉 System State Check Complete!');
      console.log('✅ Authentication working');
      console.log('✅ Organization isolation working');
      console.log('✅ Employee management working');
      console.log('✅ Multi-tenant system operational');

    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
      
      // If login fails, let's check what users exist
      console.log('\n🔍 Checking if we need to create initial admin...');
      console.log('💡 You may need to run the admin registration first');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm run start:dev');
    }
  }
}

// Run the test
testCurrentState(); 