const mongoose = require('mongoose');
const db = require('../../config/db');
const { Schema } = mongoose;
// Bill Request Schema
const billRequestSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminMemberProfile', // Reference to the user making the request
    required: true,
    index: true
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillsManagement', // Reference to the bill being requested
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
    paymentapp: {
    type: String,
    required: true,
    trim: true
    },
    PaymentAppName: {
    type: String,
    },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },}
, { timestamps: true });
const BillRequest = db.model('BillRequest', billRequestSchema);
module.exports = BillRequest;
