const express = require('express');
const router = express.Router();
const AmenityBookingController = require('../controllers/amenities.booking.controllers');

// ===== AMENITY BOOKING ROUTES =====

// 📅 BOOKING MANAGEMENT
router.post('/create', AmenityBookingController.createBooking);                    // Create new booking
router.get('/all', AmenityBookingController.getAllBookings);                      // Get all bookings (admin)
router.get('/booking/:id', AmenityBookingController.getBookingById);              // Get booking by ID
router.put('/booking/:id/status', AmenityBookingController.updateBookingStatus);  // Update booking status (admin)
router.delete('/booking/:id/cancel', AmenityBookingController.cancelBooking);     // Cancel booking (user)

// 👤 USER BOOKING ROUTES
router.get('/user/:userId', AmenityBookingController.getUserBookings);            // Get user's bookings
router.get('/user/:userId/upcoming', (req, res, next) => {                       // Get user's upcoming bookings
    req.query.upcoming = 'true';
    AmenityBookingController.getUserBookings(req, res, next);
});

// 🏢 AMENITY-SPECIFIC ROUTES
router.get('/amenity/:amenityId', AmenityBookingController.getAmenityBookings);   // Get bookings for specific amenity
router.get('/amenity/:amenityId/today', (req, res, next) => {                    // Get today's bookings for amenity
    const today = new Date().toISOString().split('T')[0];
    req.query.startDate = today;
    req.query.endDate = today;
    AmenityBookingController.getAmenityBookings(req, res, next);
});

// 📊 ANALYTICS ROUTES
router.get('/analytics', AmenityBookingController.getBookingAnalytics);           // Get booking analytics
router.get('/analytics/amenity/:amenityId', (req, res, next) => {                // Get analytics for specific amenity
    req.query.amenityId = req.params.amenityId;
    AmenityBookingController.getBookingAnalytics(req, res, next);
});

// 📋 STATUS-BASED ROUTES
router.get('/pending', (req, res, next) => {                                     // Get pending bookings
    req.query.status = 'pending';
    AmenityBookingController.getAllBookings(req, res, next);
});

router.get('/accepted', (req, res, next) => {                                    // Get accepted bookings
    req.query.status = 'accepted';
    AmenityBookingController.getAllBookings(req, res, next);
});

router.get('/rejected', (req, res, next) => {                                    // Get rejected bookings
    req.query.status = 'rejected';
    AmenityBookingController.getAllBookings(req, res, next);
});

// 🔍 SEARCH AND FILTER ROUTES
router.get('/search', AmenityBookingController.getAllBookings);                   // Search bookings with filters

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Amenity Booking API is running',
        timestamp: new Date().toISOString(),
        endpoints: {
            'POST /create': 'Create new booking',
            'GET /all': 'Get all bookings',
            'GET /booking/:id': 'Get booking by ID',
            'PUT /booking/:id/status': 'Update booking status',
            'DELETE /booking/:id/cancel': 'Cancel booking',
            'GET /user/:userId': 'Get user bookings',
            'GET /amenity/:amenityId': 'Get amenity bookings',
            'GET /analytics': 'Get booking analytics',
            'GET /pending': 'Get pending bookings',
            'GET /accepted': 'Get accepted bookings',
            'GET /rejected': 'Get rejected bookings'
        }
    });
});

module.exports = router;