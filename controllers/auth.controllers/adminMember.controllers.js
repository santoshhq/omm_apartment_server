const { 
  adminCreateMemberService,
  getAdminMembersService,
  memberLoginService,
  adminUpdateMemberService,
  adminDeleteMemberService
} = require('../../services/auth.services/adminMember.services');

// Admin Creates Member Controller
const adminCreateMember = async (req, res) => {
  try {
    const {
      adminId,
      userId, // Admin enters this userId (6 digits)
      password, // Admin sets this password for the member
      profileImage,
      firstName,
      lastName,
      mobile,
      email,
      floor,
      flatNo,
      paymentStatus,
      parkingArea,
      parkingSlot,
      govtIdType,
      govtIdImage
    } = req.body;

    // Validation - parkingArea and parkingSlot are now optional
    if (!adminId || !userId || !password || !firstName || !lastName || !mobile || !email || 
        !floor || !flatNo || !govtIdType || !govtIdImage) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided including adminId, userId, and password. Note: parkingArea and parkingSlot are optional'
      });
    }

    // Validate adminId format (MongoDB ObjectId)
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId format'
      });
    }

    // Validate userId format (6 digits only)
    const userIdRegex = /^\d{6}$/;
    if (!userIdRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User ID must be exactly 6 digits (numbers only). Example: 123456'
      });
    }

    const memberData = {
      profileImage,
      firstName,
      lastName,
      mobile,
      email,
      floor,
      flatNo,
      paymentStatus: paymentStatus || 'Available',
      parkingArea,
      parkingSlot,
      govtIdType,
      govtIdImage
    };

    const result = await adminCreateMemberService(adminId, memberData, password, userId);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Members Created by Admin Controller
const getAdminMembers = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Validate adminId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId format'
      });
    }

    const result = await getAdminMembersService(adminId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Member Login Controller
const memberLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validation
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: 'User ID and password are required'
      });
    }

    const result = await memberLoginService(userId, password);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin Updates Member Controller (All fields except userId and password)
const adminUpdateMember = async (req, res) => {
  try {
    const { adminId, memberId } = req.params;
    const updateData = req.body;

    console.log('\n=== ✏️ ADMIN UPDATE MEMBER CONTROLLER CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('👤 Member ID:', memberId);
    console.log('📝 Request Body:', JSON.stringify(updateData, null, 2));

    // Validation
    if (!adminId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID and Member ID are required in URL parameters'
      });
    }

    // Check if request body has data
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required in request body',
        allowedFields: [
          'profileImage', 'firstName', 'lastName', 'mobile', 'email',
          'floor', 'flatNo', 'paymentStatus', 'parkingArea', 'parkingSlot',
          'govtIdType', 'govtIdImage'
        ],
        note: 'userId and password cannot be updated through this endpoint'
      });
    }

    // Validate ObjectId formats
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId or memberId format'
      });
    }

    // Prevent userId and password updates
    if (updateData.userId || updateData.password || updateData.hashedPassword) {
      return res.status(400).json({
        success: false,
        message: 'userId and password cannot be updated through this endpoint',
        allowedFields: [
          'profileImage', 'firstName', 'lastName', 'mobile', 'email',
          'floor', 'flatNo', 'paymentStatus', 'parkingArea', 'parkingSlot',
          'govtIdType', 'govtIdImage'
        ]
      });
    }

    const result = await adminUpdateMemberService(adminId, memberId, updateData);

    if (result.success) {
      console.log('✅ Member updated successfully in controller');
      return res.status(200).json(result);
    } else {
      console.log('❌ Member update failed in controller:', result.message);
      return res.status(400).json(result);
    }

  } catch (error) {
    console.log('❌ Error in adminUpdateMember controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin Deletes Member Controller
const adminDeleteMember = async (req, res) => {
  try {
    const { adminId, memberId } = req.params;

    // Validation
    if (!adminId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID and Member ID are required'
      });
    }

    // Validate ObjectId formats
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId or memberId format'
      });
    }

    const result = await adminDeleteMemberService(adminId, memberId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  adminCreateMember,
  getAdminMembers,
  memberLogin,
  adminUpdateMember,
  adminDeleteMember
};