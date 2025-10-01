const mongoose = require('mongoose');
const db = require('../config/db');

const { Schema } = mongoose;

const announCardSchema = new Schema({
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
    priority: { 
        type: String, 
    
        enum: {
            values: ['High', 'Medium', 'Low'],
            message: 'Priority must be High, Medium, or Low'
        }, 
        default: 'Medium' 
    },
    date: { type: Date, default: Date.now },
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'adminSignup', 
        required: [true, 'Admin ID is required'] 
    },
    isActive: { type: Boolean, default: true }
}, { 
    timestamps: true
});

// Index for better performance
announCardSchema.index({ adminId: 1 });
announCardSchema.index({ priority: 1, createdAt: -1 });
announCardSchema.index({ isActive: 1, createdAt: -1 });

const AnnounCard = db.model('announCard', announCardSchema);

module.exports = AnnounCard;
/*
{
  "title": "Community Meeting",
  "description": "Monthly community meeting to discuss neighborhood issues.",
  "priority": "High",
  "adminId": "64a7b2f5c9e1f2a3b4c5d6e7" // Example ObjectId
}
*/ 