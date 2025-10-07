const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;

const securityGuardSchema = new Schema({
    adminId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminProfiles',
        required: true,
    
    },
    guardimage: {
        type: String,
        default: null,
        trim: true,
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50,
    },
    mobilenumber: {
        type: String,   
        required: true,
        trim: true,
        unique: true,
        match: [/^\d{10}$/, 'Invalid mobile number format'],    
    },
    age: {
        type: Number,
        required: true,
        min: [18, 'Minimum age is 18'],
        max: [70, 'Maximum age is 70'],
    },
    assigngates:{
        type: String,
        required: true,
        enum: ['G1', 'G2', 'G3', 'G4','G5','G6'], // Example gate names
    },
    gender: {
        type: String,
        required: true,
        enum:['male','female','other']
    },

});
const securityGuard= db.model('securityGuard', securityGuardSchema);

module.exports =  securityGuard ;