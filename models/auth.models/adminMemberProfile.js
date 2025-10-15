const mongoose = require('mongoose');
const db = require('../../config/db');

const { Schema } = mongoose;

// Admin-Created Members Profile Schema
const adminMemberProfileSchema = new Schema({
  // Basic Profile Information
  profileImage: { 
    type: String, 
    default: null 
  },
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  mobile: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    unique: true, 
    trim: true 
  },

  // Property Details
  floor: { 
    type: String, 
    required: true,
    enum: ['I', 'II', 'III', 'IV', 'V'],
    trim: true 
  },
  flatNo: { 
    type: String, 
    required: true, 
    trim: true 
  },
  paymentStatus: { 
    type: String, 
    required: true,
    enum: ['Booked', 'Available', 'Pending', 'Paid', 'Due'],
    default: 'Available'
  },
  parkingArea: { 
    type: String, 
    required: true,
    enum: ['P1', 'P2', 'N/A', null],
    trim: true,
   // default: null
  },
  parkingSlot: { 
    type: String, 
    required: true,
    trim: true,
   // default: null
  },

  // Government ID Details
  govtIdType: { 
    type: String, 
    required: true,
    enum: ['AadharCard', 'PanCard', 'VoterID', 'Passport', 'DrivingLicense'],
    default: 'AadharCard'
  },
  govtIdImage: { 
    type: String, 
    required: true 
  },

  // Admin tracking - WHO CREATED THIS MEMBER
  createdByAdminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'adminSignup',
    required: true 
  },
  
  // Link to member credentials
  memberCredentialsId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AdminMemberCredentials',
    default: null 
  },

  // Member status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Creation method
  createdBy: {
    type: String,
    default: 'Admin',
    enum: ['Admin', 'SelfRegistration']
  },

  // Password Reset OTP (for member forgot password)
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordOTPExpiry: {
    type: Date,
    default: null
  }

}, { 
  timestamps: true 
});

const AdminMemberProfile = db.model('AdminMemberProfile', adminMemberProfileSchema);

module.exports = AdminMemberProfile;