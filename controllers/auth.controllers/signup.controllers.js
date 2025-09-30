const { signupService, verifyOTPService, loginService, forgotPasswordService, resetPasswordService } = require('../../services/auth.services/signup.services');

// Signup controller
const signupController = async(req, res) => {
    const {email, password} = req.body;    
    if(!email || !password){
        return res.status(400).json({status: false, message: 'Email and password are required'});
    }
    const result = await signupService(email, password);
    if(result.status){
        return res.status(201).json(result);
    } else {
        return res.status(400).json(result);
    }   
};

// OTP verification controller
const verifyOTPController = async(req, res) => {
    const {email, otp} = req.body;    
    if(!email || !otp){
        return res.status(400).json({status: false, message: 'Email and OTP are required'});
    }
    const result = await verifyOTPService(email, otp);
    if(result.status){
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }   
};

// Login controller
const loginController = async(req, res) => {
    const {email, password} = req.body;    
    if(!email || !password){
        return res.status(400).json({status: false, message: 'Email and password are required'});
    }
    const result = await loginService(email, password);
    if(result.status){
        return res.status(200).json(result);
    } else {
        return res.status(401).json(result);
    }   
};

// Forgot Password controller
const forgotPasswordController = async(req, res) => {
    const {email} = req.body;    
    if(!email){
        return res.status(400).json({status: false, message: 'Email is required'});
    }
    const result = await forgotPasswordService(email);
    if(result.status){
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }   
};

// Reset Password controller
const resetPasswordController = async(req, res) => {
    const {email, otp, newPassword} = req.body;    
    if(!email || !otp || !newPassword){
        return res.status(400).json({status: false, message: 'Email, OTP and new password are required'});
    }
    if(newPassword.length < 6){
        return res.status(400).json({status: false, message: 'Password must be at least 6 characters long'});
    }
    const result = await resetPasswordService(email, otp, newPassword);
    if(result.status){
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }   
};

module.exports = { 
    signupController, 
    verifyOTPController, 
    loginController, 
    forgotPasswordController, 
    resetPasswordController 
};