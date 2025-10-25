const express = require('express');
const router = express.Router();
const BusinessOverviewController = require('../controllers/businessOverview.controllers');

// ===== BUSINESS OVERVIEW ROUTES =====

// 🏢 Add Business Entry
router.post('/', BusinessOverviewController.addBusiness);

// 📊 Get Business Summary for a Member
router.get('/', BusinessOverviewController.getBusinessSummary);

// 📂 Get Businesses by Type for a Member
router.get('/type/:businessType', BusinessOverviewController.getBusinessesByType);

// 💰 Get Businesses by Status (Profit/Loss/Break-even) for a Member
router.get('/status/:status', BusinessOverviewController.getBusinessesByStatus);

// 📈 Get Top Performing Businesses for a Member
router.get('/top-performing', BusinessOverviewController.getTopPerformingBusinesses);

// ✏️ Update Business Entry
router.put('/:id', BusinessOverviewController.updateBusiness);

// 🗑️ Delete Business Entry
router.delete('/:id', BusinessOverviewController.deleteBusiness);

module.exports = router;
