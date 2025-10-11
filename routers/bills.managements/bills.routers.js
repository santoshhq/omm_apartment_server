const express = require('express');
const router = express.Router();
const BillsController = require('../../controllers/bills.managements/bills.controllers');

// Create a new bill
router.post('/create', BillsController.createBill);

// Get all bills for a specific admin
router.get('/all/:adminId', BillsController.getAllBills);

// Get a bill by ID
router.get('/:id', BillsController.getBillById);

// Update a bill by ID
router.put('/:id', BillsController.updateBill);

// Delete a bill by ID
router.delete('/:id', BillsController.deleteBill);

module.exports = router;
