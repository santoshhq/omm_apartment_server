const AnnounCardController = require('../controllers/announs.cards.controllers');
const express = require('express');
const router = express.Router();

// ===== ANNOUNCEMENT CARDS ROUTES =====

// Basic CRUD Operations
router.post('/', AnnounCardController.createAnnounCard);                    // Create new announcement
router.get('/', AnnounCardController.getAllAnnounCards);                    // Get all announcements (with query filters)
router.get('/:id', AnnounCardController.getAnnounCardById);                 // Get single announcement by ID
router.put('/:id', AnnounCardController.updateAnnounCard);                  // Update announcement
router.delete('/:id', AnnounCardController.deleteAnnounCard);               // Delete announcement

// Status Management
router.put('/:id/toggle', AnnounCardController.toggleAnnounStatus);         // Toggle active/inactive status

// Filter Operations
router.get('/priority/:priority', AnnounCardController.getAnnouncementsByPriority); // Get by priority (High/Medium/Low)

// Route Documentation:
// GET    /api/announcements                    - Get all announcements (query: ?activeOnly=true&adminId=xxx&priority=High)
// GET    /api/announcements/:id               - Get announcement by ID
// GET    /api/announcements/priority/:priority - Get announcements by priority (High/Medium/Low)
// POST   /api/announcements                   - Create new announcement
// PUT    /api/announcements/:id               - Update announcement
// PUT    /api/announcements/:id/toggle        - Toggle announcement status
// DELETE /api/announcements/:id               - Delete announcement

module.exports = router;
