const eventCard = require("../models/events.cards");

class EventCardService {
  // Create Event Card
  static async createEventCard(images, name, startdate, enddate, description, targetamount, eventdetails, adminId) {
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
          eventdetails: savedEventCard.eventdetails,
          status: savedEventCard.status,
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
  static async getAllEventCards(adminId = null) {
    try {
      console.log('\n=== 📋 GET ALL EVENT CARDS SERVICE CALLED ===');
      console.log('🔑 Admin ID filter:', adminId);
      
      // Build query - if adminId provided, filter by it, otherwise get all
      const query = adminId ? { adminId } : {};
      console.log('🔍 Query:', query);
      
      const eventCards = await eventCard.find(query).populate('adminId', 'firstName lastName email');
      console.log('✅ Found event cards:', eventCards.length);
      
      // Format response with consistent image handling
      const formattedCards = eventCards.map(card => ({
        id: card._id,
        name: card.name,
        description: card.description,
        images: card.imagePaths || [],
        startdate: card.startdate,
        enddate: card.enddate,
        targetamount: card.targetamount,
        collectedamount: card.collectedamount || 0,
        eventdetails: card.eventdetails,
        status: card.status,
        donations: card.donations,
        adminId: card.adminId,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt
      }));
      
      return { success: true, data: formattedCards };
    } catch (error) {
      return { success: false, message: 'Error fetching event cards', error: error.message };
    }
  }

  // Get Single Event Card
  static async getEventCardById(cardId) {
    try {
      const card = await eventCard.findById(cardId).populate('adminId', 'firstName lastName email');
      if (!card) {
        return { success: false, message: 'Event card not found' };
      }
      
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
        eventdetails: card.eventdetails,
        status: card.status,
        donations: card.donations,
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
      const allowedFields = ['name', 'description', 'imagePaths', 'images', 'image', 'startdate', 'enddate', 'targetamount', 'eventdetails', 'status'];
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          if (field === 'name' || field === 'description') {
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
            eventdetails: updatedCard.eventdetails,
            status: updatedCard.status,
            donations: updatedCard.donations,
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

  // Add Donation
  static async addDonation(cardId, userId, amount) {
    try {
      const card = await eventCard.findById(cardId);
      if (!card) {
        return { success: false, message: 'Event card not found' };
      }

      // Push donation
      card.donations.push({ userId, amount });

      // Update collected amount
      card.collectedamount = (card.collectedamount || 0) + amount;

      await card.save();
      return { success: true, message: 'Donation added successfully', data: card };
    } catch (error) {
      return { success: false, message: 'Error adding donation', error: error.message };
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
}

module.exports = EventCardService;
