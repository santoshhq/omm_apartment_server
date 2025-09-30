const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;



const amenitySchema = new mongoose.Schema(
  {
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
    imagePaths: {
      type: [String], // Multiple image URLs/paths
      default: [],    // Empty if no images uploaded
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      default: "",
    },
    hourlyRate: {
      type: Number,
      default: 0.0,
    },
    features: {
      type: [String], // Array of features
      default: [],
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

addingamenity = db.model("Amenity", amenitySchema);
module.exports = { addingamenity };
