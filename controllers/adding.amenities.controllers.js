const {
  createAmenityService,
  getAllAmenitiesService,
  getAmenityByIdService,
  updateAmenityService,
  deleteAmenityService,
  toggleAmenityStatusService
} = require('../services/adding.amenities.services');

// Create Amenity Controller
const createAmenity = async (req, res) => {
  try {
    console.log('\n🎯 CREATE AMENITY CONTROLLER CALLED');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    const { adminId } = req.params;
    const {
      name,
      description,
      capacity,
      bookingType,
      weeklySchedule,
      imagePaths,
      location,
      hourlyRate,
      features,
      active
    } = req.body;

    // Validation
    if (!adminId || !name || !description || !capacity || !bookingType || !weeklySchedule) {
      return res.status(400).json({
        success: false,
        message: 'AdminId, name, description, capacity, bookingType, and weeklySchedule are required'
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

    // Validate capacity is a number
    if (isNaN(capacity) || capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive number'
      });
    }

    // Validate hourly rate if provided
    if (hourlyRate !== undefined && (isNaN(hourlyRate) || hourlyRate < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Hourly rate must be a non-negative number'
      });
    }

    // Validate imagePaths is array if provided
    if (imagePaths && !Array.isArray(imagePaths)) {
      return res.status(400).json({
        success: false,
        message: 'Image paths must be an array'
      });
    }

    // Validate features is array if provided
    if (features && !Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        message: 'Features must be an array'
      });
    }

    const amenityData = {
      name,
      description,
      capacity: parseInt(capacity),
      bookingType,
      weeklySchedule,
      imagePaths: imagePaths || [],
      location: location || '',
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      features: features || [],
      active: active !== undefined ? active : true
    };

    const result = await createAmenityService(adminId, amenityData);

    if (result.success) {
      console.log('✅ Amenity created successfully');
      return res.status(201).json(result);
    } else {
      console.log('❌ Failed to create amenity:', result.message);
      return res.status(400).json(result);
    }

  } catch (error) {
    console.log('❌ ERROR in createAmenity controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get All Amenities Controller
const getAllAmenities = async (req, res) => {
  try {
    console.log('\n📋 GET ALL AMENITIES CONTROLLER CALLED');
    console.log('🔍 Query params:', req.query);

    const { adminId } = req.params;
    const filters = req.query;

    // Validate adminId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId format'
      });
    }

    const result = await getAllAmenitiesService(adminId, filters);

    if (result.success) {
      console.log('✅ Amenities retrieved successfully');
      return res.status(200).json(result);
    } else {
      console.log('❌ Failed to retrieve amenities:', result.message);
      return res.status(400).json(result);
    }

  } catch (error) {
    console.log('❌ ERROR in getAllAmenities controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Single Amenity Controller
const getAmenityById = async (req, res) => {
  try {
    console.log('\n🔍 GET AMENITY BY ID CONTROLLER CALLED');

    const { adminId, amenityId } = req.params;

    // Validate adminId and amenityId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(amenityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amenityId format'
      });
    }

    const result = await getAmenityByIdService(adminId, amenityId);

    if (result.success) {
      console.log('✅ Amenity retrieved successfully');
      return res.status(200).json(result);
    } else {
      console.log('❌ Failed to retrieve amenity:', result.message);
      return res.status(404).json(result);
    }

  } catch (error) {
    console.log('❌ ERROR in getAmenityById controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Amenity Controller
const updateAmenity = async (req, res) => {
  try {
    console.log('\n✏️ UPDATE AMENITY CONTROLLER CALLED');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    const { adminId, amenityId } = req.params;
    const updateData = req.body;

    // Validate adminId and amenityId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(amenityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amenityId format'
      });
    }

    // Validate capacity if provided
    if (updateData.capacity !== undefined) {
      if (isNaN(updateData.capacity) || updateData.capacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be a positive number'
        });
      }
      updateData.capacity = parseInt(updateData.capacity);
    }

    // Validate hourly rate if provided
    if (updateData.hourlyRate !== undefined) {
      if (isNaN(updateData.hourlyRate) || updateData.hourlyRate < 0) {
        return res.status(400).json({
          success: false,
          message: 'Hourly rate must be a non-negative number'
        });
      }
      updateData.hourlyRate = parseFloat(updateData.hourlyRate);
    }

    // Validate imagePaths is array if provided
    if (updateData.imagePaths && !Array.isArray(updateData.imagePaths)) {
      return res.status(400).json({
        success: false,
        message: 'Image paths must be an array'
      });
    }

    // Validate features is array if provided
    if (updateData.features && !Array.isArray(updateData.features)) {
      return res.status(400).json({
        success: false,
        message: 'Features must be an array'
      });
    }

    const result = await updateAmenityService(adminId, amenityId, updateData);

    if (result.success) {
      console.log('✅ Amenity updated successfully');
      return res.status(200).json(result);
    } else {
      console.log('❌ Failed to update amenity:', result.message);
      return res.status(400).json(result);
    }

  } catch (error) {
    console.log('❌ ERROR in updateAmenity controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Amenity Controller
const deleteAmenity = async (req, res) => {
  try {
    console.log('\n🗑️ DELETE AMENITY CONTROLLER CALLED');

    const { adminId, amenityId } = req.params;
    const { hardDelete } = req.query; // ?hardDelete=true for permanent deletion

    // Validate adminId and amenityId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(amenityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amenityId format'
      });
    }

    const result = await deleteAmenityService(adminId, amenityId, hardDelete === 'true');

    if (result.success) {
      console.log('✅ Amenity deleted successfully');
      return res.status(200).json(result);
    } else {
      console.log('❌ Failed to delete amenity:', result.message);
      return res.status(404).json(result);
    }

  } catch (error) {
    console.log('❌ ERROR in deleteAmenity controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Toggle Amenity Status Controller
const toggleAmenityStatus = async (req, res) => {
  try {
    console.log('\n🔄 TOGGLE AMENITY STATUS CONTROLLER CALLED');

    const { adminId, amenityId } = req.params;

    // Validate adminId and amenityId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(amenityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amenityId format'
      });
    }

    const result = await toggleAmenityStatusService(adminId, amenityId);

    if (result.success) {
      console.log('✅ Amenity status toggled successfully');
      return res.status(200).json(result);
    } else {
      console.log('❌ Failed to toggle amenity status:', result.message);
      return res.status(404).json(result);
    }

  } catch (error) {
    console.log('❌ ERROR in toggleAmenityStatus controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
  toggleAmenityStatus
};
