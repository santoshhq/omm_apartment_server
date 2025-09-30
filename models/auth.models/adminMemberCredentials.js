const mongoose = require('mongoose');
const db = require('../../config/db');

const { Schema } = mongoose;

// Admin-Created Member Credentials Schema
const adminMemberCredentialsSchema = new Schema({
  // Auto-generated User ID (by admin system)
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  
  // Member Email (for easier access and login)
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // Admin-set Password
  password: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Hashed version of password for security
  hashedPassword: { 
    type: String, 
    required: true 
  },
  
  // Link to member profile
  memberProfileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AdminMemberProfile',
    required: true 
  },
  
  // WHO CREATED THIS MEMBER (Admin tracking)
  createdByAdminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'adminSignup',
    required: true 
  },
  
  // Status tracking
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Login tracking
  lastLogin: { 
    type: Date, 
    default: null 
  },
  
  loginCount: { 
    type: Number, 
    default: 0 
  },

  // Member type
  memberType: {
    type: String,
    default: 'AdminCreated',
    enum: ['AdminCreated', 'SelfRegistered']
  },

  // Password set by admin
  passwordSetByAdmin: {
    type: Boolean,
    default: true
  }

}, { 
  timestamps: true 
});

const AdminMemberCredentials = db.model('AdminMemberCredentials', adminMemberCredentialsSchema);

module.exports = AdminMemberCredentials;