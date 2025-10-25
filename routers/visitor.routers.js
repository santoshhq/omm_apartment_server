const express = require('express');
const router = express.Router();
const VisitorController = require('../controllers/visitor.controllers');

// ===== VISITOR PRE-APPROVAL ROUTES =====

// 🏠 Create Visitor Pre-Approval (Member)
router.post('/', VisitorController.createVisitor);

// 📋 Get Pending Visitors for Guard
router.get('/guard', VisitorController.getVisitorsForGuard);

// ✅ Approve Visitor by ID and OTP (Guard)
router.post('/approve', VisitorController.approveVisitor);

// 👑 Get All Visitors for Admin
router.get('/admin', VisitorController.getVisitorsForAdmin);

// 🔄 Update Visitor Status (Admin)
router.put('/:visitorId/status', VisitorController.updateVisitorStatus);

// 🗑️ Delete Visitor (Admin)
router.delete('/:visitorId', VisitorController.deleteVisitor);

module.exports = router;