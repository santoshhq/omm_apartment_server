const mongoose=require('mongoose');
const db=require('../../config/db');

const { Schema } = mongoose;

const signupSchema = new Schema({
  email: { type: String, required: true,lowercase:true ,unique: true,trim:true },
  password: { type: String, required: true,trim:true },
  isVerified: { type: Boolean, default: false },
  isProfile: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpiry: { type: Date },
}, { timestamps: true });
const Signup = db.model('adminSignup', signupSchema);

module.exports = Signup;