const mongoose = require('mongoose');
const db = require('../../config/db');
const { Schema } = mongoose;

// Bills Management Schema
const billsManagementSchema = new Schema({
    billtitle: {
        type: String,
        required: true,
        trim: true
    },
    billdescription: {
        type: String,
        required: true,
        trim: true
    },
    billamount: {
        type: Number,
        required: true,
        min: 1
    },
    upiId: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['maintenance', 'security-services', 'cleaning', 'amenities'],
    
        trim: true
    },

    duedate: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    createdByAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminSignup',
        required: true
    },
    
}, { timestamps: true });
const BillsManagement = db.model('BillsManagement', billsManagementSchema);
module.exports = BillsManagement;
    