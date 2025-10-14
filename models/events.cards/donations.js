const mongoose = require('mongoose');
const db = require('../../config/db');
const { Schema } = mongoose;

// Donation Schema
const donationSchema = new Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'eventCard', // Reference to the event
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminMemberProfile', // Reference to the user making the donation
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  upiApp: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'adminSignup', // Reference to the admin who manages the event
    required: true,
    index: true
  }
}, { timestamps: true });

const Donation = db.model('Donation', donationSchema);
module.exports = Donation;