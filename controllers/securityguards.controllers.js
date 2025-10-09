const { SecurityGuardService } = require('../services/securityguards.services');

class SecurityGuardsController {
  static async createGuard(req, res) {
    console.log('\n=== 🛡️ CREATE SECURITY GUARD CONTROLLER CALLED ===');
    const { adminId } = req.params;
    const { guardimage, firstname, lastname, mobilenumber, age, assigngates, gender } = req.body;
    console.log('🔑 Admin ID:', adminId);
    console.log('📝 Body:', { firstname, lastname, mobilenumber, age, assigngates, gender });
    const result = await SecurityGuardService.createGuard(adminId, guardimage, firstname, lastname, mobilenumber, age, assigngates, gender);
    console.log('🛡️ Create result:', result.status, result.message);
    res.status(result.status ? 201 : 400).json(result);
  }

  static async getAllGuards(req, res) {
    console.log('\n=== 🛡️ GET ALL SECURITY GUARDS CONTROLLER CALLED ===');
    const { adminId } = req.params;
    console.log('🔑 Admin ID:', adminId);
    const result = await SecurityGuardService.getAllGuardsbyadminid(adminId);
    console.log('🛡️ Get all result:', result.status, Array.isArray(result.data) ? `Count: ${result.data.length}` : result.message);
    res.status(result.status ? 200 : 400).json(result);
  }

  static async getGuardById(req, res) {
    console.log('\n=== 🛡️ GET SECURITY GUARD BY ID CONTROLLER CALLED ===');
    const { adminId, guardId } = req.params;
    console.log('🔑 Admin ID:', adminId, '🆔 Guard ID:', guardId);
    const result = await SecurityGuardService.getGuardById(adminId, guardId);
    console.log('🛡️ Get by ID result:', result.status, result.message || (result.data && result.data._id));
    res.status(result.status ? 200 : 404).json(result);
  }

  static async updateGuard(req, res) {
    console.log('\n=== 🛡️ UPDATE SECURITY GUARD CONTROLLER CALLED ===');
    const { adminId, guardId } = req.params;
    const updateData = req.body;
    console.log('🔑 Admin ID:', adminId, '🆔 Guard ID:', guardId, '📝 Update:', updateData);
    const result = await SecurityGuardService.updateGuard(adminId, guardId, updateData);
    console.log('🛡️ Update result:', result.status, result.message);
    res.status(result.status ? 200 : 400).json(result);
  }

  static async deleteGuard(req, res) {
    console.log('\n=== 🛡️ DELETE SECURITY GUARD CONTROLLER CALLED ===');
    const { adminId, guardId } = req.params;
    console.log('🔑 Admin ID:', adminId, '🆔 Guard ID:', guardId);
    const result = await SecurityGuardService.deleteGuard(adminId, guardId);
    console.log('🛡️ Delete result:', result.status, result.message);
    res.status(result.status ? 200 : 404).json(result);
  }
}

module.exports = SecurityGuardsController;
