require('dotenv').config();
const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const signupRouters=require('./routers/auth.routers/signup.routers');

// Configure body parser with larger limits for image uploads
app.use(bodyParser.json({ 
  limit: '50mb',  // Increase JSON payload limit to 50MB
  extended: true 
}));
app.use(bodyParser.urlencoded({ 
  limit: '50mb',  // Increase URL encoded payload limit to 50MB
  extended: true,
  parameterLimit: 1000000  // Increase parameter limit
}));

// Additional Express JSON parser as backup
app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));

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

const eventRouter = require('./routers/events.cards.routers');
app.use(`${API_PREFIX}/events`, eventRouter);



module.exports=app;