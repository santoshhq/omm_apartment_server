
const db = require("../config/db");
const mongoose = require("mongoose");
const adminProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "adminSignup",   // links to signup collection
    required: true
  },
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  apartment: { type: String, required: true },
  phone:     { type: String, required: true },
  address:   { type: String, required: true },
  imagePath: { type: String }, // can store URL or local path

  // Array of user IDs from adminSignup collection
  membersId: [
    { type: mongoose.Schema.Types.ObjectId, ref: "adminSignup" }
  ]

}, { timestamps: true });

const adminuser = db.model("AdminProfiles", adminProfileSchema);
module.exports = { adminuser };
