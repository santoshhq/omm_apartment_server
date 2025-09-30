require('dotenv').config();
const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const signupRouters=require('./routers/auth.routers/signup.routers');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// API prefix from environment variable
const API_PREFIX = process.env.API_PREFIX || '/api';

// Routes
app.use(`${API_PREFIX}/auth`, signupRouters);

const adminProfileRouter = require('./routers/adminProfiles.routers');
app.use(`${API_PREFIX}/admin-profiles`, adminProfileRouter);

// RemoveNd complete profile router as requested

const adminMemberRouter = require('./routers/auth.routers/adminMember.routers');
app.use(`${API_PREFIX}/admin-members`, adminMemberRouter);

const amenitiesRouter = require('./routers/adding.amenities.routers');
app.use(`${API_PREFIX}/amenities`, amenitiesRouter);



module.exports=app;