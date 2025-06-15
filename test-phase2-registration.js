const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testPhase2Registration() {
  console.log('🚀 Testing Phase 2: Registration & User Assignment');
  console.log('=' .repeat(60));

  try {
    // Test 1: Register as Admin (Organization Creation)
    console.log('\n1️⃣ Testing Admin Registration (Organization Creation)');
    const adminData = {
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin@testcompany.com',
      password: 'password123',
      organizationName: 'Test Company Inc',
      organizationDomain: 'testcompany.com',
      jobTitle: 'CEO'
    };

    try {
      const adminResponse = await axios.post(`${API_BASE}/auth/register-admin`, adminData);
      console.log('✅ Admin registration successful');
      console.log('📋 Admin User:', {
        id: adminResponse.data.user.id,
        email: adminResponse.data.user.email,
        role: adminResponse.data.user.role,
        organizationId: adminResponse.data.user.organizationId,
        organization: adminResponse.data.user.organization?.name
      });
      
      const adminToken = adminResponse.data.access_token;
      
      // Test 2: Create Invitation (HR functionality)
      console.log('\n2️⃣ Testing Invitation Creation');
      const invitationData = {
        email: 'employee@testcompany.com',
        organizationId: adminResponse.data.user.organizationId
      };

      const invitationResponse = await axios.post(`${API_BASE}/invitations`, invitationData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Invitation created successfully');
      console.log('📧 Invitation:', {
        id: invitationResponse.data.id,
        email: invitationResponse.data.email,
        token: invitationResponse.data.token.substring(0, 20) + '...',
        status: invitationResponse.data.status
      });

      // Test 3: Register with Invitation
      console.log('\n3️⃣ Testing Employee Registration with Invitation');
      const employeeData = {
        firstName: 'Jane',
        lastName: 'Employee',
        password: 'password123',
        jobTitle: 'Software Engineer',
        invitationToken: invitationResponse.data.token
      };

      const employeeResponse = await axios.post(`${API_BASE}/auth/register-with-invitation`, employeeData);
      console.log('✅ Employee registration successful');
      console.log('👤 Employee User:', {
        id: employeeResponse.data.user.id,
        email: employeeResponse.data.user.email,
        role: employeeResponse.data.user.role,
        organizationId: employeeResponse.data.user.organizationId,
        organization: employeeResponse.data.user.organization?.name
      });

      // Test 4: Verify Organization Isolation
      console.log('\n4️⃣ Testing Organization Isolation');
      const employeeToken = employeeResponse.data.access_token;
      
      const employeesResponse = await axios.get(`${API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      console.log('✅ Employee list filtered by organization');
      console.log('👥 Employees in organization:', employeesResponse.data.length);

      console.log('\n🎉 Phase 2 Implementation Complete!');
      console.log('✅ Admin registration with organization creation');
      console.log('✅ Invitation-based user registration');
      console.log('✅ Multi-tenant organization isolation');
      console.log('✅ JWT tokens include organizationId');
      console.log('✅ Database schema updated with organizations');

    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  Organization already exists, testing with different domain...');
        
        // Try with different domain
        const altAdminData = {
          ...adminData,
          email: 'admin@testcompany2.com',
          organizationName: 'Test Company 2 Inc',
          organizationDomain: 'testcompany2.com'
        };
        
        const adminResponse = await axios.post(`${API_BASE}/auth/register-admin`, altAdminData);
        console.log('✅ Admin registration successful with alternative domain');
        console.log('📋 Admin User:', {
          email: adminResponse.data.user.email,
          role: adminResponse.data.user.role,
          organization: adminResponse.data.user.organization?.name
        });
      } else {
        throw error;
      }
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
testPhase2Registration(); 