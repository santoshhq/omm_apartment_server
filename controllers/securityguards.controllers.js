const { SecurityGuardService } = require('../services/securityguards.services');

class SecurityGuardsController {
  static async createGuard(req, res) {
    const { adminId } = req.params;
    const { guardimage, firstname, lastname, mobilenumber, age, assigngates, gender } = req.body;
    const result = await SecurityGuardService.createGuard(adminId, guardimage, firstname, lastname, mobilenumber, age, assigngates, gender);
    res.status(result.status ? 201 : 400).json(result);
  }

  static async getAllGuards(req, res) {
    const { adminId } = req.params;
    const result = await SecurityGuardService.getAllGuardsbyadminid(adminId);
    res.status(result.status ? 200 : 400).json(result);
  }

  static async getGuardById(req, res) {
    const { adminId, guardId } = req.params;
    const result = await SecurityGuardService.getGuardById(adminId, guardId);
    res.status(result.status ? 200 : 404).json(result);
  }

  static async updateGuard(req, res) {
    const { adminId, guardId } = req.params;
    const updateData = req.body;
    const result = await SecurityGuardService.updateGuard(adminId, guardId, updateData);
    res.status(result.status ? 200 : 400).json(result);
  }

  static async deleteGuard(req, res) {
    const { adminId, guardId } = req.params;
    const result = await SecurityGuardService.deleteGuard(adminId, guardId);
    res.status(result.status ? 200 : 404).json(result);
  }
}

module.exports = SecurityGuardsController;
