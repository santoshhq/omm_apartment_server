const HousekeepingService = require('../services/housekeeping.services');

class HousekeepingController {
  static async createHousekeeping(req, res) {
    console.log('\n=== 🧹 CREATE HOUSEKEEPING CONTROLLER CALLED ===');
    const { adminId } = req.params;
    const { personimage, firstname, lastname, mobilenumber, age, assignfloors, gender } = req.body;
    console.log('🔑 Admin ID:', adminId);
    console.log('📝 Body:', { firstname, lastname, mobilenumber, age, assignfloors, gender });
    const result = await HousekeepingService.createHousekeeping(adminId, personimage, firstname, lastname, mobilenumber, age, assignfloors, gender);
    console.log('🧹 Create result:', result.status, result.message);
    res.status(result.status ? 201 : 400).json(result);
  }

  static async getAllHousekeeping(req, res) {
    console.log('\n=== 🧹 GET ALL HOUSEKEEPING CONTROLLER CALLED ===');
    const { adminId } = req.params;
    console.log('🔑 Admin ID:', adminId);
    const result = await HousekeepingService.getAllHousekeepingbyadminid(adminId);
    console.log('🧹 Get all result:', result.status, Array.isArray(result.data) ? `Count: ${result.data.length}` : result.message);
    res.status(result.status ? 200 : 400).json(result);
  }

  static async getHousekeepingById(req, res) {
    console.log('\n=== 🧹 GET HOUSEKEEPING BY ID CONTROLLER CALLED ===');
    const { adminId, staffId } = req.params;
    console.log('🔑 Admin ID:', adminId, '🆔 Staff ID:', staffId);
    const result = await HousekeepingService.getHousekeepingById(adminId, staffId);
    console.log('🧹 Get by ID result:', result.status, result.message || (result.data && result.data._id));
    res.status(result.status ? 200 : 404).json(result);
  }

  static async updateHousekeeping(req, res) {
    console.log('\n=== 🧹 UPDATE HOUSEKEEPING CONTROLLER CALLED ===');
    const { adminId, staffId } = req.params;
    const updateData = req.body;
    console.log('🔑 Admin ID:', adminId, '🆔 Staff ID:', staffId, '📝 Update:', updateData);
    const result = await HousekeepingService.updateHousekeeping(adminId, staffId, updateData);
    console.log('🧹 Update result:', result.status, result.message);
    res.status(result.status ? 200 : 400).json(result);
  }

  static async deleteHousekeeping(req, res) {
    console.log('\n=== 🧹 DELETE HOUSEKEEPING CONTROLLER CALLED ===');
    const { adminId, staffId } = req.params;
    console.log('🔑 Admin ID:', adminId, '🆔 Staff ID:', staffId);
    const result = await HousekeepingService.deleteHousekeeping(adminId, staffId);
    console.log('🧹 Delete result:', result.status, result.message);
    res.status(result.status ? 200 : 404).json(result);
  }
}

module.exports = HousekeepingController;
