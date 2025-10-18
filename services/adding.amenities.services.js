require('dotenv').config();
const { Amenity } = require('../models/adding.amenities');
const Signup = require('../models/auth.models/signup');

// Environment variables
const DEFAULT_HOURLY_RATE = parseFloat(process.env.DEFAULT_AMENITY_HOURLY_RATE) || 0.0;
const MAX_IMAGES_PER_AMENITY = parseInt(process.env.MAX_IMAGES_PER_AMENITY) || 10;
const MAX_FEATURES_PER_AMENITY = parseInt(process.env.MAX_FEATURES_PER_AMENITY) || 20;

// Create Amenity Service
const createAmenityService = async (adminId, amenityData) => {
  try {
    console.log('\n=== 🏢 CREATE AMENITY SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('📦 FULL AMENITY DATA RECEIVED:');
    console.log(JSON.stringify(amenityData, null, 2));
    console.log('\n🔍 INDIVIDUAL FIELD CHECK:');
    console.log('🏢 Amenity Name:', amenityData.name);
    console.log('📝 Description:', amenityData.description);
    console.log('👥 Capacity:', amenityData.capacity);
    console.log('🎯 Booking Type:', amenityData.bookingType);
    console.log('📅 Weekly Schedule:', !!amenityData.weeklySchedule);
    console.log('📅 Schedule Keys:', amenityData.weeklySchedule ? Object.keys(amenityData.weeklySchedule) : 'undefined');
    console.log('💰 Hourly Rate:', amenityData.hourlyRate || DEFAULT_HOURLY_RATE);
    console.log('📍 Location:', amenityData.location || 'Not specified');
    console.log('🖼️ Images:', amenityData.imagePaths?.length || 0);
    console.log('✨ Features:', amenityData.features?.length || 0);

    // Validate admin exists and is verified
    console.log('🔍 Checking admin with ID:', adminId);
    
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

    // Validate required fields
    const requiredFields = ['name', 'description', 'capacity', 'bookingType', 'weeklySchedule'];
    const missingFields = requiredFields.filter(field => !amenityData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ MISSING REQUIRED FIELDS:', missingFields);
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Validate bookingType
    if (!['shared', 'exclusive'].includes(amenityData.bookingType)) {
      console.log('❌ INVALID BOOKING TYPE:', amenityData.bookingType);
      return {
        success: false,
        message: 'Booking type must be either "shared" or "exclusive"'
      };
    }

    // Validate weeklySchedule
    const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const scheduleDays = Object.keys(amenityData.weeklySchedule || {});
    const missingDays = requiredDays.filter(day => !scheduleDays.includes(day));
    
    if (missingDays.length > 0) {
      console.log('❌ MISSING SCHEDULE DAYS:', missingDays);
      return {
        success: false,
        message: `Weekly schedule must include all days. Missing: ${missingDays.join(', ')}`
      };
    }

    // Validate capacity is positive number
    if (amenityData.capacity <= 0) {
      console.log('❌ INVALID CAPACITY');
      return {
        success: false,
        message: 'Capacity must be a positive number'
      };
    }

    // Validate images array length
    if (amenityData.imagePaths && amenityData.imagePaths.length > MAX_IMAGES_PER_AMENITY) {
      console.log('❌ TOO MANY IMAGES');
      return {
        success: false,
        message: `Maximum ${MAX_IMAGES_PER_AMENITY} images allowed per amenity`
      };
    }

    // Validate features array length
    if (amenityData.features && amenityData.features.length > MAX_FEATURES_PER_AMENITY) {
      console.log('❌ TOO MANY FEATURES');
      return {
        success: false,
        message: `Maximum ${MAX_FEATURES_PER_AMENITY} features allowed per amenity`
      };
    }

    // Check if amenity with same name already exists for this admin
    const existingAmenity = await Amenity.findOne({
      createdByAdminId: adminId,
      name: { $regex: new RegExp(`^${amenityData.name}$`, 'i') }
    });

    if (existingAmenity) {
      console.log('❌ AMENITY NAME ALREADY EXISTS');
      return {
        success: false,
        message: 'An amenity with this name already exists'
      };
    }

    // Sanitize features array (remove empty strings and duplicates)
    const sanitizedFeatures = amenityData.features 
      ? [...new Set(amenityData.features.filter(feature => feature && feature.trim()))]
      : [];

    // Create amenity object
    console.log('🏗️ Creating Amenity with data:');
    const amenityCreateData = {
      createdByAdminId: adminId,
      name: amenityData.name.trim(),
      description: amenityData.description.trim(),
      capacity: parseInt(amenityData.capacity),
      bookingType: amenityData.bookingType,
      weeklySchedule: amenityData.weeklySchedule,
      imagePaths: amenityData.imagePaths || [],
      location: amenityData.location ? amenityData.location.trim() : '',
      hourlyRate: amenityData.hourlyRate || DEFAULT_HOURLY_RATE,
      features: sanitizedFeatures,
      active: amenityData.active !== undefined ? amenityData.active : true
    };
    
    console.log('📝 Final amenity creation data:');
    console.log(JSON.stringify(amenityCreateData, null, 2));
    
    const newAmenity = new Amenity(amenityCreateData);

    // Save amenity
    const savedAmenity = await newAmenity.save();
    console.log('💾 Amenity saved with ID:', savedAmenity._id);

    console.log('🎉 AMENITY CREATED SUCCESSFULLY');

    return {
      success: true,
      message: 'Amenity created successfully!',
      data: {
        amenity: {
          id: savedAmenity._id,
          name: savedAmenity.name,
          description: savedAmenity.description,
          capacity: savedAmenity.capacity,
          location: savedAmenity.location,
          hourlyRate: savedAmenity.hourlyRate,
          images: savedAmenity.imagePaths,
          features: savedAmenity.features,
          active: savedAmenity.active,
          createdAt: savedAmenity.createdAt
        },
        adminInfo: {
          createdByAdminId: adminId,
          adminEmail: admin.email
        }
      }
    };

  } catch (error) {
    console.log('❌ ERROR in createAmenityService:', error.message);
    return {
      success: false,
      message: 'Error creating amenity',
      error: error.message
    };
  }
};

// Get All Amenities Service
const getAllAmenitiesService = async (adminId, filters = {}) => {
  try {
    console.log('\n=== 📋 GET ALL AMENITIES SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('🔍 Filters:', filters);

    // Build query
    const query = { createdByAdminId: adminId };
    
    // Apply filters
    if (filters.active !== undefined) {
      query.active = filters.active === 'true';
    }
    
    if (filters.minCapacity) {
      query.capacity = { $gte: parseInt(filters.minCapacity) };
    }
    
    if (filters.maxCapacity) {
      query.capacity = { ...query.capacity, $lte: parseInt(filters.maxCapacity) };
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { location: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const amenities = await Amenity.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log('✅ Found', amenities.length, 'amenities');

    return {
      success: true,
      message: 'Amenities retrieved successfully',
      data: {
        totalAmenities: amenities.length,
        amenities: amenities.map(amenity => ({
          id: amenity._id,
          name: amenity.name,
          description: amenity.description,
          capacity: amenity.capacity,
          bookingType: amenity.bookingType,
          weeklySchedule: amenity.weeklySchedule,
          location: amenity.location,
          hourlyRate: amenity.hourlyRate,
          images: amenity.imagePaths,
          features: amenity.features,
          active: amenity.active,
          createdAt: amenity.createdAt,
          updatedAt: amenity.updatedAt
        }))
      }
    };

  } catch (error) {
    console.log('❌ ERROR in getAllAmenitiesService:', error.message);
    return {
      success: false,
      message: 'Error fetching amenities',
      error: error.message
    };
  }
};

// Get All Amenities for Public Users (Active Only)
const getAllAmenitiesPublicService = async (filters = {}) => {
  try {
    console.log('\n=== 🌐 GET ALL AMENITIES PUBLIC SERVICE CALLED ===');
    console.log('🔍 Filters:', JSON.stringify(filters, null, 2));

    // Build query - only active amenities for public users
    const query = { active: true };

    // Apply additional filters if provided
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { location: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.bookingType) {
      query.bookingType = filters.bookingType;
    }

    if (filters.minCapacity) {
      query.capacity = { ...query.capacity, $gte: parseInt(filters.minCapacity) };
    }

    if (filters.maxCapacity) {
      query.capacity = { ...query.capacity, $lte: parseInt(filters.maxCapacity) };
    }

    console.log('🔍 Final Query:', JSON.stringify(query, null, 2));

    const amenities = await Amenity.find(query)
      .sort({ createdAt: -1 })
      .select('-createdByAdminId -updatedAt'); // Exclude sensitive fields

    console.log('📊 Total public amenities found:', amenities.length);

    return {
      success: true,
      message: 'Amenities fetched successfully',
      data: amenities.map(amenity => ({
        _id: amenity._id,
        name: amenity.name,
        description: amenity.description,
        location: amenity.location,
        capacity: amenity.capacity,
        bookingType: amenity.bookingType,
        hourlyRate: amenity.hourlyRate,
        features: amenity.features,
        imagePaths: amenity.imagePaths,
        weeklySchedule: amenity.weeklySchedule,
        active: amenity.active,
        createdAt: amenity.createdAt
      }))
    };

  } catch (error) {
    console.log('❌ ERROR in getAllAmenitiesPublicService:', error.message);
    return {
      success: false,
      message: 'Error fetching amenities',
      error: error.message
    };
  }
};

// Get Single Amenity Service
const getAmenityByIdService = async (adminId, amenityId) => {
  try {
    console.log('\n=== 🔍 GET AMENITY BY ID SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('🏢 Amenity ID:', amenityId);

    const amenity = await Amenity.findOne({
      _id: amenityId,
      createdByAdminId: adminId
    }).lean();

    if (!amenity) {
      console.log('❌ AMENITY NOT FOUND');
      return {
        success: false,
        message: 'Amenity not found or access denied'
      };
    }

    console.log('✅ Amenity found:', amenity.name);

    return {
      success: true,
      message: 'Amenity retrieved successfully',
      data: {
        amenity: {
          id: amenity._id,
          name: amenity.name,
          description: amenity.description,
          capacity: amenity.capacity,
          location: amenity.location,
          hourlyRate: amenity.hourlyRate,
          images: amenity.imagePaths,
          features: amenity.features,
          active: amenity.active,
          createdAt: amenity.createdAt,
          updatedAt: amenity.updatedAt
        }
      }
    };

  } catch (error) {
    console.log('❌ ERROR in getAmenityByIdService:', error.message);
    return {
      success: false,
      message: 'Error fetching amenity',
      error: error.message
    };
  }
};

// Update Amenity Service
const updateAmenityService = async (adminId, amenityId, updateData) => {
  try {
    console.log('\n=== ✏️ UPDATE AMENITY SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('🏢 Amenity ID:', amenityId);
    console.log('📝 Update data keys:', Object.keys(updateData));
    console.log('📦 FULL UPDATE DATA:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Special logging for weeklySchedule
    if (updateData.weeklySchedule) {
      console.log('📅 Weekly Schedule Update:');
      console.log(JSON.stringify(updateData.weeklySchedule, null, 2));
    }

    // Find existing amenity
    const existingAmenity = await Amenity.findOne({
      _id: amenityId,
      createdByAdminId: adminId
    });

    if (!existingAmenity) {
      console.log('❌ AMENITY NOT FOUND');
      return {
        success: false,
        message: 'Amenity not found or access denied'
      };
    }

    console.log('✅ Amenity found:', existingAmenity.name);

    // Validate capacity if provided
    if (updateData.capacity !== undefined && updateData.capacity <= 0) {
      console.log('❌ INVALID CAPACITY');
      return {
        success: false,
        message: 'Capacity must be a positive number'
      };
    }

    // Validate images array length
    if (updateData.imagePaths && updateData.imagePaths.length > MAX_IMAGES_PER_AMENITY) {
      console.log('❌ TOO MANY IMAGES');
      return {
        success: false,
        message: `Maximum ${MAX_IMAGES_PER_AMENITY} images allowed per amenity`
      };
    }

    // Validate features array length
    if (updateData.features && updateData.features.length > MAX_FEATURES_PER_AMENITY) {
      console.log('❌ TOO MANY FEATURES');
      return {
        success: false,
        message: `Maximum ${MAX_FEATURES_PER_AMENITY} features allowed per amenity`
      };
    }

    // Check for duplicate name if name is being updated
    if (updateData.name && updateData.name !== existingAmenity.name) {
      const duplicateAmenity = await Amenity.findOne({
        createdByAdminId: adminId,
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: amenityId }
      });

      if (duplicateAmenity) {
        console.log('❌ AMENITY NAME ALREADY EXISTS');
        return {
          success: false,
          message: 'An amenity with this name already exists'
        };
      }
    }

    // Prepare update object
    const updateObject = {};
    const allowedFields = ['name', 'description', 'capacity', 'bookingType', 'weeklySchedule', 'location', 'hourlyRate', 'imagePaths', 'features', 'active'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'features') {
          // Sanitize features array
          updateObject[field] = [...new Set(updateData[field].filter(feature => feature && feature.trim()))];
        } else if (field === 'name' || field === 'description' || field === 'location') {
          updateObject[field] = updateData[field].trim();
        } else {
          updateObject[field] = updateData[field];
        }
      }
    }

    console.log('📝 Fields to update:', Object.keys(updateObject));

    // Track changes for logging
    const oldValues = {};
    const newValues = {};
    for (const field of Object.keys(updateObject)) {
      oldValues[field] = existingAmenity[field];
      newValues[field] = updateObject[field];
    }

    // Update amenity
    const updatedAmenity = await Amenity.findOneAndUpdate(
      { _id: amenityId, createdByAdminId: adminId },
      updateObject,
      { new: true, runValidators: true }
    );

    console.log('✅ AMENITY UPDATED SUCCESSFULLY');

    return {
      success: true,
      message: 'Amenity updated successfully',
      data: {
        amenity: {
          id: updatedAmenity._id,
          name: updatedAmenity.name,
          description: updatedAmenity.description,
          capacity: updatedAmenity.capacity,
          location: updatedAmenity.location,
          hourlyRate: updatedAmenity.hourlyRate,
          images: updatedAmenity.imagePaths,
          features: updatedAmenity.features,
          active: updatedAmenity.active,
          updatedAt: updatedAmenity.updatedAt
        },
        changes: {
          fieldsUpdated: Object.keys(updateObject),
          oldValues,
          newValues
        }
      }
    };

  } catch (error) {
    console.log('❌ ERROR in updateAmenityService:', error.message);
    return {
      success: false,
      message: 'Error updating amenity',
      error: error.message
    };
  }
};

// Delete Amenity Service (Soft Delete)
const deleteAmenityService = async (adminId, amenityId, hardDelete = false) => {
  try {
    console.log('\n=== 🗑️ DELETE AMENITY SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('🏢 Amenity ID:', amenityId);
    console.log('💥 Hard Delete:', hardDelete);

    const amenity = await Amenity.findOne({
      _id: amenityId,
      createdByAdminId: adminId
    });

    if (!amenity) {
      console.log('❌ AMENITY NOT FOUND');
      return {
        success: false,
        message: 'Amenity not found or access denied'
      };
    }

    console.log('✅ Amenity found:', amenity.name);

    if (hardDelete) {
      // Permanent deletion
      await Amenity.findOneAndDelete({
        _id: amenityId,
        createdByAdminId: adminId
      });
      console.log('💥 AMENITY PERMANENTLY DELETED');
      
      return {
        success: true,
        message: 'Amenity permanently deleted',
        data: {
          deletedAmenity: {
            id: amenity._id,
            name: amenity.name
          }
        }
      };
    } else {
      // Soft delete (mark as inactive)
      const updatedAmenity = await Amenity.findOneAndUpdate(
        { _id: amenityId, createdByAdminId: adminId },
        { active: false },
        { new: true }
      );
      
      console.log('🚫 AMENITY DEACTIVATED');
      
      return {
        success: true,
        message: 'Amenity deactivated successfully',
        data: {
          amenity: {
            id: updatedAmenity._id,
            name: updatedAmenity.name,
            active: updatedAmenity.active
          }
        }
      };
    }

  } catch (error) {
    console.log('❌ ERROR in deleteAmenityService:', error.message);
    return {
      success: false,
      message: 'Error deleting amenity',
      error: error.message
    };
  }
};

// Toggle Amenity Status Service
const toggleAmenityStatusService = async (adminId, amenityId) => {
  try {
    console.log('\n=== 🔄 TOGGLE AMENITY STATUS SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('🏢 Amenity ID:', amenityId);

    const amenity = await Amenity.findOne({
      _id: amenityId,
      createdByAdminId: adminId
    });

    if (!amenity) {
      console.log('❌ AMENITY NOT FOUND');
      return {
        success: false,
        message: 'Amenity not found or access denied'
      };
    }

    const newStatus = !amenity.active;
    console.log('🔄 Toggling status:', amenity.active, '→', newStatus);

    const updatedAmenity = await Amenity.findOneAndUpdate(
      { _id: amenityId, createdByAdminId: adminId },
      { active: newStatus },
      { new: true }
    );

    console.log('✅ STATUS TOGGLED SUCCESSFULLY');

    return {
      success: true,
      message: `Amenity ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        amenity: {
          id: updatedAmenity._id,
          name: updatedAmenity.name,
          active: updatedAmenity.active,
          updatedAt: updatedAmenity.updatedAt
        }
      }
    };

  } catch (error) {
    console.log('❌ ERROR in toggleAmenityStatusService:', error.message);
    return {
      success: false,
      message: 'Error toggling amenity status',
      error: error.message
    };
  }
};

module.exports = {
  createAmenityService,
  getAllAmenitiesService,
  getAllAmenitiesPublicService,
  getAmenityByIdService,
  updateAmenityService,
  deleteAmenityService,
  toggleAmenityStatusService
};
