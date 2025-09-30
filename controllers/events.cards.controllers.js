const EventCardService = require("../services/events.cards.services");

class EventCardController {
  // Create Event Card
  static async createEventCard(req, res) {
    try {
      // Handle both 'image' and 'images' from request body
      const { image, images, imagePaths, name, startdate, enddate, description, targetamount, eventdetails, adminId } = req.body;
      
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
        adminId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Get All Event Cards
  static async getAllEventCards(req, res) {
    try {
      const result = await EventCardService.getAllEventCards();
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
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
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Delete Event Card
  static async deleteEventCard(req, res) {
    try {
      const { id } = req.params;
      const result = await EventCardService.deleteEventCard(id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
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

  // Toggle Status
  static async toggleEventStatus(req, res) {
    try {
      const { id } = req.params;
      const result = await EventCardService.toggleEventStatus(id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }
}

module.exports = EventCardController;
