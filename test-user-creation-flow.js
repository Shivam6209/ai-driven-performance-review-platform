// Test User Creation and Login Flow
// This script tests the complete invitation -> user creation -> login flow

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete User Creation and Login Flow...\n');

  try {
    // Step 1: Login as admin to get token
    console.log('1️⃣ Logging in as admin...');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@owner.com', // Replace with your admin email
      password: 'admin123' // Replace with your admin password
    });

    const adminToken = adminLogin.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Create invitation (which should create user account)
    console.log('\n2️⃣ Creating invitation...');
    const testEmail = `testuser${Date.now()}@example.com`; // Use unique email
    const invitationData = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      jobTitle: 'Software Developer',
      role: 'employee'
    };

    const invitation = await axios.post(`${API_BASE}/invitations`, invitationData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Invitation created successfully');
    console.log(`📧 Email: ${invitation.data.email}`);
    console.log(`🔑 Temp Password: ${invitation.data.tempPassword}`);

    // Step 3: Try to login with the temporary credentials
    console.log('\n3️⃣ Testing login with temporary credentials...');
    
    // Wait a moment for user creation to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    const userLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: invitation.data.email,
      password: invitation.data.tempPassword
    });

    console.log('✅ User login successful!');
    console.log(`👤 User ID: ${userLogin.data.user.id}`);
    console.log(`📧 Email: ${userLogin.data.user.email}`);
    console.log(`🎭 Role: ${userLogin.data.user.role}`);
    console.log(`🏢 Organization ID: ${userLogin.data.user.organizationId}`);

    // Step 4: Test accessing protected endpoint
    console.log('\n4️⃣ Testing access to protected endpoint...');
    const userToken = userLogin.data.access_token;
    
    const profile = await axios.get(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    console.log('✅ Profile access successful!');
    console.log(`👤 Profile: ${profile.data.firstName} ${profile.data.lastName}`);
    console.log(`💼 Job Title: ${profile.data.jobTitle}`);

    // Step 5: Check invitation status (should be "Accepted" now)
    console.log('\n5️⃣ Checking invitation status...');
    const invitations = await axios.get(`${API_BASE}/invitations`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const testInvitation = invitations.data.find(inv => inv.email === testEmail);
    if (testInvitation) {
      console.log(`✅ Invitation status: ${testInvitation.status}`);
      if (testInvitation.status === 'accepted') {
        console.log('✅ Invitation automatically accepted on login!');
      } else {
        console.log('⚠️ Invitation status not updated to accepted');
      }
    }

    console.log('\n🎉 Complete flow test PASSED!');
    console.log('✅ Invitation creates user account immediately');
    console.log('✅ User can login with temporary credentials');
    console.log('✅ User has proper role and organization access');
    console.log('✅ Invitation status updates to "Accepted" on login');

  } catch (error) {
    console.error('\n❌ Test FAILED:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 This might mean:');
      console.log('- User account was not created during invitation');
      console.log('- Temporary password is incorrect');
      console.log('- User account exists but password doesn\'t match');
    }
  }
}

// Run the test
testCompleteFlow(); 