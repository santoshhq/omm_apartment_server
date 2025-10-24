const express = require('express');
const router = express.Router();
const FinancialOverviewController = require('../controllers/financialOverview.controllers');

// ===== FINANCIAL OVERVIEW ROUTES =====

// Add a new transaction
router.post('/', FinancialOverviewController.addTransaction);

// Get financial summary for a member
router.get('/:memberId', FinancialOverviewController.getFinancialSummary);

// Get transactions by category for a member
router.get('/category/:category', FinancialOverviewController.getTransactionsByCategory);

// Get transactions by date range for a member
router.get('/daterange', FinancialOverviewController.getTransactionsByDateRange);

// Update transaction
router.put('/:id', FinancialOverviewController.updateTransaction);

// Delete transaction
router.delete('/:id', FinancialOverviewController.deleteTransaction);

module.exports = router;
