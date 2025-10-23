const express = require('express');
const router = express.Router();
const IdCardManagementController = require('../controllers/idcards.managements.controllers');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// ===== ID CARD MANAGEMENT ROUTES =====

// Create ID Card (no auth required for testing)
router.post('/', IdCardManagementController.createIdCard);

// Get all ID Cards for authenticated user (no auth required for testing)
router.get('/', IdCardManagementController.getAllIdCardsByMember);

// Get all ID Cards for specific member (no auth required for testing)
router.get('/member/:memberId', IdCardManagementController.getAllIdCardsByMember);

// Get ID Card by ID (no auth required for testing)
router.get('/:id', IdCardManagementController.getIdCardById);

// Update ID Card (no auth required for testing)
router.put('/:id', IdCardManagementController.updateIdCard);

// Delete ID Card (no auth required for testing)
router.delete('/:id', IdCardManagementController.deleteIdCard);

// Get expiring cards (admin access only)
router.get('/admin/expiring', authenticateAdmin, IdCardManagementController.getExpiringCards);

module.exports = router;
