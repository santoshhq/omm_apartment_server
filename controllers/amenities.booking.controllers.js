const AmenityBookingService = require('../services/amenities.booking.services');

class AmenityBookingController {

    // 📅 CREATE NEW BOOKING
    static async createBooking(req, res) {
        try {
            console.log('\n=== 📅 CREATE BOOKING CONTROLLER CALLED ===');
            console.log('📄 Request Body:', req.body);

            const result = await AmenityBookingService.createBooking(req.body);
            
            const statusCode = result.success ? 201 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in createBooking controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // 📋 GET ALL BOOKINGS
    static async getAllBookings(req, res) {
        try {
            console.log('\n=== 📋 GET ALL BOOKINGS CONTROLLER CALLED ===');
            console.log('🔍 Query params:', req.query);

            const filters = {
                status: req.query.status,
                amenityId: req.query.amenityId,
                userId: req.query.userId,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            // Remove undefined filters
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const result = await AmenityBookingService.getAllBookings(filters);
            
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getAllBookings controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // 📝 GET BOOKING BY ID
    static async getBookingById(req, res) {
        try {
            console.log('\n=== 📝 GET BOOKING BY ID CONTROLLER CALLED ===');
            console.log('🆔 Booking ID:', req.params.id);

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            const result = await AmenityBookingService.getBookingById(id);
            
            const statusCode = result.success ? 200 : 404;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getBookingById controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // ✅ UPDATE BOOKING STATUS (Admin only)
    static async updateBookingStatus(req, res) {
        try {
            console.log('\n=== ✅ UPDATE BOOKING STATUS CONTROLLER CALLED ===');
            console.log('🆔 Booking ID:', req.params.id);
            console.log('📄 Request Body:', req.body);

            const { id } = req.params;
            const { status, adminComment } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const result = await AmenityBookingService.updateBookingStatus(id, status, adminComment);
            
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in updateBookingStatus controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // 🗑️ CANCEL BOOKING (User)
    static async cancelBooking(req, res) {
        try {
            console.log('\n=== 🗑️ CANCEL BOOKING CONTROLLER CALLED ===');
            console.log('🆔 Booking ID:', req.params.id);
            console.log('📄 Request Body:', req.body);

            const { id } = req.params;
            const { userId } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required'
                });
            }

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const result = await AmenityBookingService.cancelBooking(id, userId);
            
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in cancelBooking controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // 📊 GET USER BOOKINGS
    static async getUserBookings(req, res) {
        try {
            console.log('\n=== 📊 GET USER BOOKINGS CONTROLLER CALLED ===');
            console.log('👤 User ID:', req.params.userId);
            console.log('🔍 Query params:', req.query);

            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const filters = {
                status: req.query.status,
                upcoming: req.query.upcoming === 'true'
            };

            // Remove undefined filters
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const result = await AmenityBookingService.getUserBookings(userId, filters);
            
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getUserBookings controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // 📊 GET AMENITY BOOKINGS
    static async getAmenityBookings(req, res) {
        try {
            console.log('\n=== 📊 GET AMENITY BOOKINGS CONTROLLER CALLED ===');
            console.log('🏢 Amenity ID:', req.params.amenityId);
            console.log('🔍 Query params:', req.query);

            const { amenityId } = req.params;

            if (!amenityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Amenity ID is required'
                });
            }

            const filters = {
                amenityId: amenityId,
                status: req.query.status,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            // Remove undefined filters
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const result = await AmenityBookingService.getAllBookings(filters);
            
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getAmenityBookings controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // � GET AVAILABLE TIME SLOTS
    static async getAvailableSlots(req, res) {
        try {
            console.log('\n=== 📅 GET AVAILABLE SLOTS CONTROLLER CALLED ===');
            console.log('🏢 Amenity ID:', req.params.amenityId);
            console.log('📅 Date:', req.params.date);

            const { amenityId, date } = req.params;

            if (!amenityId || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Amenity ID and date are required'
                });
            }

            const result = await AmenityBookingService.getAvailableSlots(amenityId, date);
            
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getAvailableSlots controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // �📈 GET BOOKING ANALYTICS
    static async getBookingAnalytics(req, res) {
        try {
            console.log('\n=== 📈 GET BOOKING ANALYTICS CONTROLLER CALLED ===');
            console.log('🔍 Query params:', req.query);

            const { amenityId, startDate, endDate } = req.query;

            // Build analytics query
            const matchQuery = {};
            
            if (amenityId) {
                matchQuery.amenityId = require('mongoose').Types.ObjectId(amenityId);
            }
            
            if (startDate || endDate) {
                matchQuery.date = {};
                if (startDate) {
                    matchQuery.date.$gte = new Date(startDate);
                }
                if (endDate) {
                    matchQuery.date.$lte = new Date(endDate);
                }
            }

            // Get booking statistics
            const { AmenityBooking} = require('../models/amenities.booking');
            
            const analytics = await AmenityBooking.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        acceptedBookings: {
                            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                        },
                        rejectedBookings: {
                            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                        },
                        pendingBookings: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        }
                    }
                }
            ]);

            const stats = analytics[0] || {
                totalBookings: 0,
                acceptedBookings: 0,
                rejectedBookings: 0,
                pendingBookings: 0
            };

            console.log('✅ Analytics calculated:', stats);

            return res.status(200).json({
                success: true,
                message: 'Analytics retrieved successfully',
                data: {
                    ...stats,
                    acceptanceRate: stats.totalBookings > 0 
                        ? Math.round((stats.acceptedBookings / stats.totalBookings) * 100) 
                        : 0
                }
            });

        } catch (error) {
            console.log('❌ ERROR in getBookingAnalytics controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = AmenityBookingController;