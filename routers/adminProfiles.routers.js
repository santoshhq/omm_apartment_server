const express = require('express');
const router = express.Router();
const { 
    createAdminProfileController, 
    getAllAdminProfilesController, 
    getAdminProfileByIdController,
    updateAdminProfileController,
    deleteAdminProfileController,
    getUserProfileDetailsController,
    getUserProfileByEmailController
} = require('../controllers/adminProfiles.controllers');

// Optional: Add multer for file upload support
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

// Admin Profile Routes

/**
 * @route   POST /api/admin-profiles
 * @desc    Create a new admin profile
 * @access  Private (should be authenticated)
 * @body    { firstName, lastName, email, apartment, phone, address, imagePath }
 */
router.post('/', createAdminProfileController);

/**
 * @route   GET /api/admin-profiles
 * @desc    Get all admin profiles
 * @access  Private (should be authenticated)
 */
router.get('/', getAllAdminProfilesController);

/**
 * @route   GET /api/admin-profiles/:profileId
 * @desc    Get admin profile by ID
 * @access  Private (should be authenticated)
 * @params  profileId - MongoDB ObjectId of the profile
 */
router.get('/:profileId', getAdminProfileByIdController);

/**
 * @route   PUT /api/admin-profiles/:profileId
 * @desc    Update admin profile by ID
 * @access  Private (should be authenticated)
 * @params  profileId - MongoDB ObjectId of the profile
 * @body    { firstName, lastName, email, apartment, phone, address, imagePath }
 */
router.put('/:profileId', updateAdminProfileController);

/**
 * @route   DELETE /api/admin-profiles/:profileId
 * @desc    Delete admin profile by ID
 * @access  Private (should be authenticated)
 * @params  profileId - MongoDB ObjectId of the profile
 */
router.delete('/:profileId', deleteAdminProfileController);

/**
 * @route   GET /api/admin-profiles/user/:userId
 * @desc    Get user profile details by userId (image, name, email, apartment, phone, address)
 * @access  Private (should be authenticated)
 * @params  userId - MongoDB ObjectId of the user
 */
router.get('/user/:userId', getUserProfileDetailsController);

/**
 * @route   GET /api/admin-profiles/email/:email
 * @desc    Get user profile details by email (image, name, email, apartment, phone, address)
 * @access  Private (should be authenticated)
 * @params  email - Email address of the user
 */
router.get('/email/:email', getUserProfileByEmailController);

// Optional: File upload route (uncomment if you want to use multer)
/**
 * @route   POST /api/admin-profiles/upload
 * @desc    Create admin profile with image upload
 * @access  Private (should be authenticated)
 * @body    Form-data with image file and profile data
 */
// router.post('/upload', upload.single('profileImage'), createAdminProfileController);

module.exports = router;