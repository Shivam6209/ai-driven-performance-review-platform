const axios = require('axios');

// Test the public OKR creation endpoint
async function testPublicOKRCreation() {
  try {
    console.log('🧪 Testing Public OKR Creation Endpoint...');
    
    const baseURL = 'http://localhost:3000'; // Adjust if your backend runs on different port
    
    // Test data for creating an OKR
    const testOKR = {
      title: 'Test Public OKR',
      description: 'This is a test OKR created via public endpoint',
      level: 'individual',
      status: 'draft',
      progress: 0,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };

    console.log('📤 Sending POST request to /api/okr/objectives...');
    console.log('📋 Test data:', JSON.stringify(testOKR, null, 2));

    // Make the request without authentication
    const response = await axios.post(`${baseURL}/api/okr/objectives`, testOKR, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success! OKR created successfully');
    console.log('📊 Response status:', response.status);
    console.log('📋 Created OKR:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.log('❌ Request failed with status:', error.response.status);
      console.log('📋 Error response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('❌ No response received. Is the backend running?');
      console.log('🔗 Make sure the backend is running on http://localhost:3000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Test different OKR levels
async function testDifferentOKRLevels() {
  const levels = ['individual', 'department', 'company'];
  
  for (const level of levels) {
    console.log(`\n🧪 Testing ${level} level OKR...`);
    
    try {
      const testOKR = {
        title: `Test ${level} OKR`,
        description: `This is a test ${level} level OKR`,
        level: level,
        status: 'draft',
        progress: 0,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const response = await axios.post('http://localhost:3000/api/okr/objectives', testOKR);
      console.log(`✅ ${level} OKR created successfully`);
      
    } catch (error) {
      console.log(`❌ ${level} OKR creation failed:`, error.response?.data?.message || error.message);
    }
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Public OKR Creation Tests\n');
  
  await testPublicOKRCreation();
  await testDifferentOKRLevels();
  
  console.log('\n✨ Tests completed!');
}

runTests(); 