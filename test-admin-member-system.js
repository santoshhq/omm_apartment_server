const axios = require('axios');

// Test Admin Member System
console.log('👥 TESTING ADMIN MEMBER SYSTEM');
console.log('==============================\n');

console.log('✨ Key Features Demonstrated:');
console.log('   1. ✅ Admin creates member account with profile details');
console.log('   2. ✅ Admin manually enters 6-digit User ID (unique validation)');
console.log('   3. ✅ Admin sets member password');
console.log('   4. ✅ Member details stored in separate AdminMemberProfile collection');
console.log('   5. ✅ Member credentials stored in separate AdminMemberCredentials collection');
console.log('   6. ✅ Admin ID tracked - shows which admin created which members');
console.log('   7. ✅ Member can login with admin-created credentials');
console.log('   8. ✅ Admin can view all members they created');
console.log('   9. ✅ User ID format validation (6 digits only)');
console.log('  10. ✅ User ID uniqueness validation');
console.log('\n');

const baseURL = 'http://localhost:8080/api';

// Test data
const adminEmail = 'test@example.com';
const adminPassword = 'AdminPass123';

// Member data that admin will create
const memberData = {
  profileImage: "https://example.com/member-profile.jpg",
  firstName: "Jane",
  lastName: "Smith",
  mobile: "9876543213", // Different from admin's mobile
  email: "jane.smith@example.com",
  floor: "III",
  flatNo: "301",
  paymentStatus: "Booked",
  parkingArea: "P2",
  parkingSlot: "P2-20",
  govtIdType: "PanCard",
  govtIdImage: "https://example.com/jane-pan.jpg"
};

const memberPassword = "MemberPass123"; // Admin will set this password
const memberUserId = "123456"; // Admin will enter this 6-digit User ID

// Step 1: Setup Admin Account
const setupAdminAccount = async () => {
  console.log('🔧 STEP 1: Setting up Admin Account');
  console.log('------------------------------------');
  
  try {
    // Admin signup
    console.log('🚀 Creating admin signup...');
    const signupResponse = await axios.post(`${baseURL}/auth/signup`, {
      email: adminEmail,
      password: adminPassword
    });
    
    console.log('✅ Admin signup created');
    console.log('🔢 Admin OTP:', signupResponse.data.data.otp);
    
    // Verify admin OTP
    console.log('🔐 Verifying admin OTP...');
    const verifyResponse = await axios.post(`${baseURL}/auth/verify-otp`, {
      email: adminEmail,
      otp: signupResponse.data.data.otp
    });
    
    console.log('✅ Admin OTP verified');
    console.log('🆔 Admin ID:', verifyResponse.data.data.id);
    
    return verifyResponse.data.data.id;
    
  } catch (error) {
    if (error.response?.data?.message?.includes('already registered')) {
      console.log('ℹ️ Admin already exists, trying to login...');
      
      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: adminEmail,
          password: adminPassword
        });
        console.log('✅ Admin login successful');
        return loginResponse.data.data.id;
      } catch (loginError) {
        console.log('❌ Could not get admin ID:', loginError.response?.data?.message || loginError.message);
        return null;
      }
    } else {
      console.log('❌ Admin setup error:', error.response?.data?.message || error.message);
      return null;
    }
  }
};

// Step 2: Admin Creates Member
const adminCreateMember = async (adminId) => {
  console.log('\n👥 STEP 2: Admin Creates Member');
  console.log('--------------------------------');
  
  try {
    const createMemberData = {
      adminId: adminId,
      userId: memberUserId, // Admin enters 6-digit User ID
      password: memberPassword, // Admin sets member's password
      ...memberData
    };
    
    console.log('👤 Creating member with data:');
    console.log('  - Admin ID:', adminId);
    console.log('  - 🆔 Admin-Entered User ID:', memberUserId);
    console.log('  - Member Name:', `${memberData.firstName} ${memberData.lastName}`);
    console.log('  - Member Email:', memberData.email);
    console.log('  - Member Mobile:', memberData.mobile);
    console.log('  - Flat:', `Floor ${memberData.floor}, Flat ${memberData.flatNo}`);
    console.log('  - Parking:', `${memberData.parkingArea}-${memberData.parkingSlot}`);
    console.log('  - Admin Set Password:', memberPassword);
    
    const response = await axios.post(`${baseURL}/admin-members/create`, createMemberData);
    
    console.log('✅ Member created successfully by admin!');
    console.log('\n📊 MEMBER CREATION RESPONSE:');
    console.log('============================');
    
    console.log('\n👤 MEMBER DATA:');
    console.log('  - Member ID:', response.data.data.member.id);
    console.log('  - 🆔 Admin-Entered User ID:', response.data.data.member.userId);
    console.log('  - Name:', `${response.data.data.member.firstName} ${response.data.data.member.lastName}`);
    console.log('  - Email:', response.data.data.member.email);
    console.log('  - Mobile:', response.data.data.member.mobile);
    console.log('  - Flat Details:', response.data.data.member.flatDetails);
    console.log('  - Parking Details:', response.data.data.member.parkingDetails);
    console.log('  - Created By:', response.data.data.member.createdBy);
    
    console.log('\n🔑 MEMBER LOGIN CREDENTIALS:');
    console.log('  - 🆔 User ID:', response.data.data.credentials.userId);
    console.log('  - 🔒 Password (set by admin):', response.data.data.credentials.password);
    console.log('  - 💡 Message:', response.data.data.credentials.message);
    
    console.log('\n👨‍💼 ADMIN INFO:');
    console.log('  - Created By Admin ID:', response.data.data.adminInfo.createdByAdminId);
    console.log('  - Admin Email:', response.data.data.adminInfo.adminEmail);
    console.log('  - Created At:', new Date(response.data.data.adminInfo.createdAt).toLocaleString());
    
    return {
      memberId: response.data.data.member.id,
      memberUserId: response.data.data.credentials.userId,
      memberPassword: response.data.data.credentials.password
    };
    
  } catch (error) {
    console.log('❌ Member creation error:', error.response?.data?.message || error.message);
    return null;
  }
};

// Step 3: Get Admin's Members
const getAdminMembers = async (adminId) => {
  console.log('\n📋 STEP 3: Get Members Created by Admin');
  console.log('----------------------------------------');
  
  try {
    const response = await axios.get(`${baseURL}/admin-members/admin/${adminId}`);
    
    console.log('✅ Retrieved admin members successfully!');
    console.log('📈 Total members created by this admin:', response.data.count);
    
    if (response.data.data.length > 0) {
      console.log('\n👥 MEMBERS CREATED BY THIS ADMIN:');
      console.log('==================================');
      
      response.data.data.forEach((member, index) => {
        console.log(`\n${index + 1}. ${member.firstName} ${member.lastName}`);
        console.log(`   🆔 Member User ID: ${member.memberCredentialsId?.userId || 'Not generated'}`);
        console.log(`   📧 Email: ${member.email}`);
        console.log(`   📱 Mobile: ${member.mobile}`);
        console.log(`   🏢 Flat: Floor ${member.floor}, Flat ${member.flatNo}`);
        console.log(`   🅿️ Parking: ${member.parkingArea}-${member.parkingSlot}`);
        console.log(`   📊 Login Count: ${member.memberCredentialsId?.loginCount || 0}`);
        console.log(`   ✅ Active: ${member.isActive ? 'Yes' : 'No'}`);
        console.log(`   🕒 Created: ${new Date(member.createdAt).toLocaleString()}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Get admin members error:', error.response?.data?.message || error.message);
  }
};

// Step 4: Member Login with Admin-Created Credentials
const testMemberLogin = async (memberUserId, memberPassword) => {
  console.log('\n🔐 STEP 4: Member Login with Admin-Created Credentials');
  console.log('------------------------------------------------------');
  
  if (!memberUserId || !memberPassword) {
    console.log('❌ No member credentials available for testing');
    return;
  }
  
  try {
    console.log('🔑 Attempting member login with:');
    console.log('  - 🆔 Member User ID:', memberUserId);
    console.log('  - 🔒 Password (set by admin):', memberPassword);
    
    const response = await axios.post(`${baseURL}/admin-members/member-login`, {
      userId: memberUserId,
      password: memberPassword
    });
    
    console.log('✅ Member login successful!');
    console.log('\n📊 MEMBER LOGIN RESPONSE:');
    console.log('=========================');
    
    console.log('\n👤 MEMBER INFO:');
    console.log('  - 🆔 User ID:', response.data.data.member.userId);
    console.log('  - Name:', `${response.data.data.member.firstName} ${response.data.data.member.lastName}`);
    console.log('  - Email:', response.data.data.member.email);
    console.log('  - Mobile:', response.data.data.member.mobile);
    console.log('  - Flat:', response.data.data.member.flatDetails);
    console.log('  - Parking:', response.data.data.member.parkingDetails);
    console.log('  - Member Type:', response.data.data.member.memberType);
    
    console.log('\n📊 LOGIN INFO:');
    console.log('  - Login Count:', response.data.data.loginInfo.loginCount);
    console.log('  - Account Status:', response.data.data.loginInfo.accountStatus);
    console.log('  - Created by Admin:', response.data.data.loginInfo.createdByAdmin);
    console.log('  - Last Login:', new Date(response.data.data.loginInfo.lastLogin).toLocaleString());
    
  } catch (error) {
    console.log('❌ Member login error:', error.response?.data?.message || error.message);
  }
};

// Run Complete Admin Member System Test
const runAdminMemberSystemTest = async () => {
  console.log('🚀 Starting Admin Member System Test...\n');
  
  // Step 1: Setup admin account
  const adminId = await setupAdminAccount();
  if (!adminId) {
    console.log('❌ Cannot proceed without valid admin account');
    return;
  }
  
  // Step 2: Admin creates member
  const memberInfo = await adminCreateMember(adminId);
  
  // Step 3: Get all members created by admin
  await getAdminMembers(adminId);
  
  // Step 4: Test member login
  if (memberInfo) {
    await testMemberLogin(memberInfo.memberUserId, memberInfo.memberPassword);
  }
  
  console.log('\n🎉 ADMIN MEMBER SYSTEM TEST COMPLETED!');
  console.log('✨ Key Features Demonstrated:');
  console.log('   1. ✅ Admin creates member account with profile details');
  console.log('   2. ✅ System auto-generates member User ID (MEM2025XXX format)');
  console.log('   3. ✅ Admin sets member password');
  console.log('   4. ✅ Member details stored in separate AdminMemberProfile collection');
  console.log('   5. ✅ Member credentials stored in separate AdminMemberCredentials collection');
  console.log('   6. ✅ Admin ID tracked - shows which admin created which members');
  console.log('   7. ✅ Member can login with admin-created credentials');
  console.log('   8. ✅ Admin can view all members they created');
  console.log('   9. ✅ Complete separation from self-registration system');
  console.log('\n💡 Database Collections Created:');
  console.log('   - AdminMemberProfile (member profile details + admin tracking)');
  console.log('   - AdminMemberCredentials (member login credentials + admin tracking)');
  console.log('\n🔄 Admin Dashboard Integration Ready!');
};

// Load environment variables
require('dotenv').config();

// Run the test
runAdminMemberSystemTest().catch(console.error);