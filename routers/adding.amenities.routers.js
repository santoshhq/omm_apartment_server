const express = require('express');
const router = express.Router();

const {
  createAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
  toggleAmenityStatus
} = require('../controllers/adding.amenities.controllers');

// Create Amenity
// POST /api/amenities/admin/:adminId
router.post('/admin/:adminId', createAmenity);

// Get All Amenities for Admin
// GET /api/amenities/admin/:adminId
// Query parameters: ?active=true&minCapacity=10&maxCapacity=100&search=pool
router.get('/admin/:adminId', getAllAmenities);

// Get Single Amenity by ID
// GET /api/amenities/admin/:adminId/amenity/:amenityId
router.get('/admin/:adminId/amenity/:amenityId', getAmenityById);

// Update Amenity
// PUT /api/amenities/admin/:adminId/amenity/:amenityId
router.put('/admin/:adminId/amenity/:amenityId', updateAmenity);

// Delete Amenity (Soft delete by default, use ?hardDelete=true for permanent)
// DELETE /api/amenities/admin/:adminId/amenity/:amenityId
router.delete('/admin/:adminId/amenity/:amenityId', deleteAmenity);

// Toggle Amenity Status (Active/Inactive)
// PATCH /api/amenities/admin/:adminId/amenity/:amenityId/toggle-status
router.patch('/admin/:adminId/amenity/:amenityId/toggle-status', toggleAmenityStatus);

module.exports = router;