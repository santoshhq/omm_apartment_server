const mongoose = require('mongoose');

const db = require('../config/db');
const { Schema } = mongoose;

// Visitor Pre-Approval Schema
const visitorSchema = new Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminSignup',
        required: true,
        index: true
    },
    memberUid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminMemberProfile',
        required: true,
        index: true
    },
    flatId: {
        type: String,
        required: true,
        trim: true
    },
    guestName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    guestPhone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, 'Invalid phone number format']
    },
    preApprovalType: {
        type: String,
        enum: ['guest', 'cab', 'delivery', 'tools', 'other'],
        default: 'guest'
    },
    // Guest specific fields
    inviteType: {
        type: String,
        enum: ['single', 'group'],
        default: 'single'
    },
    totalCount: {
        type: Number,
        default: 1,
        min: 1,
        max: 50 // Maximum 50 people in a group
    },
    approvedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Cab specific fields
    vehicleNumber: {
        type: String,
        trim: true
    },
    cabCompanyName: {
        type: String,
        trim: true
    },
    // Delivery specific fields
    deliveryCompanyName: {
        type: String,
        trim: true
    },
    // Tools/Service specific fields
    serviceName: {
        type: String,
        trim: true
    },
    servicePersonName: {
        type: String,
        trim: true
    },
    servicePersonPhone: {
        type: String,
        trim: true,
        match: [/^\d{10}$/, 'Invalid phone number format']
    },
    gateId: {
        type: [String],
        required: true,
        enum: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'expired'],
        default: 'pending'
    },
    expiry: {
        type: Date,
        required: true
    },
    otpCode: {
        type: String,
        unique: true,
        length: 4
    },
    qrCode: {
        type: String // Base64 encoded QR code image
    }
}, {
    timestamps: true
});

// Indexes for performance
visitorSchema.index({ adminId: 1, gateId: 1, status: 1 });
visitorSchema.index({ expiry: 1 });

// Pre-save middleware to generate unique OTP
visitorSchema.pre('save', async function(next) {
    if (this.isNew) {
        let otp;
        let isUnique = false;
        while (!isUnique) {
            otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
            const existing = await db.model('Visitor').findOne({ otpCode: otp });
            if (!existing) {
                isUnique = true;
            }
        }
        this.otpCode = otp;
    }
    next();
});

// Static method to expire old approvals and clean up old records
visitorSchema.statics.expireOldApprovals = async function() {
    const now = new Date();

    // Expire pending requests that have passed their expiry time
    await this.updateMany(
        { expiry: { $lt: now }, status: 'pending' },
        { status: 'expired' }
    );

    // Delete approved requests that are older than 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await this.deleteMany({
        status: 'approved',
        createdAt: { $lt: twentyFourHoursAgo }
    });

    // Delete expired requests that are older than 1 hour (cleanup)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    await this.deleteMany({
        status: 'expired',
        updatedAt: { $lt: oneHourAgo }
    });
};

const Visitor = db.model('Visitor', visitorSchema);

module.exports = Visitor;