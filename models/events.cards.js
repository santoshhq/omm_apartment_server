const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;

const eventCardSchema = new Schema(
  {
   imagePaths: {
      type: [String], // Multiple image URLs/paths
      default: [],    // Empty if no images uploaded
    }, // store URL or filename
    name: { type: String, required: true, trim: true },
    startdate: { type: Date, required: true },
    enddate: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    targetamount: { type: Number, required: true },
    collectedamount: { type: Number, default: 0 }, // ✅ to track donations
    eventdetails: {
      type: [String], // array of details
    },
    status: {
      type: Boolean,
      default: true, // ✅ toggle for Active/Inactive
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminSignup", // links to signup collection
      required: true,
    },
    donations: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "userSignup" },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ], // ✅ donation history
  },
  { timestamps: true }
);

module.exports = db.model("eventCard", eventCardSchema);
