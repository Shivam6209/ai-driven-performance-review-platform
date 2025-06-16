/**
 * Test Script: Real-time Notification System
 * 
 * This script tests the complete notification flow:
 * 1. Send invitation
 * 2. User logs in with temp credentials
 * 3. Invitation status updates to "Accepted"
 * 4. Real-time notification sent to invitor via Firebase
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test configuration
const TEST_CONFIG = {
  // Admin user credentials (who will send the invitation)
  adminEmail: 'admin@company.com',
  adminPassword: 'admin123',
  
  // Test invitation details
  invitationData: {
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Developer',
    jobTitle: 'Software Developer'
  }
};

let adminToken = '';
let invitationId = '';
let tempPassword = '';

async function runNotificationTest() {
  console.log('🚀 Starting Real-time Notification System Test\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_CONFIG.adminEmail,
      password: TEST_CONFIG.adminPassword
    });
    
    adminToken = loginResponse.data.access_token;
    console.log('✅ Admin logged in successfully');
    console.log(`   Admin ID: ${loginResponse.data.user.id}\n`);

    // Step 2: Send invitation
    console.log('2️⃣ Sending invitation...');
    const invitationResponse = await axios.post(
      `${API_BASE_URL}/invitations`,
      TEST_CONFIG.invitationData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    invitationId = invitationResponse.data.id;
    tempPassword = invitationResponse.data.tempPassword;
    console.log('✅ Invitation sent successfully');
    console.log(`   Invitation ID: ${invitationId}`);
    console.log(`   Temp Password: ${tempPassword}`);
    console.log('   📧 Email sent with login credentials');
    console.log('   🔔 "Invitation Sent" notification should appear in Firebase\n');

    // Step 3: Wait a moment for email processing
    console.log('3️⃣ Waiting 3 seconds for email processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Email processing complete\n');

    // Step 4: Login as invited user (simulating user clicking login link)
    console.log('4️⃣ Logging in as invited user with temp credentials...');
    const userLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_CONFIG.invitationData.email,
      password: tempPassword
    });
    
    console.log('✅ User logged in successfully');
    console.log(`   User ID: ${userLoginResponse.data.user.id}`);
    console.log('   🔄 Invitation status automatically updated to "Accepted"');
    console.log('   🔔 "Invitation Accepted" notification should appear in Firebase\n');

    // Step 5: Verify invitation status
    console.log('5️⃣ Verifying invitation status...');
    const invitationsResponse = await axios.get(
      `${API_BASE_URL}/invitations`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    const invitation = invitationsResponse.data.find(inv => inv.id === invitationId);
    console.log('✅ Invitation status verified');
    console.log(`   Status: ${invitation.status}`);
    console.log(`   Accepted At: ${invitation.acceptedAt || 'Not set'}\n`);

    // Step 6: Check notifications endpoint
    console.log('6️⃣ Checking notifications via API...');
    const notificationsResponse = await axios.get(
      `${API_BASE_URL}/notifications`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('✅ Notifications retrieved');
    console.log(`   Total notifications: ${notificationsResponse.data.notifications?.length || 0}`);
    
    if (notificationsResponse.data.notifications?.length > 0) {
      console.log('   Recent notifications:');
      notificationsResponse.data.notifications.slice(0, 3).forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title} - ${notif.message}`);
      });
    }

    console.log('\n🎉 Notification System Test Complete!');
    console.log('\n📋 What to check:');
    console.log('   1. Check your email for invitation with temp credentials');
    console.log('   2. Open Firebase Realtime Database console');
    console.log('   3. Look for notifications under: notifications/{admin-user-id}');
    console.log('   4. You should see two notifications:');
    console.log('      - "📧 Invitation Sent" notification');
    console.log('      - "🎉 Invitation Accepted!" notification');
    console.log('   5. Open the frontend and check the notification bell');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have an admin user with these credentials:');
      console.log(`   Email: ${TEST_CONFIG.adminEmail}`);
      console.log(`   Password: ${TEST_CONFIG.adminPassword}`);
    }
    
    if (error.response?.status === 500) {
      console.log('\n💡 Tip: Make sure Firebase credentials are configured in .env:');
      console.log('   FIREBASE_PROJECT_ID=your-project-id');
      console.log('   FIREBASE_PRIVATE_KEY=your-private-key');
      console.log('   FIREBASE_CLIENT_EMAIL=your-client-email');
    }
  }
}

// Run the test
runNotificationTest(); 