require('dotenv').config();
const AdminMemberProfile = require('../../models/auth.models/adminMemberProfile');
const AdminMemberCredentials = require('../../models/auth.models/adminMemberCredentials');
const Signup = require('../../models/auth.models/signup');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../utils/jwt.utils');

// Environment variables
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Helper function to sanitize parking fields (convert empty strings to null, handle NA logic)
const sanitizeParkingFields = (memberData) => {
  const sanitized = { ...memberData };
  
  // Convert empty strings to null for parking fields
  if (sanitized.parkingArea === '' || sanitized.parkingArea === undefined) {
    sanitized.parkingArea = null;
  }
  if (sanitized.parkingSlot === '' || sanitized.parkingSlot === undefined) {
    sanitized.parkingSlot = null;
  }
  
  // Special logic: If parkingArea is 'NA', automatically set parkingSlot to 'NA'
  if (sanitized.parkingArea === 'N/A') {
    sanitized.parkingSlot = 'N/A';
  }
  
  // If parkingSlot is 'NA' but parkingArea is not set, set parkingArea to 'NA'
  if (sanitized.parkingSlot === 'N/A' && !sanitized.parkingArea) {
    sanitized.parkingArea = 'N/A';
  }
  
  return sanitized;
};

// Helper function to format parking details
const formatParkingDetails = (parkingArea, parkingSlot) => {
  // Handle NA case
  if (parkingArea === 'N/A' || parkingSlot === 'N/A') {
    return 'No Parking Available';
  }
  
  // Handle null/empty cases
  if (!parkingArea && !parkingSlot) {
    return 'No Parking Assigned';
  }
  if (!parkingArea) {
    return parkingSlot || 'No Parking Assigned';
  }
  if (!parkingSlot) {
    return parkingArea || 'No Parking Assigned';
  }
  return `${parkingArea}-${parkingSlot}`;
};

// Validate Member User ID (6 digits only)
const validateMemberUserId = (userId) => {
  // Check if userId is exactly 6 digits
  const userIdRegex = /^\d{6}$/;
  return userIdRegex.test(userId);
};

// Check if Member User ID is unique
const checkUserIdUnique = async (userId) => {
  const existingUser = await AdminMemberCredentials.findOne({ userId });
  return !existingUser; // returns true if unique (no existing user found)
};

// Admin Creates Member Service
const adminCreateMemberService = async (adminId, memberData, adminSetPassword, adminSetUserId) => {
  console.log('\n=== 👥 ADMIN CREATE MEMBER SERVICE CALLED ===');
  console.log('🔑 Admin ID:', adminId);
  console.log('🆔 Admin Set User ID:', adminSetUserId);
  console.log('📧 Member Email:', memberData.email);
  console.log('📱 Member Mobile:', memberData.mobile);
  console.log('👤 Member Name:', `${memberData.firstName} ${memberData.lastName}`);
  console.log('🏢 Flat:', `Floor ${memberData.floor}, Flat ${memberData.flatNo}`);
  console.log('🅿️ Parking:', formatParkingDetails(memberData.parkingArea, memberData.parkingSlot));
  console.log('🔒 Admin Set Password:', adminSetPassword);
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  try {
    // Validate User ID format (6 digits only)
    if (!validateMemberUserId(adminSetUserId)) {
      console.log('❌ INVALID USER ID FORMAT');
      return { 
        success: false, 
        message: 'User ID must be exactly 6 digits (numbers only)' 
      };
    }
    
    console.log('✅ User ID format valid:', adminSetUserId);
    
    // Check if User ID is unique
    const isUserIdUnique = await checkUserIdUnique(adminSetUserId);
    if (!isUserIdUnique) {
      console.log('❌ USER ID ALREADY EXISTS');
      return { 
        success: false, 
        message: 'User ID already exists. Please choose a different 6-digit User ID.' 
      };
    }
    
    console.log('✅ User ID is unique:', adminSetUserId);
    
    // Check if admin exists and is verified
    const admin = await Signup.findOne({ 
      _id: adminId, 
      isVerified: true 
    });
    
    if (!admin) {
      console.log('❌ ADMIN NOT FOUND OR NOT VERIFIED');
      return { 
        success: false, 
        message: 'Admin not found or not verified' 
      };
    }
    
    console.log('✅ Admin verified:', admin.email);
    
    // Check if member with same email or mobile already exists
    const existingMember = await AdminMemberProfile.findOne({ 
      $or: [
        { email: memberData.email },
        { mobile: memberData.mobile }
      ]
    });
    
    if (existingMember) {
      console.log('❌ MEMBER ALREADY EXISTS');
      return { 
        success: false, 
        message: 'Member with this email or mobile already exists' 
      };
    }
    
    // Use admin-provided userId
    const memberUserId = adminSetUserId;
    console.log('🆔 Using Admin-Provided User ID:', memberUserId);
    
    // Hash the admin-set password
    const hashedPassword = await bcrypt.hash(adminSetPassword, BCRYPT_SALT_ROUNDS);
    console.log('🔐 Password hashed successfully');
    
    // Sanitize parking fields (convert empty strings to null)
    const sanitizedMemberData = sanitizeParkingFields(memberData);
    console.log('🧹 Parking fields sanitized:', {
      parkingArea: sanitizedMemberData.parkingArea,
      parkingSlot: sanitizedMemberData.parkingSlot
    });
    
    // Create member profile
    const memberProfile = new AdminMemberProfile({
      ...sanitizedMemberData,
      createdByAdminId: adminId,
      createdBy: 'Admin'
    });
    
    const savedProfile = await memberProfile.save();
    console.log('💾 Member profile saved:', savedProfile._id);
    
    // Create member credentials
    const memberCredentials = new AdminMemberCredentials({
      userId: memberUserId,
      email: memberData.email, // Include email in credentials
      password: adminSetPassword, // Store plain password for admin reference
      hashedPassword: hashedPassword,
      memberProfileId: savedProfile._id,
      createdByAdminId: adminId,
      memberType: 'AdminCreated',
      passwordSetByAdmin: true
    });
    
    const savedCredentials = await memberCredentials.save();
    console.log('💾 Member credentials saved:', savedCredentials._id);
    
    // Link credentials to profile
    savedProfile.memberCredentialsId = savedCredentials._id;
    await savedProfile.save();
    console.log('🔗 Profile and credentials linked');
    
    console.log('🎉 MEMBER CREATED SUCCESSFULLY BY ADMIN');
    
    return {
      success: true,
      message: 'Member created successfully!',
      data: {
        member: {
          id: savedProfile._id,
          userId: memberUserId,
          firstName: savedProfile.firstName,
          lastName: savedProfile.lastName,
          email: savedProfile.email,
          mobile: savedProfile.mobile,
          flatDetails: `Floor ${savedProfile.floor}, Flat ${savedProfile.flatNo}`,
          parkingDetails: formatParkingDetails(savedProfile.parkingArea, savedProfile.parkingSlot),
          createdBy: 'Admin'
        },
        credentials: {
          userId: memberUserId,
          password: adminSetPassword,
          message: 'Member can now login with these credentials'
        },
        adminInfo: {
          createdByAdminId: adminId,
          adminEmail: admin.email,
          createdAt: new Date()
        }
      }
    };
    
  } catch (error) {
    console.log('❌ ERROR in adminCreateMemberService:', error.message);
    return {
      success: false,
      message: 'Error creating member',
      error: error.message
    };
  }
};

// Get Members Created by Admin
const getAdminMembersService = async (adminId) => {
  console.log('\n=== 📋 GET ADMIN MEMBERS SERVICE CALLED ===');
  console.log('🔑 Admin ID:', adminId);
  
  try {
    const members = await AdminMemberProfile.find({ createdByAdminId: adminId })
      .populate('memberCredentialsId', 'userId isActive lastLogin loginCount passwordSetByAdmin')
      .sort({ createdAt: -1 });
    
    console.log('✅ Found', members.length, 'members created by this admin');
    
    return {
      success: true,
      count: members.length,
      data: members
    };
    
  } catch (error) {
    console.log('❌ ERROR in getAdminMembersService:', error.message);
    return {
      success: false,
      message: 'Error fetching admin members',
      error: error.message
    };
  }
};

// Member Login with Admin-Created Credentials
const memberLoginService = async (userId, password) => {
  console.log('\n=== 🔐 MEMBER LOGIN SERVICE CALLED ===');
  console.log('👤 Member User ID:', userId);
  console.log('🔒 Password Length:', password ? password.length : 0);
  
  try {
    const credentials = await AdminMemberCredentials.findOne({ userId, isActive: true })
      .populate('memberProfileId')
      .populate('createdByAdminId', 'email');
    
    if (!credentials) {
      console.log('❌ INVALID MEMBER CREDENTIALS OR INACTIVE ACCOUNT');
      return { 
        success: false, 
        message: 'Invalid user ID or inactive account' 
      };
    }
    
    console.log('✅ Member credentials found');
    console.log('🔑 Created by Admin:', credentials.createdByAdminId.email);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, credentials.hashedPassword);
    
    if (!isPasswordValid) {
      console.log('❌ INVALID PASSWORD');
      return { 
        success: false, 
        message: 'Invalid password' 
      };
    }
    
    // Update login tracking
    credentials.lastLogin = new Date();
    credentials.loginCount += 1;
    await credentials.save();
    
    console.log('🎉 MEMBER LOGIN SUCCESSFUL');
    console.log('📊 Login count:', credentials.loginCount);

    // Check if member profile exists
    if (!credentials.memberProfileId) {
      console.log('❌ MEMBER PROFILE NOT FOUND - Credentials corrupted');
      return {
        success: false,
        message: 'Member profile not found. Please contact administrator to fix your account.'
      };
    }

    // Generate JWT token
    const tokenPayload = {
      id: credentials.memberProfileId._id,
      userId: credentials.userId,
      email: credentials.memberProfileId.email,
      type: 'member'
    };
    const token = generateToken(tokenPayload);
    
    return {
      success: true,
      message: 'Member login successful',
      data: {
        member: {
          userId: credentials.userId,
          id: credentials.memberProfileId._id,
          firstName: credentials.memberProfileId.firstName,
          lastName: credentials.memberProfileId.lastName,
          email: credentials.memberProfileId.email,
          mobile: credentials.memberProfileId.mobile,
          flatDetails: `Floor ${credentials.memberProfileId.floor}, Flat ${credentials.memberProfileId.flatNo}`,
          parkingDetails: formatParkingDetails(credentials.memberProfileId.parkingArea, credentials.memberProfileId.parkingSlot),
          memberType: credentials.memberType
        },
        token: token,
        loginInfo: {
          userId: credentials.userId,
          lastLogin: credentials.lastLogin,
          loginCount: credentials.loginCount,
          accountStatus: 'Active',
          createdByAdmin: credentials.createdByAdminId.email
        }
      }
    };
    
  } catch (error) {
    console.log('❌ ERROR in memberLoginService:', error.message);
    return {
      success: false,
      message: 'Error during member login',
      error: error.message
    };
  }
};

// Update Member by Admin (All fields except userId and password)
const adminUpdateMemberService = async (adminId, memberId, updateData) => {
  console.log('\n=== ✏️ ADMIN UPDATE MEMBER SERVICE CALLED ===');
  console.log('🔑 Admin ID:', adminId);
  console.log('👤 Member ID:', memberId);
  console.log('📝 Update Data:', JSON.stringify(updateData, null, 2));
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  try {
    // Validate adminId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return {
        success: false,
        message: 'Invalid admin ID format'
      };
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return {
        success: false,
        message: 'Invalid member ID format'
      };
    }

    // Check if admin exists and is verified
    const admin = await Signup.findOne({ 
      _id: adminId, 
      isVerified: true 
    });
    
    if (!admin) {
      console.log('❌ ADMIN NOT FOUND OR NOT VERIFIED');
      return { 
        success: false, 
        message: 'Admin not found or not verified' 
      };
    }
    
    console.log('✅ Admin verified:', admin.email);

    // Find member created by this admin
    const member = await AdminMemberProfile.findOne({ 
      _id: memberId, 
      createdByAdminId: adminId 
    }).populate('memberCredentialsId');
    
    if (!member) {
      console.log('❌ MEMBER NOT FOUND OR NOT CREATED BY THIS ADMIN');
      return { 
        success: false, 
        message: 'Member not found or you do not have permission to update this member' 
      };
    }

    console.log('✅ Member found:', member.firstName, member.lastName);

    // Define updatable fields (exclude userId and password)
    const updatableFields = [
      'profileImage', 'firstName', 'lastName', 'mobile', 'email',
      'floor', 'flatNo', 'paymentStatus', 'parkingArea', 'parkingSlot',
      'govtIdType', 'govtIdImage'
    ];

    // Sanitize parking fields first (convert empty strings to null)
    const sanitizedUpdateData = sanitizeParkingFields(updateData);
    
    // Filter update data to only include allowed fields
    const filteredUpdateData = {};
    updatableFields.forEach(field => {
      if (sanitizedUpdateData[field] !== undefined) {
        // Allow null values for parking fields
        if (field === 'parkingArea' || field === 'parkingSlot') {
          filteredUpdateData[field] = sanitizedUpdateData[field];
        } else if (sanitizedUpdateData[field] !== null) {
          filteredUpdateData[field] = sanitizedUpdateData[field];
        }
      }
    });

    console.log('🧹 Sanitized Update Data:', JSON.stringify(sanitizedUpdateData, null, 2));
    console.log('📝 Filtered Update Data:', JSON.stringify(filteredUpdateData, null, 2));

    if (Object.keys(filteredUpdateData).length === 0) {
      return {
        success: false,
        message: 'No valid fields to update. userId and password cannot be updated through this endpoint.'
      };
    }

    // Check for email uniqueness if email is being updated
    if (filteredUpdateData.email && filteredUpdateData.email !== member.email) {
      const existingEmailMember = await AdminMemberProfile.findOne({ 
        email: filteredUpdateData.email,
        _id: { $ne: memberId }
      });
      
      if (existingEmailMember) {
        console.log('❌ EMAIL ALREADY EXISTS');
        return { 
          success: false, 
          message: 'Email already exists for another member' 
        };
      }
    }

    // Check for mobile uniqueness if mobile is being updated
    if (filteredUpdateData.mobile && filteredUpdateData.mobile !== member.mobile) {
      const existingMobileMember = await AdminMemberProfile.findOne({ 
        mobile: filteredUpdateData.mobile,
        _id: { $ne: memberId }
      });
      
      if (existingMobileMember) {
        console.log('❌ MOBILE ALREADY EXISTS');
        return { 
          success: false, 
          message: 'Mobile number already exists for another member' 
        };
      }
    }

    // Store old values for logging
    const oldValues = {};
    Object.keys(filteredUpdateData).forEach(key => {
      oldValues[key] = member[key];
    });

    // Update member profile
    Object.keys(filteredUpdateData).forEach(key => {
      member[key] = filteredUpdateData[key];
    });
    
    const updatedMember = await member.save();
    console.log('💾 Member profile updated successfully');

    // Update email in credentials if email was changed
    if (filteredUpdateData.email && member.memberCredentialsId) {
      await AdminMemberCredentials.findByIdAndUpdate(
        member.memberCredentialsId,
        { email: filteredUpdateData.email }
      );
      console.log('💾 Member credentials email updated');
    }

    // Log changes
    console.log('📝 CHANGES MADE:');
    Object.keys(filteredUpdateData).forEach(key => {
      console.log(`   ${key}: "${oldValues[key]}" → "${filteredUpdateData[key]}"`);
    });

    console.log('✅ MEMBER UPDATED SUCCESSFULLY BY ADMIN');
    
    return {
      success: true,
      message: 'Member updated successfully',
      data: {
        member: {
          id: updatedMember._id,
          firstName: updatedMember.firstName,
          lastName: updatedMember.lastName,
          email: updatedMember.email,
          mobile: updatedMember.mobile,
          flatDetails: `Floor ${updatedMember.floor}, Flat ${updatedMember.flatNo}`,
          parkingDetails: formatParkingDetails(updatedMember.parkingArea, updatedMember.parkingSlot),
          paymentStatus: updatedMember.paymentStatus,
          govtIdType: updatedMember.govtIdType,
          updatedFields: Object.keys(filteredUpdateData),
          updatedAt: updatedMember.updatedAt
        },
        changes: {
          fieldsUpdated: Object.keys(filteredUpdateData),
          oldValues: oldValues,
          newValues: filteredUpdateData
        },
        adminInfo: {
          updatedByAdminId: adminId,
          adminEmail: admin.email,
          updatedAt: new Date()
        }
      }
    };
    
  } catch (error) {
    console.log('❌ ERROR in adminUpdateMemberService:', error.message);
    return {
      success: false,
      message: 'Error updating member',
      error: error.message
    };
  }
};

// Delete Member by Admin
const adminDeleteMemberService = async (adminId, memberId) => {
  console.log('\n=== 🗑️ ADMIN DELETE MEMBER SERVICE CALLED ===');
  console.log('🔑 Admin ID:', adminId);
  console.log('👤 Member ID:', memberId);
  
  try {
    // Find member created by this admin
    const member = await AdminMemberProfile.findOne({ 
      _id: memberId, 
      createdByAdminId: adminId 
    });
    
    if (!member) {
      console.log('❌ MEMBER NOT FOUND OR NOT CREATED BY THIS ADMIN');
      return { 
        success: false, 
        message: 'Member not found or you do not have permission to delete this member' 
      };
    }
    
    // Delete member credentials first
    if (member.memberCredentialsId) {
      await AdminMemberCredentials.findByIdAndDelete(member.memberCredentialsId);
      console.log('🗑️ Member credentials deleted');
    }
    
    // Delete member profile
    await AdminMemberProfile.findByIdAndDelete(memberId);
    console.log('🗑️ Member profile deleted');
    
    console.log('✅ Member deleted successfully');
    
    return {
      success: true,
      message: 'Member deleted successfully'
    };
    
  } catch (error) {
    console.log('❌ ERROR in adminDeleteMemberService:', error.message);
    return {
      success: false,
      message: 'Error deleting member',
      error: error.message
    };
  }
};

module.exports = {
  adminCreateMemberService,
  getAdminMembersService,
  memberLoginService,
  adminUpdateMemberService,
  adminDeleteMemberService
};