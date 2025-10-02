const express = require('express');
const router = express.Router();
const ComplaintController = require('../../controllers/complaintssection/complaints.controllers');

// ===== COMPLAINTS ROUTES =====

// Basic CRUD Operations
router.post('/create', ComplaintController.createComplaint);                    // Create new complaint
router.get('/admin/:adminId', ComplaintController.getAdminComplaints);         // Get all complaints for admin (with filters)
router.get('/:id', ComplaintController.getComplaintDetails);                   // Get complaint details with messages
router.put('/status/:id', ComplaintController.updateStatus);                   // Update complaint status

// Filter Operations
router.get('/admin/:adminId/status/:status', ComplaintController.getComplaintsByStatus); // Get complaints by status

// Route Documentation:
// POST   /api/complaints/create                     - Create new complaint
// GET    /api/complaints/admin/:adminId             - Get all complaints for admin (query: ?status=pending)
// GET    /api/complaints/:id                        - Get complaint details with messages
// GET    /api/complaints/admin/:adminId/status/:status - Get complaints by status (pending/solved/unsolved)
// PUT    /api/complaints/status/:id                 - Update complaint status

module.exports = router;
