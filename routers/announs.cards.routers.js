const AnnounCardController = require('../controllers/announs.cards.controllers');
const express = require('express');
const router = express.Router();

// ===== ADMIN-SPECIFIC ANNOUNCEMENT ROUTES =====

// Create Announcement for specific admin
router.post("/admin/:adminId", AnnounCardController.createAnnounCard);

// Get all Announcements for specific admin
router.get("/admin/:adminId", AnnounCardController.getAllAnnounCards);

// Get Announcement by ID (admin-specific)
router.get("/admin/:adminId/announcement/:id", AnnounCardController.getAnnounCardById);

// Update Announcement (admin-specific)
router.put("/admin/:adminId/announcement/:id", AnnounCardController.updateAnnounCard);

// Delete Announcement (admin-specific)
router.delete("/admin/:adminId/announcement/:id", AnnounCardController.deleteAnnounCard);

// Toggle Announcement Status (admin-specific)
router.put("/admin/:adminId/announcement/:id/toggle", AnnounCardController.toggleAnnounStatus);

// Get by priority (admin-specific)
router.get("/admin/:adminId/priority/:priority", AnnounCardController.getAnnouncementsByPriority);

// ===== LEGACY ROUTES REMOVED FOR SECURITY =====
// All routes now require admin-specific paths for better security
// Frontend must use: /api/announcements/admin/:adminId instead of /api/announcements/

// Route Documentation:
// GET    /api/announcements                    - Get all announcements (query: ?activeOnly=true&adminId=xxx&priority=High)
// GET    /api/announcements/:id               - Get announcement by ID
// GET    /api/announcements/priority/:priority - Get announcements by priority (High/Medium/Low)
// POST   /api/announcements                   - Create new announcement
// PUT    /api/announcements/:id               - Update announcement
// PUT    /api/announcements/:id/toggle        - Toggle announcement status
// DELETE /api/announcements/:id               - Delete announcement

module.exports = router;
