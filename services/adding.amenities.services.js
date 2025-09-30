require('dotenv').config();
const { addingamenity } = require('../models/adding.amenities');
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
    console.log('🏢 Amenity Name:', amenityData.name);
    console.log('📝 Description:', amenityData.description);
    console.log('👥 Capacity:', amenityData.capacity);
    console.log('💰 Hourly Rate:', amenityData.hourlyRate || DEFAULT_HOURLY_RATE);
    console.log('📍 Location:', amenityData.location || 'Not specified');
    console.log('🖼️ Images:', amenityData.imagePaths?.length || 0);
    console.log('✨ Features:', amenityData.features?.length || 0);

    // Validate admin exists and is verified
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
    if (!amenityData.name || !amenityData.description || !amenityData.capacity) {
      console.log('❌ MISSING REQUIRED FIELDS');
      return {
        success: false,
        message: 'Name, description, and capacity are required fields'
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
    const existingAmenity = await addingamenity.findOne({
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
    const newAmenity = new addingamenity({
      createdByAdminId: adminId,
      name: amenityData.name.trim(),
      description: amenityData.description.trim(),
      capacity: parseInt(amenityData.capacity),
      imagePaths: amenityData.imagePaths || [],
      location: amenityData.location ? amenityData.location.trim() : '',
      hourlyRate: amenityData.hourlyRate || DEFAULT_HOURLY_RATE,
      features: sanitizedFeatures,
      active: amenityData.active !== undefined ? amenityData.active : true
    });

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

    const amenities = await addingamenity.find(query)
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

// Get Single Amenity Service
const getAmenityByIdService = async (adminId, amenityId) => {
  try {
    console.log('\n=== 🔍 GET AMENITY BY ID SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('🏢 Amenity ID:', amenityId);

    const amenity = await addingamenity.findOne({
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
    console.log('📝 Update data:', Object.keys(updateData));

    // Find existing amenity
    const existingAmenity = await addingamenity.findOne({
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
      const duplicateAmenity = await addingamenity.findOne({
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
    const allowedFields = ['name', 'description', 'capacity', 'location', 'hourlyRate', 'imagePaths', 'features', 'active'];
    
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
    const updatedAmenity = await addingamenity.findOneAndUpdate(
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

    const amenity = await addingamenity.findOne({
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
      await addingamenity.findOneAndDelete({
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
      const updatedAmenity = await addingamenity.findOneAndUpdate(
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

    const amenity = await addingamenity.findOne({
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

    const updatedAmenity = await addingamenity.findOneAndUpdate(
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
  getAmenityByIdService,
  updateAmenityService,
  deleteAmenityService,
  toggleAmenityStatusService
};
