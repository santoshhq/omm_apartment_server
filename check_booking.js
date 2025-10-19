const mongoose = require('mongoose');
require('dotenv').config();

async function checkBooking() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/omm_apartment');

    const AmenityBooking = require('./models/amenities.booking').AmenityBooking;
    const booking = await AmenityBooking.findById('68f4b3e53a2f0274ff52dc84');

    if (booking) {
      console.log('Booking found:');
      console.log('ID:', booking._id);
      console.log('User ID:', booking.userId);
      console.log('Amenity ID:', booking.amenityId);
      console.log('Status:', booking.status);
      console.log('Date:', booking.date);
    } else {
      console.log('Booking not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBooking();