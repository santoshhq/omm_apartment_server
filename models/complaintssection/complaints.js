const mongoose = require('mongoose');
const db = require('../../config/db');

const { Schema } = mongoose;

const complaintsSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminMemberProfile', // Reference to the user collection
        required: [true, 'User ID is required']
    },
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
        minlength: [5, 'Title must be at least 5 characters']
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        minlength: [10, 'Description must be at least 10 characters']
    },
    status: { 
        type: String, 
        enum: {
            values: ['pending', 'solved', 'unsolved'],
            message: 'Status must be pending, solved, or unsolved'
        }, 
        default: 'pending' 
    },
    createdByadmin: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'adminSignup', 
        required: [true, 'Admin ID is required']
    }
}, { 
    timestamps: true 
});

// Indexes for better performance
complaintsSchema.index({ createdByadmin: 1, createdAt: -1 });
complaintsSchema.index({ userId: 1, createdAt: -1 });
complaintsSchema.index({ status: 1, createdAt: -1 });

const Complaints = db.model('Complaints', complaintsSchema);
module.exports = Complaints;
