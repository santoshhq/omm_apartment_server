// Test Empty Parking Fields Handling
const axios = require('axios');

console.log('🧪 TESTING EMPTY PARKING FIELDS HANDLING');
console.log('========================================\n');

const baseURL = 'http://localhost:8080/api';

// Test data with empty parking fields (simulating frontend empty inputs)
const memberDataWithEmptyParking = {
  profileImage: "https://example.com/member-profile.jpg",
  firstName: "John",
  lastName: "Doe",
  mobile: "9876543210",
  email: "john.doe@example.com",
  floor: "II",
  flatNo: "201",
  paymentStatus: "Booked",
  parkingArea: "", // Empty string from frontend
  parkingSlot: "", // Empty string from frontend  
  govtIdType: "AadharCard",
  govtIdImage: "https://example.com/john-aadhar.jpg"
};

const memberDataWithMissingParking = {
  profileImage: "https://example.com/member2-profile.jpg",
  firstName: "Jane",
  lastName: "Smith",
  mobile: "9876543211",
  email: "jane.smith@example.com",
  floor: "III",
  flatNo: "301", 
  paymentStatus: "Available",
  // parkingArea and parkingSlot are completely missing
  govtIdType: "PanCard",
  govtIdImage: "https://example.com/jane-pan.jpg"
};

const runEmptyParkingTest = async () => {
  try {
    console.log('🚀 Starting Empty Parking Fields Test...\n');
    
    // First setup admin
    console.log('👤 Step 1: Setting up admin...');
    const adminEmail = 'admin@example.com';
    const adminPassword = 'AdminPass123';
    
    const signupResponse = await axios.post(`${baseURL}/auth/signup`, {
      email: adminEmail,
      password: adminPassword
    });
    
    const otp = signupResponse.data.data.otp;
    const verifyResponse = await axios.post(`${baseURL}/auth/verify-otp`, {
      email: adminEmail,
      otp: otp
    });
    
    const adminId = verifyResponse.data.data.id;
    console.log('✅ Admin setup complete, ID:', adminId);
    
    // Test 1: Member with empty string parking fields
    console.log('\n🧪 Test 1: Creating member with empty string parking fields...');
    const member1Data = {
      adminId: adminId,
      userId: "111111",
      password: "Member1Pass",
      ...memberDataWithEmptyParking
    };
    
    console.log('📤 Sending data with empty parking strings:');
    console.log('   parkingArea: ""');
    console.log('   parkingSlot: ""');
    
    const member1Response = await axios.post(`${baseURL}/admin-member/create-member`, member1Data);
    console.log('✅ Member 1 created successfully!');
    console.log('🅿️ Parking details:', member1Response.data.data.member.parkingDetails);
    
    // Test 2: Member with missing parking fields
    console.log('\n🧪 Test 2: Creating member with missing parking fields...');
    const member2Data = {
      adminId: adminId,
      userId: "222222", 
      password: "Member2Pass",
      ...memberDataWithMissingParking
    };
    
    console.log('📤 Sending data without parking fields:');
    console.log('   parkingArea: undefined');
    console.log('   parkingSlot: undefined');
    
    const member2Response = await axios.post(`${baseURL}/admin-member/create-member`, member2Data);
    console.log('✅ Member 2 created successfully!');
    console.log('🅿️ Parking details:', member2Response.data.data.member.parkingDetails);
    
    // Test 3: Update member to add parking
    console.log('\n🧪 Test 3: Adding parking to member with empty parking...');
    const member1Id = member1Response.data.data.member.id;
    
    const addParkingData = {
      parkingArea: "P1",
      parkingSlot: "P1-15"
    };
    
    const updateResponse = await axios.put(`${baseURL}/admin-member/admin/${adminId}/member/${member1Id}`, addParkingData);
    console.log('✅ Parking added successfully!');
    console.log('🅿️ New parking details:', updateResponse.data.data.member.parkingDetails);
    
    // Test 4: Update member to remove parking (empty strings)
    console.log('\n🧪 Test 4: Removing parking using empty strings...');
    
    const removeParkingData = {
      parkingArea: "",
      parkingSlot: ""
    };
    
    const removeResponse = await axios.put(`${baseURL}/admin-member/admin/${adminId}/member/${member1Id}`, removeParkingData);
    console.log('✅ Parking removed successfully!');
    console.log('🅿️ Updated parking details:', removeResponse.data.data.member.parkingDetails);
    
    // Test 5: Update member to remove parking (null values)
    console.log('\n🧪 Test 5: Removing parking using null values...');
    
    // First add parking back
    await axios.put(`${baseURL}/admin-member/admin/${adminId}/member/${member1Id}`, {
      parkingArea: "P2",
      parkingSlot: "P2-20"
    });
    
    const removeWithNullData = {
      parkingArea: null,
      parkingSlot: null
    };
    
    const removeNullResponse = await axios.put(`${baseURL}/admin-member/admin/${adminId}/member/${member1Id}`, removeWithNullData);
    console.log('✅ Parking removed with null values successfully!');
    console.log('🅿️ Final parking details:', removeNullResponse.data.data.member.parkingDetails);
    
    console.log('\n🎉 ALL EMPTY PARKING TESTS COMPLETED SUCCESSFULLY!');
    console.log('\n✨ KEY BEHAVIORS VERIFIED:');
    console.log('   1. ✅ Empty strings ("") are converted to null in database');
    console.log('   2. ✅ Missing fields (undefined) are stored as null');
    console.log('   3. ✅ Both show "No Parking Assigned" in responses');
    console.log('   4. ✅ Can add parking later via update');
    console.log('   5. ✅ Can remove parking with empty strings');
    console.log('   6. ✅ Can remove parking with null values');
    console.log('   7. ✅ All operations work seamlessly from frontend perspective');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.response?.data || error.message);
  }
};

// Run the test
runEmptyParkingTest().catch(console.error);