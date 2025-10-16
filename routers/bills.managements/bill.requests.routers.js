const express = require('express');
const router = express.Router();
const BillRequestsController = require('../../controllers/bills.managements/bill.requests.controllers');

// Create a new bill request
router.post('/create', BillRequestsController.createBillRequest);

// Get all bill requests (filtered by admin)
router.get('/all/:adminId', BillRequestsController.getAllBillRequests);

// Get all bill requests for a specific admin
router.get('/admin/:adminId', BillRequestsController.getBillRequestsByAdmin);

// Get bill requests by bill ID
router.get('/bills/:billId', BillRequestsController.getBillRequestsByBillId);

// Get a bill request by ID
router.get('/:id', BillRequestsController.getBillRequestById);

// Update a bill request by ID
router.put('/:id', BillRequestsController.updateBillRequest);

// Delete a bill request by ID
router.delete('/:id', BillRequestsController.deleteBillRequest);

module.exports = router;
