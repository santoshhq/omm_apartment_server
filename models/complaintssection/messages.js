const mongoose = require('mongoose');
const db = require('../../config/db');

const { Schema } = mongoose;

const messagesSchema = new Schema({
    complaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaints', // Reference to the complaints collection
        required: [true, 'Complaint ID is required']
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminMemberProfile', // Reference to the user collection
        required: [true, 'Sender ID is required']
    },
    message: { 
        type: String, 
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters'],
        minlength: [1, 'Message cannot be empty']
    },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes for better performance
messagesSchema.index({ complaintId: 1, timestamp: 1 });
messagesSchema.index({ senderId: 1, timestamp: -1 });

const Messages = db.model('Messages', messagesSchema);
module.exports = Messages;