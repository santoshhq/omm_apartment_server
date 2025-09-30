const express=require('express');
const routers=express.Router();
const { signupController, verifyOTPController, loginController, forgotPasswordController, resetPasswordController } = require('../../controllers/auth.controllers/signup.controllers');

routers.post('/signup', signupController);
routers.post('/verify-otp', verifyOTPController);
routers.post('/login', loginController);
routers.post('/forgot-password', forgotPasswordController);
routers.post('/reset-password', resetPasswordController);

module.exports=routers;
