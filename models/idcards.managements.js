const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;

// ID Card Management Schema
const idCardManagementSchema = new Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminMemberProfile', // Reference to member profile
        required: true,
        index: true
    },
    cardName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    cardNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50
    },
    cardType: {
        type: String,
        enum: [
            'governmentId',
            'drivingLicense',
            'vehicleRegistration',
            'healthInsurance',
            'bankCard',
            'panCard',
            'passport',
            'other'
        ],
        required: true
    },
    issueAuthority: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    issueDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: 'Issue date cannot be in the future'
        }
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true // Fixed typo from "timberstamps"
});

// Add indexes for better query performance
idCardManagementSchema.index({ cardType: 1 });
idCardManagementSchema.index({ memberId: 1, cardType: 1 });

// Pre-save middleware for validation
idCardManagementSchema.pre('save', function(next) {
    console.log(`[IdCardManagement] Saving ID card for member: ${this.memberId}, Card: ${this.cardName}`);
    
    // Validate dates
    if (this.issueDate && this.expiryDate) {
        if (this.expiryDate <= this.issueDate) {
            const error = new Error('Expiry date must be after issue date');
            return next(error);
        }
    }
    
    next();
});

// Post-save middleware for logging
idCardManagementSchema.post('save', function(doc) {
    console.log(`[IdCardManagement] Successfully saved ID card with ID: ${doc._id}`);
});

// Pre-remove middleware for logging
idCardManagementSchema.pre('remove', function(next) {
    console.log(`[IdCardManagement] Removing ID card with ID: ${this._id}`);
    next();
});

const IdCardManagement = db.model('IdCardManagement', idCardManagementSchema);
module.exports = IdCardManagement;
