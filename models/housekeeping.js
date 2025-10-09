const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;
// Housekeeping Staff Schema
const housekeepingSchema = new Schema({
       adminId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'adminSignup',
            required: true,
        
        },
        personimage: {
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
            match: [/^\d{10}$/, 'Invalid mobile number format'],    
        },
        age: {
            type: Number,
            required: true,
            min: [18, 'Minimum age is 18'],
            max: [70, 'Maximum age is 70'],
        },
        assignfloors: {
            type: [String],
            required: true,
            enum: ['I', 'II', 'III', 'IV', 'V', 'VI'], // Example FLOORS
            validate: {
                validator: function (arr) {
                    return Array.isArray(arr) && arr.length > 0 && arr.every(f => ['I', 'II', 'III', 'IV', 'V', 'VI'].includes(f));
                },
                message: 'assignfloors must be a non-empty array of valid floor names.'
            }
        },
        gender: {
            type: String,
            required: true,
            enum:['male','female','other']
        },
    
    });
    const housekeeping= db.model('housekeeping', housekeepingSchema);
    module.exports =  housekeeping ;
    