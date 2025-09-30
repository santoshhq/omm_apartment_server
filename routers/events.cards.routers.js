const express = require("express");
const router = express.Router();
const EventCardController = require("../controllers/events.cards.controllers");

// Create
router.post("/", EventCardController.createEventCard);

// Get all
router.get("/", EventCardController.getAllEventCards);

// Get by ID
router.get("/:id", EventCardController.getEventCardById);

// Update
router.put("/:id", EventCardController.updateEventCard);

// Delete
router.delete("/:id", EventCardController.deleteEventCard);

// Add donation
router.post("/:id/donate", EventCardController.addDonation);

// Toggle status
router.put("/:id/toggle", EventCardController.toggleEventStatus);

module.exports = router;
