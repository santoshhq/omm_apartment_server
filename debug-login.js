const { loginService } = require('./services/auth.services/signup.services');
const Signup = require('./models/auth.models/signup');

async function debugLogin() {
  console.log('=== Debug Login Issue ===');
  
  try {
    // Check if we have any users
    const users = await Signup.find({});
    console.log('Total users in database:', users.length);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log('  Email:', user.email);
        console.log('  Password exists:', !!user.password);
        console.log('  Password length:', user.password ? user.password.length : 0);
        console.log('  Is Verified:', user.isVerified);
        console.log('  ---');
      });
      
      // Test login with first verified user
      const verifiedUser = users.find(u => u.isVerified);
      if (verifiedUser) {
        console.log('Testing login with verified user:', verifiedUser.email);
        const result = await loginService(verifiedUser.email, 'password123');
        console.log('Login result:', result);
      } else {
        console.log('No verified users found');
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  process.exit(0);
}

debugLogin();