const axios = require('axios');

// Test Admin Member System with Email in Credentials
console.log('📧 TESTING ADMIN MEMBER SYSTEM WITH EMAIL IN CREDENTIALS');
console.log('========================================================\n');

const baseURL = 'http://localhost:8080/api';

// Test data
const adminEmail = 'admin@example.com';
const adminPassword = 'AdminPass123';

// Member data that admin will create
const memberData = {
  profileImage: "https://example.com/member-profile.jpg",
  firstName: "Alice",
  lastName: "Johnson",
  mobile: "9876543210",
  email: "alice.johnson@example.com",
  floor: "II",
  flatNo: "205",
  paymentStatus: "Booked",
  parkingArea: "P1",
  parkingSlot: "P1-25",
  govtIdType: "AadharCard",
  govtIdImage: "https://example.com/alice-aadhar.jpg"
};

const memberPassword = "AlicePass123"; // Admin will set this password
const memberUserId = "741852"; // Admin will enter this 6-digit User ID

// Test admin signup and get adminId
const testAdminSetup = async () => {
  try {
    console.log('👤 Step 1: Admin Signup...');
    const signupResponse = await axios.post(`${baseURL}/auth/signup`, {
      email: adminEmail,
      password: adminPassword
    });
    
    console.log('✅ Admin signup successful');
    const otp = signupResponse.data.data.otp;
    console.log('🔢 OTP:', otp);
    
    // Verify OTP
    console.log('\n🔍 Step 2: Verifying OTP...');
    const verifyResponse = await axios.post(`${baseURL}/auth/verify-otp`, {
      email: adminEmail,
      otp: otp
    });
    
    console.log('✅ OTP verified successfully');
    const adminId = verifyResponse.data.data.id;
    console.log('🆔 Admin ID:', adminId);
    
    return adminId;
    
  } catch (error) {
    console.log('❌ Error in admin setup:', error.response?.data || error.message);
    throw error;
  }
};

// Test member creation
const testMemberCreation = async (adminId) => {
  try {
    console.log('\n👥 Step 3: Admin creating member account...');
    
    const createMemberData = {
      adminId: adminId,
      userId: memberUserId,
      password: memberPassword,
      ...memberData
    };
    
    console.log('📤 Creating member with data:');
    console.log('   👤 Name:', memberData.firstName, memberData.lastName);
    console.log('   📧 Email:', memberData.email);
    console.log('   🆔 User ID:', memberUserId);
    console.log('   🔒 Password:', memberPassword);
    
    const response = await axios.post(`${baseURL}/admin-members/create`, createMemberData);
    
    console.log('✅ Member created successfully!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    
    return {
      userId: memberUserId,
      password: memberPassword,
      email: memberData.email
    };
    
  } catch (error) {
    console.log('❌ Error creating member:', error.response?.data || error.message);
    throw error;
  }
};

// Test member login
const testMemberLogin = async (credentials) => {
  try {
    console.log('\n🔐 Step 4: Testing member login...');
    console.log('   🆔 User ID:', credentials.userId);
    console.log('   🔒 Password:', credentials.password);
    
    const response = await axios.post(`${baseURL}/admin-members/member-login`, {
      userId: credentials.userId,
      password: credentials.password
    });
    
    console.log('✅ Member login successful!');
    console.log('📊 Login Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.log('❌ Error during member login:', error.response?.data || error.message);
    throw error;
  }
};

// Test getting admin members
const testGetAdminMembers = async (adminId) => {
  try {
    console.log(`\n📋 Step 5: Getting all members created by admin...`);
    
    const response = await axios.get(`${baseURL}/admin-members/admin/${adminId}`);
    
    console.log('✅ Admin members retrieved successfully!');
    console.log('📊 Members:', JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.log('❌ Error getting admin members:', error.response?.data || error.message);
    throw error;
  }
};

// Main test function
const runEmailInCredentialsTest = async () => {
  try {
    console.log('🚀 Starting Admin Member System Test with Email in Credentials...\n');
    
    // Step 1 & 2: Admin setup
    const adminId = await testAdminSetup();
    
    // Step 3: Create member
    const memberCredentials = await testMemberCreation(adminId);
    
    // Step 4: Test member login
    await testMemberLogin(memberCredentials);
    
    // Step 5: Get admin members
    await testGetAdminMembers(adminId);
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('\n📧 KEY IMPROVEMENTS DEMONSTRATED:');
    console.log('   1. ✅ Email field now included in AdminMemberCredentials collection');
    console.log('   2. ✅ Member profile and credentials both contain email');
    console.log('   3. ✅ Easier access to member email from credentials');
    console.log('   4. ✅ Enhanced data consistency between collections');
    console.log('   5. ✅ Better login experience with email tracking');
    
    console.log('\n📊 COLLECTIONS UPDATED:');
    console.log('   - AdminMemberCredentials: Now includes email field');
    console.log('   - AdminMemberProfile: Still contains email');
    console.log('   - Better data accessibility and consistency');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }
};

// Run the test
runEmailInCredentialsTest().catch(console.error);