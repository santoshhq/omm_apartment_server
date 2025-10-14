const express = require('express');
const router = express.Router();
const DonationsController = require('../../controllers/events.cards/donations.controllers');

// Create a new donation
router.post('/create/:userId', DonationsController.createDonation);

// Get all donations for a specific admin
router.get('/all/:adminId', DonationsController.getAllDonations);

// Get donations by event ID for a specific admin
router.get('/event/:eventId/:adminId', DonationsController.getDonationsByEventId);

// Get a donation by ID for a specific admin
router.get('/:id/:adminId', DonationsController.getDonationById);

// Update a donation by ID for a specific admin
router.put('/:id/:adminId', DonationsController.updateDonation);

// Delete a donation by ID for a specific admin
router.delete('/:id/:adminId', DonationsController.deleteDonation);

module.exports = router;