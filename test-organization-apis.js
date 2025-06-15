const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testOrganizationAPIs() {
  console.log('🏢 Testing Organization APIs');
  console.log('=' .repeat(40));

  try {
    // Step 1: Login as Admin
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@testcompany.com',
      password: 'password123'
    });
    const adminToken = loginResponse.data.access_token;
    console.log('✅ Admin logged in');

    // Step 2: Get current organization
    const orgResponse = await axios.get(`${API_BASE}/organizations/current`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Current organization retrieved');
    console.log('🏢 Organization:', {
      id: orgResponse.data.id,
      name: orgResponse.data.name,
      domain: orgResponse.data.domain,
      isActive: orgResponse.data.isActive
    });

    // Step 3: Get organization statistics
    const statsResponse = await axios.get(`${API_BASE}/organizations/current/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Organization statistics retrieved');
    console.log('📊 Statistics:', statsResponse.data);

    // Step 4: Update organization
    const updateData = {
      name: 'Test Company Inc (Updated)',
      domain: 'testcompany.com'
    };
    const updateResponse = await axios.patch(`${API_BASE}/organizations/current`, updateData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Organization updated successfully');
    console.log('📝 Updated name:', updateResponse.data.name);

    // Step 5: Revert the update
    const revertData = {
      name: 'Test Company Inc',
      domain: 'testcompany.com'
    };
    await axios.patch(`${API_BASE}/organizations/current`, revertData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Organization name reverted');

    console.log('\n🎉 All Organization APIs Working!');
    console.log('✅ Get current organization');
    console.log('✅ Get organization statistics');
    console.log('✅ Update organization');
    console.log('✅ Real data instead of mock data');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOrganizationAPIs(); 