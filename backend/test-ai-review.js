const axios = require('axios');

// Test AI Review Generation
async function testAIReviewGeneration() {
  console.log('🧪 Testing AI Review Generation System');
  console.log('=====================================\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. Test AI Review Generation
    console.log('1. 🤖 Testing AI Review Generation...');
    
    const reviewData = {
      employeeId: 'test-employee-id',
      reviewType: 'manager',
      focusAreas: ['performance', 'collaboration', 'leadership'],
    };

    const response = await axios.post(`${baseURL}/reviews/generate-ai`, reviewData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token-here'
      }
    });

    console.log('✅ AI Review Generated Successfully!');
    console.log('📊 Review Data:');
    console.log(`   - Confidence Score: ${(response.data.confidenceScore * 100).toFixed(1)}%`);
    console.log(`   - Strengths: ${response.data.strengths.substring(0, 100)}...`);
    console.log(`   - Areas for Improvement: ${response.data.areasForImprovement.substring(0, 100)}...`);
    console.log(`   - Sources: ${response.data.sources.okrs.length} OKRs, ${response.data.sources.feedback.length} Feedback items`);
    
    // 2. Test Vector Search
    console.log('\n2. 🔍 Testing Vector Search...');
    
    const searchQuery = {
      query: 'leadership collaboration performance',
      limit: 10
    };

    const searchResponse = await axios.post(`${baseURL}/ai/search-context`, searchQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token-here'
      }
    });

    console.log('✅ Vector Search Completed!');
    console.log(`📋 Found ${searchResponse.data.results.length} relevant items`);
    
    // 3. Test Data Quality Assessment
    console.log('\n3. 📈 Testing Data Quality Assessment...');
    
    const qualityResponse = await axios.get(`${baseURL}/reviews/data-quality/test-employee-id`, {
      headers: {
        'Authorization': 'Bearer your-jwt-token-here'
      }
    });

    console.log('✅ Data Quality Assessment Completed!');
    console.log(`   - OKR Data Quality: ${qualityResponse.data.okrData}%`);
    console.log(`   - Feedback Data Quality: ${qualityResponse.data.feedbackData}%`);
    console.log(`   - Overall Score: ${qualityResponse.data.overallScore}%`);

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Note: You need to authenticate first. Update the JWT token in the script.');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Note: Make sure the backend server is running on http://localhost:3001');
    }
  }
}

// Test OpenAI Integration
async function testOpenAIIntegration() {
  console.log('\n🔬 Testing OpenAI Integration');
  console.log('==============================\n');

  try {
    const testPrompt = {
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates performance reviews.'
        },
        {
          role: 'user',
          content: 'Generate a brief performance review for an employee who completed 85% of their OKRs and received positive feedback about collaboration.'
        }
      ]
    };

    const response = await axios.post('http://localhost:3001/ai/test-openai', testPrompt, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token-here'
      }
    });

    console.log('✅ OpenAI Integration Working!');
    console.log('📝 Generated Content:');
    console.log(response.data.content);

  } catch (error) {
    console.error('❌ OpenAI Test Failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Note: Please set your OPENAI_API_KEY in the .env file');
    }
  }
}

// Test Pinecone Integration
async function testPineconeIntegration() {
  console.log('\n🌲 Testing Pinecone Integration');
  console.log('===============================\n');

  try {
    const testData = {
      text: 'This employee shows excellent leadership skills and consistently delivers high-quality work.',
      metadata: {
        employeeId: 'test-employee',
        contentType: 'feedback',
        tags: ['leadership', 'quality']
      }
    };

    const response = await axios.post('http://localhost:3001/ai/test-pinecone', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token-here'
      }
    });

    console.log('✅ Pinecone Integration Working!');
    console.log('🔢 Vector Details:');
    console.log(`   - Embedding Dimensions: ${response.data.dimensions}`);
    console.log(`   - Vector ID: ${response.data.vectorId}`);
    console.log(`   - Similarity Score: ${response.data.similarityScore}`);

  } catch (error) {
    console.error('❌ Pinecone Test Failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('PINECONE_API_KEY')) {
      console.log('\n💡 Note: Please set your PINECONE_API_KEY and PINECONE_ENVIRONMENT in the .env file');
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 AI-Driven Performance Review System Tests');
  console.log('=============================================\n');

  await testAIReviewGeneration();
  await testOpenAIIntegration();
  await testPineconeIntegration();

  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Set up your .env file with API keys:');
  console.log('   - OPENAI_API_KEY=your-openai-key');
  console.log('   - PINECONE_API_KEY=your-pinecone-key');
  console.log('   - PINECONE_ENVIRONMENT=your-pinecone-environment');
  console.log('   - PINECONE_INDEX_NAME=performance-reviews');
  console.log('2. Start the backend server: npm run start:dev');
  console.log('3. Test the endpoints with proper authentication');
}

// Run tests
runAllTests().catch(console.error); 