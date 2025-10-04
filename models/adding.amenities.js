const mongoose = require('mongoose');
const db = require('../config/db');

// Weekly Day Schema
const weeklyDaySchema = new mongoose.Schema({
  open: { type: String, required: true },   // HH:mm
  close: { type: String, required: true },  // HH:mm
  closed: { type: Boolean, required: true } // true if closed
}, { _id: false });

const amenitySchema = new mongoose.Schema({
  createdByAdminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'adminSignup',
    required: true 
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bookingType: {
    type: String,
    enum: ['shared', 'exclusive'],
    required: true
  },
  weeklySchedule: {
    type: Map,
    of: weeklyDaySchema,
    required: true
  },
  imagePaths: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    default: ""
  },
  hourlyRate: {
    type: Number,
    default: 0.0
  },
  features: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const Amenity = db.model('Amenity', amenitySchema);
module.exports = { Amenity };
