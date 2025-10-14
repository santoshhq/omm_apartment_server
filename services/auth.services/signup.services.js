require('dotenv').config();
const Signup = require('../../models/auth.models/signup');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../utils/jwt.utils');

// Environment variables with fallback defaults
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
const OTP_MIN_VALUE = parseInt(process.env.OTP_MIN_VALUE) || 1000;
const OTP_MAX_VALUE = parseInt(process.env.OTP_MAX_VALUE) || 9999;

// Generate 4-digit OTP using environment variables
const generateOTP = () => {
  return Math.floor(OTP_MIN_VALUE + Math.random() * (OTP_MAX_VALUE - OTP_MIN_VALUE + 1)).toString();
};

// Clean up expired unverified users
const cleanupExpiredUsers = async () => {
  try {
    const now = new Date();
    await Signup.deleteMany({
      isVerified: false,
      otpExpiry: { $lt: now }
    });
    console.log('Cleaned up expired unverified users');
  } catch (error) {
    console.error('Error cleaning up expired users:', error);
  }
};

// Signup service
const signupService = async (email, password) => {
  console.log('\n=== 🚀 SIGNUP SERVICE CALLED ===');
  console.log('📧 Email:', email);
  console.log('🔒 Password Length:', password ? password.length : 0, 'characters');
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  try {
    // Clean up expired users first
    await cleanupExpiredUsers();

    // Check if user already exists and is verified
    const existingUser = await Signup.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return { status: false, message: 'Email already registered and verified' };
    }

    // If user exists but not verified, update their details
    if (existingUser && !existingUser.isVerified) {
      console.log('👤 User exists but not verified, updating details...');
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      console.log('🔢 Generated OTP:', otp);
      console.log('⏰ OTP Expires At:', otpExpiry.toISOString());
      console.log('📧 OTP for Email:', email);

      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      
      const updatedUser = await existingUser.save();
      console.log('✅ Existing user updated with new OTP');
      
      return {
        status: true,
        message: `OTP sent to your email. Please verify within ${OTP_EXPIRY_MINUTES} minutes.`,
        data: {
          id: updatedUser._id,
          email: updatedUser.email,
          otp: otp, // In production, send this via email
          expiresAt: otpExpiry
        },
      };
    }

    // Create new user
    console.log('🆕 Creating new user...');
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    console.log('🔢 Generated OTP:', otp);
    console.log('⏰ OTP Expires At:', otpExpiry.toISOString());
    console.log('📧 OTP for Email:', email);

    const newUser = new Signup({
      email,
      password: hashedPassword,
      isVerified: false,
      otp: otp,
      otpExpiry: otpExpiry
    });

    const savedUser = await newUser.save();

    return {
      status: true,
      message: `User registered successfully. OTP sent to your email. Please verify within ${OTP_EXPIRY_MINUTES} minutes.`,
      data: {
        id: savedUser._id,
        email: savedUser.email,
        otp: otp, // In production, send this via email
        expiresAt: otpExpiry
      },
    };

  } catch (err) {
    return {
      status: false,
      message: 'Error registering user',
      error: err.message,
    };
  }
};

// Verify OTP service
const verifyOTPService = async (email, otp) => {
  console.log('\n=== 🔐 OTP VERIFICATION SERVICE CALLED ===');
  console.log('📧 Email:', email);
  console.log('🔢 Provided OTP:', otp);
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  try {
    // Clean up expired users first
    await cleanupExpiredUsers();

    const user = await Signup.findOne({ email });
    console.log('🔍 User Found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('👤 User ID:', user._id);
      console.log('📧 User Email:', user.email);
      console.log('✅ Is Verified:', user.isVerified);
      console.log('🔢 Stored OTP:', user.otp);
      console.log('⏰ OTP Expiry:', user.otpExpiry ? new Date(user.otpExpiry).toISOString() : 'Not set');
    }
    
    if (!user) {
      console.log('❌ USER NOT FOUND - OTP verification failed');
      return { status: false, message: 'User not found' };
    }

    if (user.isVerified) {
      console.log('❌ USER ALREADY VERIFIED');
      return { status: false, message: 'User already verified' };
    }

    const currentTime = new Date();
    const isExpired = user.otpExpiry < currentTime;
    console.log('⏰ Current Time:', currentTime.toISOString());
    console.log('🕐 Is OTP Expired:', isExpired);
    
    if (isExpired) {
      console.log('❌ OTP EXPIRED - Deleting expired user');
      // Delete expired user
      await Signup.deleteOne({ email });
      return { status: false, message: 'OTP expired. Please signup again.' };
    }

    console.log('🔍 OTP VERIFICATION:');
    console.log('   📊 Stored OTP:', user.otp);
    console.log('   📥 Provided OTP:', otp);
    console.log('   🎯 OTPs Match:', user.otp === otp);
    
    if (user.otp !== otp) {
      console.log('❌ INVALID OTP - Verification failed');
      return { status: false, message: 'Invalid OTP' };
    }

    console.log('✅ OTP VERIFIED SUCCESSFULLY - Updating user verification status');
    
    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();
    
    console.log('💾 User verification status updated in database');
    console.log('🎉 EMAIL VERIFICATION COMPLETED SUCCESSFULLY');

    // Generate JWT token
    const tokenPayload = {
      id: user._id,
      email: user.email,
      type: 'admin'
    };
    const token = generateToken(tokenPayload);

    return {
      status: true,
      message: 'Email verified successfully. You can now login.',
      data: {
        id: user._id,
        email: user.email,
        token: token,
        verifiedAt: new Date()
      }
    };

  } catch (error) {
    return {
      status: false,
      message: 'Error verifying OTP',
      error: error.message
    };
  }
};

// Login service
const loginService = async (email, password) => {
  console.log('\n=== 🔑 LOGIN SERVICE CALLED ===');
  console.log('📧 Email:', email);
  console.log('🔒 Password Length:', password ? password.length : 0, 'characters');
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  try {
    // Clean up expired users first
    await cleanupExpiredUsers();

    // Find user by email
    const user = await Signup.findOne({ email });
    console.log('🔍 User Found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('👤 User ID:', user._id);
      console.log('📧 User Email:', user.email);
      console.log('✅ Is Verified:', user.isVerified);
      console.log('👥 Is Profile:', user.isProfile);
      console.log('🔒 Has Password:', !!user.password);
    }
    
    if (!user) {
      console.log('❌ USER NOT FOUND - Login failed');
      return { status: false, message: 'Invalid email or password' };
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log('❌ USER NOT VERIFIED - Login failed');
      return { 
        status: false, 
        message: 'Please verify your email first. Check your email for OTP or signup again if OTP expired.' 
      };
    }

    // Validate password data
    if (!password || !user.password) {
      return { status: false, message: 'Invalid email or password' };
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔍 Password Validation:', isPasswordValid ? 'Valid' : 'Invalid');
    
    if (!isPasswordValid) {
      console.log('❌ INVALID PASSWORD - Login failed');
      return { status: false, message: 'Invalid email or password' };
    }

    console.log('🎉 LOGIN SUCCESSFUL');
    console.log('📤 Returning user data:');
    console.log('   👤 User ID:', user._id);
    console.log('   📧 Email:', user.email);
    console.log('   ✅ Is Verified:', user.isVerified);
    console.log('   👥 Is Profile:', user.isProfile);

    // Generate JWT token
    const tokenPayload = {
      id: user._id,
      email: user.email,
      type: 'admin'
    };
    const token = generateToken(tokenPayload);
    
    // Successful login
    return {
      status: true,
      message: 'Login successful',
      data: {
        id: user._id,
        email: user.email,
        token: token,
        isVerified: user.isVerified,
        isProfile: user.isProfile,
        loginAt: new Date()
      }
    };

  } catch (error) {
    return {
      status: false,
      message: 'Error during login',
      error: error.message
    };
  }
};

// Forgot Password - Send OTP service
const forgotPasswordService = async (email) => {
  console.log('\n=== 🔓 FORGOT PASSWORD SERVICE CALLED ===');
  console.log('📧 Email:', email);
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  try {
    // Clean up expired users first
    await cleanupExpiredUsers();

    // Find verified user by email
    const user = await Signup.findOne({ email, isVerified: true });
    console.log('🔍 Verified User Found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('👤 User ID:', user._id);
      console.log('📧 User Email:', user.email);
      console.log('✅ Is Verified:', user.isVerified);
      console.log('👥 Is Profile:', user.isProfile);
      console.log('🔑 Has Existing Reset OTP:', !!user.resetPasswordOTP);
    }
    
    if (!user) {
      console.log('❌ NO VERIFIED ACCOUNT FOUND - Forgot password failed');
      return { status: false, message: 'No verified account found with this email' };
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    console.log('🔢 Generated Reset Password OTP:', otp);
    console.log('⏰ Reset OTP Expires At:', otpExpiry.toISOString());
    console.log('📧 Reset OTP for Email:', email);

    // Save OTP for password reset
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();
    
    console.log('💾 Reset OTP saved to database successfully');
    console.log('🎉 FORGOT PASSWORD OTP GENERATED SUCCESSFULLY');

    // In production, send OTP via email
    console.log(`📧 Password reset OTP for ${email}: ${otp}`);

    return {
      status: true,
      message: 'Password reset OTP sent to your email',
      data: {
        email: email,
        otp: otp, // Remove this in production
        expiresAt: otpExpiry
      }
    };

  } catch (error) {
    return {
      status: false,
      message: 'Error sending password reset OTP',
      error: error.message
    };
  }
};

// Reset Password with OTP service
const resetPasswordService = async (email, otp, newPassword) => {
  console.log('\n=== 🔄 RESET PASSWORD SERVICE CALLED ===');
  console.log('📧 Email:', email);
  console.log('🔢 Provided Reset OTP:', otp);
  console.log('🔒 New Password Length:', newPassword ? newPassword.length : 0, 'characters');
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  try {
    // Find user by email
    const user = await Signup.findOne({ email, isVerified: true });
    console.log('🔍 User Found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('👤 User ID:', user._id);
      console.log('📧 User Email:', user.email);
      console.log('✅ Is Verified:', user.isVerified);
      console.log('🔑 Has Reset OTP:', !!user.resetPasswordOTP);
      console.log('⏰ Reset OTP Expiry:', user.resetPasswordOTPExpiry ? new Date(user.resetPasswordOTPExpiry).toISOString() : 'Not set');
    }
    
    if (!user) {
      console.log('❌ NO VERIFIED ACCOUNT FOUND - Reset password failed');
      return { status: false, message: 'No verified account found with this email' };
    }

    // Check if reset OTP exists
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      console.log('❌ NO RESET OTP REQUEST FOUND');
      return { status: false, message: 'No password reset request found. Please request a new OTP.' };
    }

    // Check if OTP is expired
    const currentTime = new Date();
    const isExpired = user.resetPasswordOTPExpiry < currentTime;
    console.log('⏰ Current Time:', currentTime.toISOString());
    console.log('⏳ OTP Expiry Time:', new Date(user.resetPasswordOTPExpiry).toISOString());
    console.log('🕐 Is OTP Expired:', isExpired);
    
    if (isExpired) {
      console.log('❌ OTP EXPIRED - Clearing expired OTP and failing reset');
      // Clear expired OTP
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;
      await user.save();
      return { status: false, message: 'OTP expired. Please request a new password reset.' };
    }

    // Verify OTP
    console.log('🔍 OTP VERIFICATION:');
    console.log('   📊 Stored OTP in DB:', user.resetPasswordOTP);
    console.log('   📥 Provided OTP:', otp);
    console.log('   🎯 OTPs Match:', user.resetPasswordOTP === otp);
    
    if (user.resetPasswordOTP !== otp) {
      console.log('❌ INVALID OTP - Reset password failed');
      return { status: false, message: 'Invalid OTP' };
    }

    console.log('✅ OTP VERIFIED SUCCESSFULLY - Proceeding with password reset');
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    console.log('🔐 Password hashed successfully with salt rounds:', BCRYPT_SALT_ROUNDS);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();
    
    console.log('💾 Password updated and reset fields cleared in database');
    console.log('🎉 PASSWORD RESET COMPLETED SUCCESSFULLY');

    return {
      status: true,
      message: 'Password reset successful. You can now login with your new password.',
      data: {
        email: user.email,
        resetAt: new Date()
      }
    };

  } catch (error) {
    return {
      status: false,
      message: 'Error resetting password',
      error: error.message
    };
  }
};

module.exports = { 
  signupService, 
  verifyOTPService, 
  loginService, 
  forgotPasswordService, 
  resetPasswordService 
};
