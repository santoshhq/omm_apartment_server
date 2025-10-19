
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

const donationsRouter = require('./routers/events.cards/donations.routers');
app.use(`${API_PREFIX}/donations`, donationsRouter);

const announRouter = require('./routers/announs.cards.routers');
app.use(`${API_PREFIX}/announcements`, announRouter);

const complaintRouter = require('./routers/complaintssection/complaints.routers');
app.use(`${API_PREFIX}/complaints`, complaintRouter);

const messageRouter = require('./routers/complaintssection/messages.routers');
app.use(`${API_PREFIX}/messages`, messageRouter);

const amenityBookingRouter = require('./routers/amenities.booking.routers');
app.use(`${API_PREFIX}/bookings`, amenityBookingRouter);

const securityRouter = require('./routers/securityguards.routers');
app.use(`${API_PREFIX}/security`, securityRouter);

const housekeepingRouter = require('./routers/housekeeping.routers');
app.use(`${API_PREFIX}/housekeeping`, housekeepingRouter);

const billsRouter = require('./routers/bills.managements/bills.routers');
app.use(`${API_PREFIX}/bills`, billsRouter);

const billRequestsRouter = require('./routers/bills.managements/bill.requests.routers');
app.use(`${API_PREFIX}/bill-requests`, billRequestsRouter);

module.exports=app;