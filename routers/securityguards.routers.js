const express = require('express');
const SecurityGuardsController = require('../controllers/securityguards.controllers');
const router = express.Router();

// All routes require adminId
router.post('/admin/:adminId', SecurityGuardsController.createGuard);
router.get('/admin/:adminId', SecurityGuardsController.getAllGuards);
router.get('/admin/:adminId/:guardId', SecurityGuardsController.getGuardById);
router.put('/admin/:adminId/:guardId', SecurityGuardsController.updateGuard);
router.delete('/admin/:adminId/:guardId', SecurityGuardsController.deleteGuard);

module.exports = router;
