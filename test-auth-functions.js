const { loginService, forgotPasswordService } = require('./services/auth.services/signup.services');
const Signup = require('./models/auth.models/signup');

async function testLoginAndForgotPassword() {
  console.log('=== Testing Login & Forgot Password with isProfile ===\n');
  
  try {
    // Check existing users
    const users = await Signup.find({});
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  isVerified: ${user.isVerified}`);
      console.log(`  isProfile: ${user.isProfile}`);
      console.log(`  ---`);
    });

    if (users.length > 0) {
      const testUser = users.find(u => u.isVerified) || users[0];
      console.log(`\n🧪 Testing with user: ${testUser.email}`);
      
      // Test Login
      console.log('\n1. Testing Login...');
      const loginResult = await loginService(testUser.email, 'password123');
      console.log('Login Result:', JSON.stringify(loginResult, null, 2));
      
      // Test Forgot Password
      console.log('\n2. Testing Forgot Password...');
      const forgotResult = await forgotPasswordService(testUser.email);
      console.log('Forgot Password Result:', JSON.stringify(forgotResult, null, 2));
      
    } else {
      console.log('❌ No users found. Please signup first.');
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
  
  process.exit(0);
}

testLoginAndForgotPassword();