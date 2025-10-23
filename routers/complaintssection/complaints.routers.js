const express = require('express');
const router = express.Router();
const ComplaintController = require('../../controllers/complaintssection/complaints.controllers');

// ===== COMPLAINTS ROUTES =====

// Basic CRUD Operations
router.post('/create', ComplaintController.createComplaint);                    // Create new complaint
router.get('/admin/:adminId', ComplaintController.getAdminComplaints);         // Get all complaints for admin (with filters)
router.get('/user/:userId', ComplaintController.getUserComplaints);            // Get all complaints for user
router.get('/:id', ComplaintController.getComplaintDetails);                   // Get complaint details with messages
router.put('/status/:id', ComplaintController.updateStatus);                   // Update complaint status
router.delete('/:id', ComplaintController.deleteComplaint);                    // Delete complaint and associated messages

// Filter Operations
router.get('/admin/:adminId/status/:status', ComplaintController.getComplaintsByStatus); // Get complaints by status

// Route Documentation:
// POST   /api/complaints/create                     - Create new complaint (requires: userId, createdByadmin, title, description)
// GET    /api/complaints/admin/:adminId             - Get all complaints for admin (query: ?status=pending)
// GET    /api/complaints/user/:userId               - Get all complaints for user
// GET    /api/complaints/:id                        - Get complaint details with messages
// PUT    /api/complaints/status/:id                 - Update complaint status
// DELETE /api/complaints/:id                       - Delete complaint and associated messages
// GET    /api/complaints/admin/:adminId/status/:status - Get complaints by status (pending/solved/unsolved)

module.exports = router;
