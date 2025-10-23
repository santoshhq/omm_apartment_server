const mongoose = require('mongoose');
require('./config/db');
require('./models/events.cards');

async function updateEvents() {
  try {
    await mongoose.connect('mongodb://localhost:27017/omm_server');

    const eventCard = mongoose.model('eventCard');

    // Update events with wrong adminId to correct one
    const wrongAdminId = '68f0cede5d6d73b831d00785';
    const correctAdminId = '68f0d4175d6d73b831d007c9';

    console.log('=== UPDATING EXISTING EVENTS ===');
    console.log('Wrong adminId:', wrongAdminId);
    console.log('Correct adminId:', correctAdminId);

    // Find events with wrong adminId
    const eventsToUpdate = await eventCard.find({ adminId: wrongAdminId });
    console.log('Events found with wrong adminId:', eventsToUpdate.length);

    if (eventsToUpdate.length > 0) {
      // Update all events
      const result = await eventCard.updateMany(
        { adminId: wrongAdminId },
        { $set: { adminId: correctAdminId } }
      );

      console.log('✅ Update result:', result);
      console.log('Modified count:', result.modifiedCount);

      // Verify the update
      const updatedEvents = await eventCard.find({ adminId: correctAdminId });
      console.log('Events now with correct adminId:', updatedEvents.length);

      updatedEvents.forEach((event, index) => {
        console.log(`Event ${index + 1}: ${event.name} (ID: ${event._id})`);
      });
    } else {
      console.log('No events found with wrong adminId');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateEvents();