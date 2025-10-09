const mongoose = require('mongoose');
const db = require('../config/db');

const bookingSchema = new mongoose.Schema({
  amenityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Amenity', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AdminMemberProfile', 
    required: true 
  },
  bookingType: { 
    type: String, 
    enum: ['shared','exclusive'], 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, // HH:mm
    required: true 
  },
  endTime: { 
    type: String, // HH:mm
    required: true 
  },
  status: { 
    type: String, 
    enum: ['accepted','rejected','pending'], 
    default: 'pending' 
  },
  paymentType: { 
    type: String, 
    enum: ['cash'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },

}, { timestamps: true });

const AmenityBooking = db.model('AmenityBooking', bookingSchema);
module.exports = { AmenityBooking };
