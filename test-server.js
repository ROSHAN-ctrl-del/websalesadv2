import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Test endpoints without authentication first
async function testPublicEndpoints() {
  console.log('🧪 Testing public endpoints...');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health endpoint:', healthResponse.data);
    
    // Test API documentation endpoint
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API endpoint:', apiResponse.data);
    
  } catch (error) {
    console.log('❌ Public endpoint test failed:', error.response?.data || error.message);
  }
}

// Test protected endpoints (will fail without auth)
async function testProtectedEndpoints() {
  console.log('\n🔒 Testing protected endpoints (should fail without auth)...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/sales-admins`);
    console.log('❌ Unexpected success:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Sales admins endpoint protected (401 Unauthorized)');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
    }
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/users`);
    console.log('❌ Unexpected success:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Users endpoint protected (401 Unauthorized)');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
    }
  }
}

// Test with a mock token
async function testWithMockToken() {
  console.log('\n🎭 Testing with mock token...');
  
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzM1NjgwMDAwfQ.example';
  
  try {
    const response = await axios.get(`${BASE_URL}/api/sales-admins`, {
      headers: {
        'Authorization': `Bearer ${mockToken}`
      }
    });
    console.log('✅ Sales admins with token:', response.data);
  } catch (error) {
    console.log('❌ Sales admins with token failed:', error.response?.status, error.response?.data);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting server tests...\n');
  
  await testPublicEndpoints();
  await testProtectedEndpoints();
  await testWithMockToken();
  
  console.log('\n📋 Test Summary:');
  console.log('• If public endpoints work: Server is running ✅');
  console.log('• If protected endpoints return 401: Authentication is working ✅');
  console.log('• If you see MongoDB connection errors: MongoDB needs to be started');
  console.log('\n💡 Next steps:');
  console.log('1. Start MongoDB: npm run test:mongodb');
  console.log('2. Start server: npm start');
  console.log('3. Test with real authentication');
}

runTests().catch(console.error); 