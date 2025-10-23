const eventCard = require("../models/events.cards");
const Donation = require("../models/events.cards/donations");

class EventCardService {
  // Create Event Card
  static async createEventCard(images, name, startdate, enddate, description, targetamount, eventdetails, upiId, adminId) {
    try {
      console.log('\n=== 🎪 CREATE EVENT CARD SERVICE CALLED ===');
      console.log('🖼️ Images received:', images);
      console.log('📝 Name:', name);

      // Process images - handle multiple formats
      let processedImages = [];
      
      if (images) {
        // Handle single image (string) or multiple images (array)
        const imageArray = Array.isArray(images) ? images : [images];
        
        for (let img of imageArray) {
          if (img && typeof img === 'string' && img.trim() !== '') {
            const trimmedImg = img.trim();
            
            // Accept any non-empty string as valid image path
            // This includes URLs, file paths, base64, etc.
            if (trimmedImg.length > 0) {
              processedImages.push(trimmedImg);
              console.log('✅ Added image:', trimmedImg.substring(0, 50) + '...');
            }
          }
        }
      }

      console.log('📊 Total processed images:', processedImages.length);

      const newEventCard = new eventCard({
        imagePaths: processedImages,
        name: name.trim(),
        startdate: new Date(startdate),
        enddate: new Date(enddate),
        description: description.trim(),
        targetamount: parseFloat(targetamount),
        eventdetails: Array.isArray(eventdetails) ? eventdetails : [eventdetails],
        upiId: upiId.trim(),
        adminId
      });

      const savedEventCard = await newEventCard.save();
      
      console.log('✅ Event card created successfully');
      console.log('🖼️ Final images in DB:', savedEventCard.imagePaths.length, 'images');

      return { 
        success: true, 
        message: 'Event card created successfully',
        data: {
          id: savedEventCard._id,
          images: savedEventCard.imagePaths,
          name: savedEventCard.name,
          startdate: savedEventCard.startdate,
          enddate: savedEventCard.enddate,
          description: savedEventCard.description,
          targetamount: savedEventCard.targetamount,
          collectedamount: savedEventCard.collectedamount,
          totalDonors: savedEventCard.totalDonors,
          averageDonation: savedEventCard.averageDonation,
          eventdetails: savedEventCard.eventdetails,
          status: savedEventCard.status,
          upiId: savedEventCard.upiId,
          adminId: savedEventCard.adminId,
          createdAt: savedEventCard.createdAt
        }
      };

    } catch (error) {
      console.log('❌ ERROR in createEventCard:', error.message);
      return { 
        success: false, 
        message: 'Error creating event card', 
        error: error.message 
      };
    }
  }

  // Get All Event Cards
 static async getAllEventCards(adminId = null, options = {}) {
  console.log('\n=== 🔍 GET ALL EVENT CARDS SERVICE DEBUG ===');
  console.log('🔑 Input adminId:', adminId, 'Type:', typeof adminId);
  console.log('⚙️ Options:', options);

  let query = {};
  if (adminId) {
    // Ensure adminId is treated as ObjectId for proper comparison
    if (typeof adminId === 'string' && adminId.match(/^[0-9a-fA-F]{24}$/)) {
      // Convert to ObjectId for exact match
      const mongoose = require('mongoose');
      query.adminId = new mongoose.Types.ObjectId(adminId);
      console.log('✅ Converted to ObjectId for query');
    } else {
      console.log('❌ Invalid adminId format:', adminId);
      return { success: false, message: 'Invalid adminId format' };
    }
  }

  console.log('🔍 MongoDB Query:', JSON.stringify(query, null, 2));

  const isLightweight = options.lightweight === true;
  console.log('💡 Lightweight mode:', isLightweight);

  const eventCards = await eventCard.find(query).populate('adminId', 'firstName lastName email');
  console.log('📊 Raw results count:', eventCards.length);

  // Debug: Log adminIds of found events
  eventCards.forEach((card, index) => {
    console.log(`🎪 Event ${index + 1}: ID=${card._id}, adminId=${card.adminId}, name="${card.name}"`);
  });

  const formattedCards = eventCards.map(card => ({
    id: card._id,
    name: card.name,
    description: card.description,
    images: isLightweight ? [] : card.imagePaths, // ✅ skip images in lightweight mode
    startdate: card.startdate,
    enddate: card.enddate,
    targetamount: card.targetamount,
    collectedamount: card.collectedamount || 0,
    totalDonors: card.totalDonors || 0,
    averageDonation: card.averageDonation || 0,
    status: card.status,
    upiId: card.upiId,
    adminId: card.adminId,
    createdAt: card.createdAt,
  }));

  console.log('✅ Formatted results count:', formattedCards.length);
  return { success: true, data: formattedCards };
}


  // Get Single Event Card
  static async getEventCardById(cardId) {
    try {
      const card = await eventCard.findById(cardId).populate('adminId', 'firstName lastName email');
      if (!card) {
        return { success: false, message: 'Event card not found' };
      }

      // Fetch donations from separate Donation collection
      const donations = await Donation.find({ eventId: cardId })
        .populate('userId', 'firstName lastName flatNo floor mobile')
        .sort({ createdAt: -1 }); // Most recent first

      // Format response with consistent image handling
      const formattedCard = {
        id: card._id,
        name: card.name,
        description: card.description,
        images: card.imagePaths || [],
        startdate: card.startdate,
        enddate: card.enddate,
        targetamount: card.targetamount,
        collectedamount: card.collectedamount || 0,
        totalDonors: card.totalDonors || 0,
        averageDonation: card.averageDonation || 0,
        eventdetails: card.eventdetails,
        status: card.status,
        upiId: card.upiId,
        eventdetails: card.eventdetails,
        donations: card.donations, // Use fetched donations from separate collection
        adminId: card.adminId,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt
      };

      return { success: true, data: formattedCard };
    } catch (error) {
      return { success: false, message: 'Error fetching event card', error: error.message };
    }
  }

  // Update Event Card
  static async updateEventCard(adminId, cardId, updateData) {
    try {
      console.log('\n=== ✏️ UPDATE EVENT CARD SERVICE CALLED ===');
      console.log('🔑 Admin ID:', adminId);
      console.log('🎪 Event ID:', cardId);
      console.log('📝 Update data:', Object.keys(updateData));

      // Find existing event card
      const existingCard = await eventCard.findOne({
        _id: cardId,
        adminId: adminId
      });

      if (!existingCard) {
        console.log('❌ EVENT CARD NOT FOUND');
        return {
          success: false,
          message: 'Event card not found or access denied'
        };
      }

      console.log('✅ Event found:', existingCard.name);

      // Validate targetamount if provided
      if (updateData.targetamount !== undefined && updateData.targetamount <= 0) {
        console.log('❌ INVALID TARGET AMOUNT');
        return {
          success: false,
          message: 'Target amount must be a positive number'
        };
      }

      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== existingCard.name) {
        const duplicateEvent = await eventCard.findOne({
          adminId: adminId,
          name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
          _id: { $ne: cardId }
        });

        if (duplicateEvent) {
          console.log('❌ EVENT NAME ALREADY EXISTS');
          return {
            success: false,
            message: 'An event with this name already exists'
          };
        }
      }

      // Prepare update object
      const updateObject = {};
      const allowedFields = ['name', 'description', 'imagePaths', 'images', 'image', 'startdate', 'enddate', 'targetamount', 'eventdetails', 'status', 'upiId'];
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          if (field === 'name' || field === 'description' || field === 'upiId') {
            updateObject[field] = updateData[field].trim();
          } else if (field === 'imagePaths' || field === 'images' || field === 'image') {
            // Handle image updates - accept any format
            let processedImages = [];
            const imageData = updateData[field];
            
            if (imageData) {
              const imageArray = Array.isArray(imageData) ? imageData : [imageData];
              
              for (let img of imageArray) {
                if (img && typeof img === 'string' && img.trim() !== '') {
                  processedImages.push(img.trim());
                }
              }
            }
            
            updateObject.imagePaths = processedImages;
            console.log('🖼️ Updated images count:', processedImages.length);
          } else if (field === 'startdate' || field === 'enddate') {
            updateObject[field] = new Date(updateData[field]);
          } else if (field === 'eventdetails' && Array.isArray(updateData[field])) {
            updateObject[field] = [...new Set(updateData[field].filter(detail => detail && detail.trim()))];
          } else {
            updateObject[field] = updateData[field];
          }
        }
      }

      console.log('📝 Fields to update:', Object.keys(updateObject));

      // Track changes for logging
      const oldValues = {};
      const newValues = {};
      for (const field of Object.keys(updateObject)) {
        oldValues[field] = existingCard[field];
        newValues[field] = updateObject[field];
      }

      // Update event card
      const updatedCard = await eventCard.findOneAndUpdate(
        { _id: cardId, adminId: adminId },
        updateObject,
        { new: true, runValidators: true }
      );

      console.log('✅ EVENT CARD UPDATED SUCCESSFULLY');

      // Fetch updated donations from separate Donation collection
      const updatedDonations = await Donation.find({ eventId: updatedCard._id })
        .populate('userId', 'firstName lastName flatNo floor mobile')
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: 'Event card updated successfully',
        data: {
          event: {
            id: updatedCard._id,
            name: updatedCard.name,
            description: updatedCard.description,
            images: updatedCard.imagePaths || [],
            startdate: updatedCard.startdate,
            enddate: updatedCard.enddate,
            targetamount: updatedCard.targetamount,
            collectedamount: updatedCard.collectedamount || 0,
            totalDonors: updatedCard.totalDonors || 0,
            averageDonation: updatedCard.averageDonation || 0,
            eventdetails: updatedCard.eventdetails,
            status: updatedCard.status,
            upiId: updatedCard.upiId,
            donations: updatedDonations, // Use fetched donations from separate collection
            updatedAt: updatedCard.updatedAt
          },
          changes: {
            fieldsUpdated: Object.keys(updateObject),
            oldValues,
            newValues
          }
        }
      };

    } catch (error) {
      console.log('❌ ERROR in updateEventCard:', error.message);
      return {
        success: false,
        message: 'Error updating event card',
        error: error.message
      };
    }
  }

  // Delete Event Card
  static async deleteEventCard(adminId, cardId) {
    try {
      console.log('\n=== 🗑️ DELETE EVENT CARD SERVICE CALLED ===');
      console.log('🔑 Admin ID:', adminId);
      console.log('🎪 Card ID:', cardId);

      const deletedCard = await eventCard.findOneAndDelete({
        _id: cardId,
        adminId: adminId
      });

      if (!deletedCard) {
        console.log('❌ EVENT CARD NOT FOUND OR ACCESS DENIED');
        return { 
          success: false, 
          message: 'Event card not found or access denied' 
        };
      }

      console.log('✅ EVENT CARD DELETED SUCCESSFULLY');
      console.log('🗑️ Deleted event:', deletedCard.name);

      return { 
        success: true, 
        message: 'Event card deleted successfully',
        data: {
          deletedId: cardId,
          deletedName: deletedCard.name
        }
      };
    } catch (error) {
      console.log('❌ ERROR in deleteEventCard:', error.message);
      return { 
        success: false, 
        message: 'Error deleting event card', 
        error: error.message 
      };
    }
  }

  // Toggle Event Status (Active/Inactive)
  static async toggleEventStatus(adminId, cardId) {
    try {
      console.log('\n=== 🔄 TOGGLE EVENT STATUS SERVICE CALLED ===');
      console.log('🔑 Admin ID:', adminId);
      console.log('🎪 Card ID:', cardId);

      const card = await eventCard.findOne({
        _id: cardId,
        adminId: adminId
      });

      if (!card) {
        console.log('❌ EVENT CARD NOT FOUND OR ACCESS DENIED');
        return { 
          success: false, 
          message: 'Event card not found or access denied' 
        };
      }

      console.log('✅ Event found:', card.name);
      console.log('🔄 Current status:', card.status);

      card.status = !card.status;
      await card.save();

      console.log('✅ EVENT STATUS TOGGLED');
      console.log('🔄 New status:', card.status);

      return { 
        success: true, 
        message: 'Event status updated', 
        data: {
          id: card._id,
          name: card.name,
          status: card.status
        }
      };
    } catch (error) {
      console.log('❌ ERROR in toggleEventStatus:', error.message);
      return { 
        success: false, 
        message: 'Error toggling status', 
        error: error.message 
      };
    }
  }

  // Add Donation
  static async addDonation(eventId, userId, amount, transactionId, upiApp, adminId) {
    try {
      console.log('\n=== � ADD DONATION SERVICE CALLED ===');
      console.log('🎪 Event ID:', eventId);
      console.log('� User ID:', userId);
      console.log('💵 Amount:', amount);
      console.log('🔑 Transaction ID:', transactionId);
      console.log('📱 UPI App:', upiApp);
      console.log('👨‍💼 Admin ID:', adminId);

      // Validate required fields
      if (!eventId || !userId || !amount || !transactionId || !upiApp || !adminId) {
        return {
          success: false,
          message: 'All fields are required: eventId, userId, amount, transactionId, upiApp, adminId'
        };
      }

      // Validate amount
      const donationAmount = parseFloat(amount);
      if (isNaN(donationAmount) || donationAmount <= 0) {
        return {
          success: false,
          message: 'Amount must be a positive number'
        };
      }

      // Check if event exists and is active
      const event = await eventCard.findById(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Event not found'
        };
      }

      if (!event.status) {
        return {
          success: false,
          message: 'Event is not active'
        };
      }

      // Check if user exists
      const AdminMemberProfile = require('../models/auth.models/adminMemberProfile');
      const user = await AdminMemberProfile.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check if admin exists
      const AdminSignup = require('../models/auth.models/signup');
      const admin = await AdminSignup.findById(adminId);
      if (!admin) {
        return {
          success: false,
          message: 'Admin not found'
        };
      }

      // Check for duplicate transaction ID
      const existingDonation = await Donation.findOne({ transactionId });
      if (existingDonation) {
        return {
          success: false,
          message: 'Transaction ID already exists'
        };
      }

      // Create donation
      const newDonation = new Donation({
        eventId,
        userId,
        transactionId: transactionId.trim(),
        amount: donationAmount,
        upiApp: upiApp.trim(),
        adminId
      });

      const savedDonation = await newDonation.save();

      // Update event statistics
      const allDonations = await Donation.find({ eventId, status: 'Accepted' });
      const totalCollected = allDonations.reduce((sum, donation) => sum + donation.amount, 0);
      const totalDonors = allDonations.length;
      const averageDonation = totalDonors > 0 ? totalCollected / totalDonors : 0;

      await eventCard.findByIdAndUpdate(eventId, {
        collectedamount: totalCollected,
        totalDonors,
        averageDonation
      });

      console.log('✅ DONATION ADDED SUCCESSFULLY');
      console.log('💰 Amount:', donationAmount);
      console.log('� Updated event stats - Collected:', totalCollected, 'Donors:', totalDonors);

      return {
        success: true,
        message: 'Donation added successfully',
        data: {
          donationId: savedDonation._id,
          amount: savedDonation.amount,
          status: savedDonation.status,
          eventStats: {
            collectedamount: totalCollected,
            totalDonors,
            averageDonation
          }
        }
      };

    } catch (error) {
      console.log('❌ ERROR in addDonation:', error.message);
      return {
        success: false,
        message: 'Error adding donation',
        error: error.message
      };
    }
  }
}

module.exports = EventCardService;
