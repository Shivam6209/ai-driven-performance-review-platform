const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Fix...\n');

  const endpoints = [
    { method: 'GET', url: '/auth/me', description: 'Get current user profile' },
    { method: 'GET', url: '/dashboard', description: 'Get dashboard data' },
    { method: 'GET', url: '/employees', description: 'Get all employees' },
    { method: 'GET', url: '/departments', description: 'Get all departments' },
    { method: 'POST', url: '/feedback', description: 'Create feedback', data: {
      receiverId: 'test-receiver-id',
      content: 'Test feedback content',
      type: 'peer',
      visibility: 'private'
    }},
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint.method} ${endpoint.url} - ${endpoint.description}`);
      
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${API_BASE}${endpoint.url}`,
        timeout: 5000,
      };

      if (endpoint.data) {
        config.data = endpoint.data;
      }

      const response = await axios(config);
      
      console.log(`✅ SUCCESS: ${response.status} ${response.statusText}`);
      if (response.data) {
        console.log(`📄 Response preview:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ FAILED: ${error.response.status} ${error.response.statusText}`);
        console.log(`📄 Error:`, error.response.data?.message || error.message);
      } else {
        console.log(`❌ NETWORK ERROR:`, error.message);
      }
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🏁 Authentication test completed!');
}

// Run the test
testAuthEndpoints().catch(console.error); 