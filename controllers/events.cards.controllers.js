const EventCardService = require("../services/events.cards.services");

class EventCardController {
  // Create Event Card
  static async createEventCard(req, res) {
    try {
      console.log('\n=== 🎪 CREATE EVENT CARD CONTROLLER CALLED ===');
      
      // Get adminId from params (for new admin-specific routes) or body (for legacy)
      const adminIdFromParams = req.params.adminId;
      const { image, images, imagePaths, name, startdate, enddate, description, targetamount, eventdetails, upiId, adminId: adminIdFromBody } = req.body;
      
      // Use adminId from params if available, otherwise from body (backward compatibility)
      const adminId = adminIdFromParams || adminIdFromBody;
      
      console.log('🔑 Admin ID (from params):', adminIdFromParams);
      console.log('🔑 Admin ID (from body):', adminIdFromBody);
      console.log('🔑 Final Admin ID used:', adminId);

      if (!adminId) {
        return res.status(400).json({
          success: false,
          message: 'Admin ID is required'
        });
      }
      
      // Use whichever image field is provided
      const imageData = images || imagePaths || image;

      const result = await EventCardService.createEventCard(
        imageData,
        name,
        startdate,
        enddate,
        description,
        targetamount,
        eventdetails,
        upiId,
        adminId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Emit Socket.IO event for real-time updates
      const io = req.app.get('io');
      io.emit('event-created', { event: result.data });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Get All Event Cards (Admin-Specific)
  static async getAllEventCards(req, res) {
    try {
      console.log('\n=== 📋 GET ALL EVENT CARDS CONTROLLER CALLED ===');
      const { adminId } = req.params;
      console.log('🔑 Admin ID:', adminId);

      if (!adminId) {
        return res.status(400).json({
          success: false,
          message: 'Admin ID is required'
        });
      }

      const result = await EventCardService.getAllEventCards(adminId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // ✅ Get All Event Cards (Legacy - now supports lightweight mode)
static async getAllEventCardsLegacy(req, res) {
  try {
    console.log('\n⚠️ LEGACY GET ALL EVENT CARDS ROUTE CALLED');

    // Extract query parameters
    const { adminId, lightweight } = req.query;
    const isLightweight = lightweight === 'true'; // ✅ detect lightweight mode
    console.log('🔑 Admin ID from query:', adminId);
    console.log('💡 Lightweight mode:', isLightweight);

    // Validate adminId
    if (!adminId) {
      console.log('❌ NO ADMIN ID PROVIDED IN LEGACY ROUTE');
      return res.status(400).json({
        success: false,
        message:
          'adminId is required as query parameter. Use: /api/events?adminId=your_admin_id or switch to /api/events/admin/your_admin_id',
      });
    }

    console.log('✅ Using adminId filter in legacy route');

    // ⚡ Call the service with lightweight flag
    const result = await EventCardService.getAllEventCards(adminId, { lightweight: isLightweight });

    // Handle failure
    if (!result.success) {
      console.log('❌ Failed to fetch event cards:', result.message);
      return res.status(400).json(result);
    }

    // ✅ Success
    console.log(`✅ Event cards fetched successfully (${isLightweight ? 'lightweight' : 'full'} mode)`);
    console.log(`📊 Total cards: ${result.data?.length || 0}`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ ERROR in getAllEventCardsLegacy:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}


  // Get Event Card by ID
  static async getEventCardById(req, res) {
    try {
      const { id } = req.params;
      const result = await EventCardService.getEventCardById(id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Update Event Card
  static async updateEventCard(req, res) {
    try {
      const { id } = req.params;
      const { adminId, ...updateData } = req.body;
      
      if (!adminId) {
        return res.status(400).json({ 
          success: false, 
          message: "Admin ID is required" 
        });
      }
      
      const result = await EventCardService.updateEventCard(adminId, id, updateData);
      if (!result.success) {
        return res.status(404).json(result);
      }

      // Emit Socket.IO event for real-time updates
      const io = req.app.get('io');
      io.emit('event-updated', { event: result.data });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Delete Event Card (Admin-Specific)
  static async deleteEventCard(req, res) {
    try {
      console.log('\n=== 🗑️ DELETE EVENT CARD CONTROLLER CALLED ===');
      
      // Get adminId from params (for new admin-specific routes) or handle legacy
      const adminIdFromParams = req.params.adminId;
      const eventId = req.params.id;
      
      console.log('🔑 Admin ID (from params):', adminIdFromParams);
      console.log('🎪 Event ID:', eventId);

      if (adminIdFromParams) {
        // New admin-specific route
        const result = await EventCardService.deleteEventCard(adminIdFromParams, eventId);
        const statusCode = result.success ? 200 : 404;

        // Emit Socket.IO event for real-time updates
        if (result.success) {
          const io = req.app.get('io');
          io.emit('event-deleted', { eventId });
        }

        return res.status(statusCode).json(result);
      } else {
        // Legacy route - less secure but backward compatible
        console.log('⚠️ USING LEGACY DELETE - NO ADMIN VALIDATION');
        const result = await EventCardService.deleteEventCard(null, eventId);
        const statusCode = result.success ? 200 : 404;

        // Emit Socket.IO event for real-time updates
        if (result.success) {
          const io = req.app.get('io');
          io.emit('event-deleted', { eventId });
        }

        return res.status(statusCode).json(result);
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Add Donation
  static async addDonation(req, res) {
    try {
      const { id } = req.params; // event id
      const { userId, amount } = req.body;

      const result = await EventCardService.addDonation(id, userId, amount);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Toggle Status (Admin-Specific)
  static async toggleEventStatus(req, res) {
    try {
      console.log('\n=== 🔄 TOGGLE EVENT STATUS CONTROLLER CALLED ===');
      
      // Get adminId from params (for new admin-specific routes) or handle legacy
      const adminIdFromParams = req.params.adminId;
      const eventId = req.params.id;
      
      console.log('🔑 Admin ID (from params):', adminIdFromParams);
      console.log('🎪 Event ID:', eventId);

      if (adminIdFromParams) {
        // New admin-specific route
        const result = await EventCardService.toggleEventStatus(adminIdFromParams, eventId);
        const statusCode = result.success ? 200 : 404;
        return res.status(statusCode).json(result);
      } else {
        // Legacy route - less secure but backward compatible
        console.log('⚠️ USING LEGACY TOGGLE - NO ADMIN VALIDATION');
        const result = await EventCardService.toggleEventStatus(null, eventId);
        const statusCode = result.success ? 200 : 404;
        return res.status(statusCode).json(result);
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }
}

module.exports = EventCardController;
