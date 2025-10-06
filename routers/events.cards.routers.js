const express = require("express");
const router = express.Router();
const EventCardController = require("../controllers/events.cards.controllers");

// ===== ADMIN-SPECIFIC EVENT CARD ROUTES =====

// Create Event Card for specific admin
router.post("/admin/:adminId", EventCardController.createEventCard);

// Get all Event Cards for specific admin
router.get("/admin/:adminId", EventCardController.getAllEventCards);

// Get Event Card by ID (admin-specific)
router.get("/admin/:adminId/event/:id", EventCardController.getEventCardById);

// Update Event Card (admin-specific)
router.put("/admin/:adminId/event/:id", EventCardController.updateEventCard);

// Delete Event Card (admin-specific)
router.delete("/admin/:adminId/event/:id", EventCardController.deleteEventCard);

// Toggle Event Status (admin-specific)
router.put("/admin/:adminId/event/:id/toggle", EventCardController.toggleEventStatus);

// Add donation to Event Card
router.post("/admin/:adminId/event/:id/donate", EventCardController.addDonation);

// ===== LEGACY ROUTES REMOVED FOR SECURITY =====
// All routes now require admin-specific paths for better security
// Frontend must use: /api/events/admin/:adminId instead of /api/events/

module.exports = router;
