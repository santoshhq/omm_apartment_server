const express = require("express");
const router = express.Router();
const EventCardController = require("../controllers/events.cards.controllers");

// ✅ Lightweight legacy route (read-only, requires adminId)
router.get("/", EventCardController.getAllEventCardsLegacy);

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

module.exports = router;
