require('dotenv').config();
const { AmenityBooking } = require('../models/amenities.booking');
const { Amenity } = require('../models/adding.amenities');
const AdminMemberProfile = require('../models/auth.models/adminMemberProfile');

class AmenityBookingService {

    // 📅 CREATE NEW BOOKING
    static async createBooking(bookingData) {
        try {
            console.log('\n=== 📅 CREATE AMENITY BOOKING SERVICE CALLED ===');
            console.log('🏢 Amenity ID:', bookingData.amenityId);
            console.log('👤 User ID:', bookingData.userId);
            if (bookingData.adminId) console.log('🛡️ Admin ID:', bookingData.adminId);
            console.log('📅 Date:', bookingData.date);
            console.log('⏰ Time:', `${bookingData.startTime} - ${bookingData.endTime}`);
            console.log('🎯 Booking Type:', bookingData.bookingType);
            console.log('💳 Payment Type:', bookingData.paymentType);
            console.log('💰 Amount:', bookingData.amount);

            // Validate required fields
            const { amenityId, userId, bookingType, date, startTime, endTime, paymentType, amount } = bookingData;
            
            if (!amenityId || !userId || !bookingType || !date || !startTime || !endTime || !paymentType || amount == null) {
                return {
                    success: false,
                    message: 'All fields are required: amenityId, userId, bookingType, date, startTime, endTime, paymentType, amount'
                };
            }

            // Validate date format and logic
            const bookingDate = new Date(date);
            if (isNaN(bookingDate.getTime())) {
                return {
                    success: false,
                    message: 'Invalid date format. Please provide a valid date.'
                };
            }

            // Validate date is not in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const bookingDateOnly = new Date(bookingDate);
            bookingDateOnly.setHours(0, 0, 0, 0);
            
            if (bookingDateOnly < today) {
                return {
                    success: false,
                    message: 'Booking date cannot be in the past. Please select a future date.'
                };
            }

            // Validate time format and logic
            if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) {
                return {
                    success: false,
                    message: 'Invalid time format. Please use HH:mm format (e.g., 09:00, 14:30).'
                };
            }

            if (startTime >= endTime) {
                return {
                    success: false,
                    message: 'End time must be after start time. Please select a valid time range.'
                };
            }

            // Validate minimum booking duration (at least 30 minutes)
            const duration = this.calculateBookingDuration(startTime, endTime);
            if (duration < 0.5) {
                return {
                    success: false,
                    message: 'Minimum booking duration is 30 minutes. Please select a longer time slot.'
                };
            }

            // Validate maximum booking duration (max 8 hours)
            if (duration > 8) {
                return {
                    success: false,
                    message: 'Maximum booking duration is 8 hours. Please select a shorter time slot.'
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

            // Check amenity schedule for the booking day
            const dayOfWeek = bookingDate.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
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
                status: 'pending',
                paymentType,
                amount
            });

            const savedBooking = await newBooking.save();
            console.log('✅ Booking created successfully:', savedBooking._id);

            // Populate booking data for response
            const populatedBooking = await AmenityBooking.findById(savedBooking._id)
                .populate('amenityId', 'name location hourlyRate')
                .populate('userId', 'firstName lastName floor mobile flatNo');

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
            console.log('\n=== 🔍 CHECK BOOKING CONFLICTS CALLED ===');
            console.log('🏢 Amenity ID:', amenityId);
            console.log('📅 Date:', date);
            console.log('⏰ Time:', `${startTime} - ${endTime}`);
            console.log('🎯 Booking Type:', bookingType);
            const bookingDate = new Date(date);
            // Find all bookings for this amenity and date that are not rejected
            const existingBookings = await AmenityBooking.find({
                amenityId: amenityId,
                date: bookingDate,
                status: { $in: ['accepted', 'pending'] }
            });
            console.log('🔎 Existing bookings found:', existingBookings.length);

            // If bookingType is exclusive, block if any booking (exclusive or shared) overlaps
            if (bookingType === 'exclusive') {
                const hasTimeConflict = existingBookings.some(booking =>
                    this.doTimesOverlap(startTime, endTime, booking.startTime, booking.endTime)
                );
                if (hasTimeConflict) {
                    console.log('❌ Conflict: Overlapping booking exists for exclusive slot.');
                    return {
                        success: false,
                        message: 'This slot is already booked for an exclusive event. Please choose another time.'
                    };
                }
                return { success: true };
            }

            // If any existing exclusive booking overlaps, block this shared booking
            const hasExclusiveConflict = existingBookings.some(booking =>
                booking.bookingType === 'exclusive' && this.doTimesOverlap(startTime, endTime, booking.startTime, booking.endTime)
            );
            if (hasExclusiveConflict) {
                console.log('❌ Conflict: Overlapping exclusive booking exists.');
                return {
                    success: false,
                    message: 'This slot is already booked for an exclusive event. Please choose another time.'
                };
            }

            // For shared bookings, check time overlaps with other shared bookings if needed (optional)
            // const hasSharedConflict = existingBookings.some(booking =>
            //     booking.bookingType === 'shared' && this.doTimesOverlap(startTime, endTime, booking.startTime, booking.endTime)
            // );
            // if (hasSharedConflict) {
            //     console.log('❌ Conflict: Overlapping shared booking exists.');
            //     return {
            //         success: false,
            //         message: 'Time slot conflicts with existing shared bookings.'
            //     };
            // }

            console.log('✅ No booking conflicts detected.');
            return { success: true };
        } catch (error) {
            console.log('❌ Error in checkBookingConflicts:', error.message);
            return {
                success: false,
                message: 'Error checking booking conflicts: ' + error.message
            };
        }
    }

    // � GET AVAILABLE TIME SLOTS FOR A DATE
    static async getAvailableSlots(amenityId, date) {
        try {
            console.log('\n=== 📅 GET AVAILABLE SLOTS SERVICE CALLED ===');
            console.log('🏢 Amenity ID:', amenityId);
            console.log('📅 Date:', date);

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

            // Validate date
            const bookingDate = new Date(date);
            if (isNaN(bookingDate.getTime())) {
                return {
                    success: false,
                    message: 'Invalid date format'
                };
            }

            // Check if date is in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkDate = new Date(bookingDate);
            checkDate.setHours(0, 0, 0, 0);
            
            if (checkDate < today) {
                return {
                    success: false,
                    message: 'Cannot check availability for past dates'
                };
            }

            // Get day of week and schedule
            const dayOfWeek = bookingDate.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
            const daySchedule = amenity.weeklySchedule.get(dayOfWeek);
            
            if (!daySchedule || daySchedule.closed) {
                return {
                    success: true,
                    data: {
                        date: date,
                        dayOfWeek: dayOfWeek,
                        isClosed: true,
                        message: `Amenity is closed on ${dayOfWeek}s`,
                        availableSlots: []
                    }
                };
            }

            // Get existing bookings for this date
            const existingBookings = await AmenityBooking.find({
                amenityId: amenityId,
                date: bookingDate,
                status: { $in: ['accepted', 'pending'] }
            });

            // Generate time slots (30-minute intervals)
            const availableSlots = this.generateAvailableSlots(daySchedule.open, daySchedule.close, existingBookings, amenity.bookingType);

            console.log('✅ Available slots generated:', availableSlots.length);

            return {
                success: true,
                data: {
                    date: date,
                    dayOfWeek: dayOfWeek,
                    operatingHours: `${daySchedule.open} - ${daySchedule.close}`,
                    bookingType: amenity.bookingType,
                    availableSlots: availableSlots
                }
            };

        } catch (error) {
            console.log('❌ Error in getAvailableSlots service:', error.message);
            return {
                success: false,
                message: 'Error fetching available slots',
                error: error.message
            };
        }
    }

    // �📋 GET ALL BOOKINGS (with filters)
    static async getAllBookings(filters = {}) {
        try {
            console.log('\n=== 📋 GET ALL BOOKINGS SERVICE CALLED ===');
            console.log('🔍 Filters:', filters);
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
            console.log('🔍 Query for bookings:', query);
            const bookings = await AmenityBooking.find(query)
                .populate('amenityId', 'name location hourlyRate imagePaths')
                .populate('userId', 'firstName lastName floor mobile flatNo')
                .sort({ date: 1, startTime: 1 });
            console.log('✅ Bookings found:', bookings.length);
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
                .populate('userId', 'firstName lastName floor mobile flatNo');
            if (!booking) {
                console.log('❌ Booking not found for ID:', bookingId);
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
    static async updateBookingStatus(bookingId, newStatus, adminComment = '', adminId = null) {
        try {
            console.log('\n=== ✅ UPDATE BOOKING STATUS SERVICE CALLED ===');
            console.log('🆔 Booking ID:', bookingId);
            console.log('📋 New Status:', newStatus);
            console.log('💬 Admin Comment:', adminComment);
            if (adminId) console.log('🛡️ Admin ID:', adminId);
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
                .populate('userId', 'firstName lastName floor mobile');
            if (!booking) {
                console.log('❌ Booking not found for ID:', bookingId);
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
            if (adminId) {
                booking.adminId = adminId;
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
            console.log('🔍 Filters:', filters);
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
                .populate('userId', 'firstName lastName floor mobile flatNo')
                .sort({ date: 1, startTime: 1 });
            console.log('✅ User bookings found:', bookings.length);
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

    static generateAvailableSlots(openTime, closeTime, existingBookings, bookingType) {
        const slots = [];
        const [openHour, openMin] = openTime.split(':').map(Number);
        const [closeHour, closeMin] = closeTime.split(':').map(Number);
        
        let currentHour = openHour;
        let currentMin = openMin;
        
        // Generate 30-minute slots
        while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
            const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
            
            // Calculate end time (30 minutes later)
            let endMin = currentMin + 30;
            let endHour = currentHour;
            if (endMin >= 60) {
                endMin = 0;
                endHour += 1;
            }
            
            // Don't go beyond closing time
            if (endHour > closeHour || (endHour === closeHour && endMin > closeMin)) {
                break;
            }
            
            const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
            
            // Check if this slot conflicts with existing bookings
            let isAvailable = true;
            for (const booking of existingBookings) {
                if (this.doTimesOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
                    if (bookingType === 'exclusive' || booking.bookingType === 'exclusive') {
                        isAvailable = false;
                        break;
                    }
                }
            }
            
            if (isAvailable) {
                slots.push({
                    startTime: startTime,
                    endTime: endTime,
                    duration: 0.5, // 30 minutes
                    available: true
                });
            }
            
            // Move to next slot
            currentMin += 30;
            if (currentMin >= 60) {
                currentMin = 0;
                currentHour += 1;
            }
        }
        
        return slots;
    }
}

module.exports = AmenityBookingService;