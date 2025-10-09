const express = require('express');
const HousekeepingController = require('../controllers/housekeeping.controllers');
const router = express.Router();

// All routes require adminId
router.post('/admin/:adminId', HousekeepingController.createHousekeeping);
router.get('/admin/:adminId', HousekeepingController.getAllHousekeeping);
router.get('/admin/:adminId/:staffId', HousekeepingController.getHousekeepingById);
router.put('/admin/:adminId/:staffId', HousekeepingController.updateHousekeeping);
router.delete('/admin/:adminId/:staffId', HousekeepingController.deleteHousekeeping);

module.exports = router;
