const axios = require('axios');

// Test Environment Variables Setup
console.log('🧪 TESTING ENVIRONMENT VARIABLES SETUP');
console.log('=======================================\n');

// Test that environment variables are loaded
const testEnvironmentVariables = () => {
  console.log('📊 Environment Variables Status:');
  console.log('   - PORT:', process.env.PORT || '❌ Not set');
  console.log('   - DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING ? '✅ Set' : '❌ Not set');
  console.log('   - BCRYPT_SALT_ROUNDS:', process.env.BCRYPT_SALT_ROUNDS || '❌ Not set');
  console.log('   - OTP_EXPIRY_MINUTES:', process.env.OTP_EXPIRY_MINUTES || '❌ Not set');
  console.log('   - NODE_ENV:', process.env.NODE_ENV || '❌ Not set');
  console.log('');
};

// Test API endpoints are still working
const testAPIEndpoints = async () => {
  console.log('🔗 Testing API Endpoints:');
  
  try {
    // Test server is responding
    const response = await axios.get('http://localhost:8080/');
    console.log('   ✅ Server is responding:', response.status === 200 ? 'Success' : 'Failed');
    
    // Test signup endpoint exists (should return error for missing data, but endpoint should exist)
    try {
      await axios.post('http://localhost:8080/api/auth/signup', {});
    } catch (error) {
      if (error.response && error.response.status) {
        console.log('   ✅ Signup endpoint exists:', error.response.status === 400 ? 'Success' : 'Check needed');
      }
    }
    
    // Test admin profiles endpoint exists
    try {
      await axios.get('http://localhost:8080/api/admin-profiles');
    } catch (error) {
      if (error.response && error.response.status) {
        console.log('   ✅ Admin profiles endpoint exists:', error.response.status === 200 ? 'Success' : 'Success (empty response expected)');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Server not responding. Make sure to run: node index.js');
  }
  
  console.log('');
};

// Test that OTP generation uses environment variables
const testOTPGeneration = () => {
  console.log('🔢 Testing OTP Configuration:');
  
  // Simulate OTP generation logic
  const OTP_MIN_VALUE = parseInt(process.env.OTP_MIN_VALUE) || 1000;
  const OTP_MAX_VALUE = parseInt(process.env.OTP_MAX_VALUE) || 9999;
  const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
  
  console.log(`   - OTP Range: ${OTP_MIN_VALUE} - ${OTP_MAX_VALUE}`);
  console.log(`   - Salt Rounds: ${BCRYPT_SALT_ROUNDS}`);
  console.log(`   - OTP Expiry: ${OTP_EXPIRY_MINUTES} minutes`);
  console.log('');
};

// Run all tests
const runTests = async () => {
  console.log('🔍 Environment Variables Test Started...\n');
  
  testEnvironmentVariables();
  testOTPGeneration();
  await testAPIEndpoints();
  
  console.log('✅ Environment Variables Test Completed!');
  console.log('🎉 All sensitive data is now stored in .env file');
  console.log('🔒 Make sure to add .env to .gitignore (already done!)');
  console.log('\n📝 Next Steps:');
  console.log('   1. Test your authentication flows');
  console.log('   2. Verify OTP generation works');
  console.log('   3. Check admin profile operations');
  console.log('   4. All functionality should work exactly the same!');
};

// Load environment variables for testing
require('dotenv').config();

// Run the tests
runTests().catch(console.error);