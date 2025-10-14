const { createAdminProfile } = require('../services/adminProfiles.services');
const compressBase64Image = require('../middleware/compressBase64Image');
// Create Admin Profile controller
const createAdminProfileController = async (req, res) => {
    const { userId, firstName, lastName, email, apartment, phone, address, imagePath } = req.body;

    // Compress base64 image if provided
    let processedImagePath = imagePath;
    if (imagePath && typeof imagePath === 'string' && imagePath.startsWith('data:image/')) {
        try {
            console.log('🖼️ Compressing base64 image for admin profile...');
            processedImagePath = await compressBase64Image(imagePath, 100); // 100KB max
            console.log('✅ Image compressed successfully');
        } catch (error) {
            console.log('❌ Image compression failed:', error.message);
            return res.status(400).json({
                status: false,
                message: 'Invalid image data provided',
                error: error.message
            });
        }
    }

    if (!userId || !firstName || !lastName || !email || !apartment || !phone || !address) {
        return res.status(400).json({ status: false, message: 'All fields including userId are required' });
    }
    const result = await createAdminProfile.createProfile(userId, firstName, lastName, email, apartment, phone, address, processedImagePath);
    if (result.status) {
        return res.status(201).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// Get All Admin Profiles controller
const getAllAdminProfilesController = async (req, res) => {
    const result = await createAdminProfile.getAllProfiles();
    if (result.status) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// Get Admin Profile by ID controller
const getAdminProfileByIdController = async (req, res) => {
    const { profileId } = req.params;
    if (!profileId) {
        return res.status(400).json({ status: false, message: 'Profile ID is required' });
    }
    const result = await createAdminProfile.getProfileById(profileId);
    if (result.status) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json(result);
    }
};

// Update Admin Profile controller
const updateAdminProfileController = async (req, res) => {
    const { profileId } = req.params;
    const updateData = req.body;

    if (!profileId) {
        return res.status(400).json({ status: false, message: 'Profile ID is required' });
    }

    // Compress base64 image if provided in updateData
    if (updateData.imagePath && typeof updateData.imagePath === 'string' && updateData.imagePath.startsWith('data:image/')) {
        try {
            console.log('🖼️ Compressing base64 image for admin profile update...');
            updateData.imagePath = await compressBase64Image(updateData.imagePath, 100); // 100KB max
            console.log('✅ Image compressed successfully');
        } catch (error) {
            console.log('❌ Image compression failed:', error.message);
            return res.status(400).json({
                status: false,
                message: 'Invalid image data provided',
                error: error.message
            });
        }
    }

    // Remove empty fields from update data
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] == null) {
            delete updateData[key];
        }
    });

    // Handle image path if file is uploaded (fallback for multer uploads)
    if (req.file) {
        updateData.imagePath = req.file.path;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ status: false, message: 'No valid fields to update' });
    }

    const result = await createAdminProfile.updateProfile(profileId, updateData);
    if (result.status) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// Delete Admin Profile controller
const deleteAdminProfileController = async (req, res) => {
    const { profileId } = req.params;
    
    if (!profileId) {
        return res.status(400).json({ status: false, message: 'Profile ID is required' });
    }

    const result = await createAdminProfile.deleteProfile(profileId);
    if (result.status) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json(result);
    }
};

// Get User Profile Details by UserId controller
const getUserProfileDetailsController = async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(400).json({ status: false, message: 'User ID is required' });
    }

    const result = await createAdminProfile.getUserProfileDetails(userId);
    if (result.status) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json(result);
    }
};

// Get User Profile Details by Email controller
const getUserProfileByEmailController = async (req, res) => {
    const { email } = req.params;
    
    if (!email) {
        return res.status(400).json({ status: false, message: 'Email is required' });
    }

    const result = await createAdminProfile.getUserProfileByEmail(email);
    if (result.status) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json(result);
    }
};

module.exports = { 
    createAdminProfileController, 
    getAllAdminProfilesController, 
    getAdminProfileByIdController,
    updateAdminProfileController,
    deleteAdminProfileController,
    getUserProfileDetailsController,
    getUserProfileByEmailController
};