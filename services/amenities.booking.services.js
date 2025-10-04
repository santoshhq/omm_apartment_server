require('dotenv').config();
const { AmenityBooking } = require('../models/amenities.booking');
const { Amenity } = require('../models/adding.amenities');
const AdminMemberProfile = require('../models/auth.models/signup');

class AmenityBookingService {

    // 📅 CREATE NEW BOOKING
    static async createBooking(bookingData) {
        try {
            console.log('\n=== 📅 CREATE AMENITY BOOKING SERVICE CALLED ===');
            console.log('🏢 Amenity ID:', bookingData.amenityId);
            console.log('👤 User ID:', bookingData.userId);
            console.log('📅 Date:', bookingData.date);
            console.log('⏰ Time:', `${bookingData.startTime} - ${bookingData.endTime}`);
            console.log('🎯 Booking Type:', bookingData.bookingType);

            // Validate required fields
            const { amenityId, userId, bookingType, date, startTime, endTime } = bookingData;
            
            if (!amenityId || !userId || !bookingType || !date || !startTime || !endTime) {
                return {
                    success: false,
                    message: 'All fields are required: amenityId, userId, bookingType, date, startTime, endTime'
                };
            }

            // Validate amenity exists and is active
            const amenity = await Amenity.findById(amenityId);
            if (!amenity) {
                return {
                    success: false,
                    message: 'Amenity not found'
                };
            }

            if (!amenity.active) {
                return {
                    success: false,
                    message: 'Amenity is currently inactive'
                };
            }

            console.log('✅ Amenity found:', amenity.name);

            // Validate user exists
            const user = await AdminMemberProfile.findById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            console.log('✅ User found:', `${user.firstName} ${user.lastName}`);

            // Validate booking type matches amenity
            if (bookingData.bookingType !== amenity.bookingType) {
                return {
                    success: false,
                    message: `This amenity only supports ${amenity.bookingType} bookings`
                };
            }

            // Validate date is not in the past
            const bookingDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (bookingDate < today) {
                return {
                    success: false,
                    message: 'Booking date cannot be in the past'
                };
            }

            // Validate time format and logic
            if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) {
                return {
                    success: false,
                    message: 'Invalid time format. Use HH:mm format'
                };
            }

            if (startTime >= endTime) {
                return {
                    success: false,
                    message: 'End time must be after start time'
                };
            }

            // Check amenity schedule for the booking day
            const dayOfWeek = bookingDate.toLocaleDateString('en', { weekday: 'lowercase' });
            const daySchedule = amenity.weeklySchedule.get(dayOfWeek);
            
            if (!daySchedule || daySchedule.closed) {
                return {
                    success: false,
                    message: `Amenity is closed on ${dayOfWeek}s`
                };
            }

            // Check if booking time is within amenity operating hours
            if (startTime < daySchedule.open || endTime > daySchedule.close) {
                return {
                    success: false,
                    message: `Booking time must be within operating hours: ${daySchedule.open} - ${daySchedule.close}`
                };
            }

            // Check for conflicts with existing bookings
            const conflictCheck = await this.checkBookingConflicts(amenityId, date, startTime, endTime, bookingType);
            if (!conflictCheck.success) {
                return conflictCheck;
            }

            // Create the booking
            const newBooking = new AmenityBooking({
                amenityId,
                userId,
                bookingType,
                date: bookingDate,
                startTime,
                endTime,
                status: 'pending'
            });

            const savedBooking = await newBooking.save();
            console.log('✅ Booking created successfully:', savedBooking._id);

            // Populate booking data for response
            const populatedBooking = await AmenityBooking.findById(savedBooking._id)
                .populate('amenityId', 'name location hourlyRate')
                .populate('userId', 'firstName lastName email flatNo');

            return {
                success: true,
                message: 'Booking created successfully',
                data: populatedBooking
            };

        } catch (error) {
            console.log('❌ Error in createBooking service:', error.message);
            return {
                success: false,
                message: 'Internal server error: ' + error.message
            };
        }
    }

    // 🔍 CHECK BOOKING CONFLICTS
    static async checkBookingConflicts(amenityId, date, startTime, endTime, bookingType) {
        try {
            const bookingDate = new Date(date);
            
            // Find existing bookings for the same amenity and date
            const existingBookings = await AmenityBooking.find({
                amenityId: amenityId,
                date: bookingDate,
                status: { $in: ['accepted', 'pending'] } // Only check non-rejected bookings
            });

            if (existingBookings.length === 0) {
                return { success: true };
            }

            // For exclusive bookings, no other bookings allowed
            if (bookingType === 'exclusive') {
                return {
                    success: false,
                    message: 'Exclusive booking conflicts with existing bookings on this date'
                };
            }

            // Check if any existing booking is exclusive
            const hasExclusiveBooking = existingBookings.some(booking => booking.bookingType === 'exclusive');
            if (hasExclusiveBooking) {
                return {
                    success: false,
                    message: 'Cannot book during exclusive booking time slot'
                };
            }

            // For shared bookings, check time overlaps
            const hasTimeConflict = existingBookings.some(booking => {
                return this.doTimesOverlap(startTime, endTime, booking.startTime, booking.endTime);
            });

            if (hasTimeConflict) {
                return {
                    success: false,
                    message: 'Time slot conflicts with existing bookings'
                };
            }

            return { success: true };

        } catch (error) {
            return {
                success: false,
                message: 'Error checking booking conflicts: ' + error.message
            };
        }
    }

    // 📋 GET ALL BOOKINGS (with filters)
    static async getAllBookings(filters = {}) {
        try {
            console.log('\n=== 📋 GET ALL BOOKINGS SERVICE CALLED ===');
            
            const query = {};
            
            // Filter by status
            if (filters.status) {
                query.status = filters.status;
            }
            
            // Filter by amenity
            if (filters.amenityId) {
                query.amenityId = filters.amenityId;
            }
            
            // Filter by user
            if (filters.userId) {
                query.userId = filters.userId;
            }
            
            // Filter by date range
            if (filters.startDate || filters.endDate) {
                query.date = {};
                if (filters.startDate) {
                    query.date.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    query.date.$lte = new Date(filters.endDate);
                }
            }

            console.log('🔍 Query filters:', query);

            const bookings = await AmenityBooking.find(query)
                .populate('amenityId', 'name location hourlyRate imagePaths')
                .populate('userId', 'firstName lastName email flatNo mobile')
                .sort({ date: 1, startTime: 1 });

            console.log('✅ Found bookings:', bookings.length);

            return {
                success: true,
                message: `Found ${bookings.length} bookings`,
                data: bookings
            };

        } catch (error) {
            console.log('❌ Error in getAllBookings service:', error.message);
            return {
                success: false,
                message: 'Internal server error: ' + error.message
            };
        }
    }

    // 📝 GET BOOKING BY ID
    static async getBookingById(bookingId) {
        try {
            console.log('\n=== 📝 GET BOOKING BY ID SERVICE CALLED ===');
            console.log('🆔 Booking ID:', bookingId);

            const booking = await AmenityBooking.findById(bookingId)
                .populate('amenityId', 'name location hourlyRate imagePaths weeklySchedule')
                .populate('userId', 'firstName lastName email flatNo mobile');

            if (!booking) {
                return {
                    success: false,
                    message: 'Booking not found'
                };
            }

            console.log('✅ Booking found:', booking._id);

            return {
                success: true,
                message: 'Booking retrieved successfully',
                data: booking
            };

        } catch (error) {
            console.log('❌ Error in getBookingById service:', error.message);
            return {
                success: false,
                message: 'Internal server error: ' + error.message
            };
        }
    }

    // ✅ UPDATE BOOKING STATUS
    static async updateBookingStatus(bookingId, newStatus, adminComment = '') {
        try {
            console.log('\n=== ✅ UPDATE BOOKING STATUS SERVICE CALLED ===');
            console.log('🆔 Booking ID:', bookingId);
            console.log('📋 New Status:', newStatus);
            console.log('💬 Admin Comment:', adminComment);

            // Validate status
            const validStatuses = ['accepted', 'rejected', 'pending'];
            if (!validStatuses.includes(newStatus)) {
                return {
                    success: false,
                    message: 'Invalid status. Must be: accepted, rejected, or pending'
                };
            }

            const booking = await AmenityBooking.findById(bookingId)
                .populate('amenityId', 'name')
                .populate('userId', 'firstName lastName email');

            if (!booking) {
                return {
                    success: false,
                    message: 'Booking not found'
                };
            }

            // Update booking status
            booking.status = newStatus;
            if (adminComment) {
                booking.adminComment = adminComment;
            }
            booking.updatedAt = new Date();

            const updatedBooking = await booking.save();
            console.log('✅ Booking status updated successfully');

            // Emit real-time notification
            if (global.io) {
                global.io.to(`user_${booking.userId._id}`).emit('booking_status_updated', {
                    bookingId: booking._id,
                    amenityName: booking.amenityId.name,
                    newStatus: newStatus,
                    adminComment: adminComment,
                    updatedAt: updatedBooking.updatedAt
                });
                console.log('🔌 Booking status update broadcasted');
            }

            return {
                success: true,
                message: 'Booking status updated successfully',
                data: updatedBooking
            };

        } catch (error) {
            console.log('❌ Error in updateBookingStatus service:', error.message);
            return {
                success: false,
                message: 'Internal server error: ' + error.message
            };
        }
    }

    // 🗑️ CANCEL BOOKING
    static async cancelBooking(bookingId, userId) {
        try {
            console.log('\n=== 🗑️ CANCEL BOOKING SERVICE CALLED ===');
            console.log('🆔 Booking ID:', bookingId);
            console.log('👤 User ID:', userId);

            const booking = await AmenityBooking.findById(bookingId);
            
            if (!booking) {
                return {
                    success: false,
                    message: 'Booking not found'
                };
            }

            // Check if user owns this booking
            if (booking.userId.toString() !== userId) {
                return {
                    success: false,
                    message: 'You can only cancel your own bookings'
                };
            }

            // Check if booking can be cancelled
            if (booking.status === 'rejected') {
                return {
                    success: false,
                    message: 'Cannot cancel already rejected booking'
                };
            }

            // Check if booking is in the past
            const bookingDateTime = new Date(booking.date);
            const [hours, minutes] = booking.startTime.split(':');
            bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

            if (bookingDateTime < new Date()) {
                return {
                    success: false,
                    message: 'Cannot cancel past bookings'
                };
            }

            // Delete the booking
            await AmenityBooking.findByIdAndDelete(bookingId);
            console.log('✅ Booking cancelled successfully');

            return {
                success: true,
                message: 'Booking cancelled successfully'
            };

        } catch (error) {
            console.log('❌ Error in cancelBooking service:', error.message);
            return {
                success: false,
                message: 'Internal server error: ' + error.message
            };
        }
    }

    // 📊 GET USER BOOKINGS
    static async getUserBookings(userId, filters = {}) {
        try {
            console.log('\n=== 📊 GET USER BOOKINGS SERVICE CALLED ===');
            console.log('👤 User ID:', userId);

            const query = { userId };

            // Add additional filters
            if (filters.status) {
                query.status = filters.status;
            }

            if (filters.upcoming) {
                query.date = { $gte: new Date() };
            }

            const bookings = await AmenityBooking.find(query)
                .populate('amenityId', 'name location hourlyRate imagePaths')
                .sort({ date: 1, startTime: 1 });

            console.log('✅ Found user bookings:', bookings.length);

            return {
                success: true,
                message: `Found ${bookings.length} bookings`,
                data: bookings
            };

        } catch (error) {
            console.log('❌ Error in getUserBookings service:', error.message);
            return {
                success: false,
                message: 'Internal server error: ' + error.message
            };
        }
    }

    // 🛠️ UTILITY METHODS

    static isValidTimeFormat(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    static doTimesOverlap(start1, end1, start2, end2) {
        return start1 < end2 && end1 > start2;
    }

    static calculateBookingDuration(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        return (endTotalMinutes - startTotalMinutes) / 60; // Return hours
    }
}

module.exports = AmenityBookingService;