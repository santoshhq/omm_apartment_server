const BillsService = require('../../services/bills.managements/bills.services');

class BillsController {
	static async createBill(req, res) {
		try {
			const result = await BillsService.createBill(req.body);
			return res.status(result.status ? 201 : 400).json(result);
		} catch (error) {
			return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
		}
	}

	static async getAllBills(req, res) {
		try {
			const { adminId } = req.params;
			const result = await BillsService.getAllBills(adminId);
			return res.status(result.status ? 200 : 400).json(result);
		} catch (error) {
			return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
		}
	}

	static async getBillById(req, res) {
		try {
			const { id } = req.params;
			const result = await BillsService.getBillById(id);
			return res.status(result.status ? 200 : 404).json(result);
		} catch (error) {
			return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
		}
	}

	static async updateBill(req, res) {
		try {
			const { id } = req.params;
			const result = await BillsService.updateBill(id, req.body);
			return res.status(result.status ? 200 : 404).json(result);
		} catch (error) {
			return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
		}
	}

	static async deleteBill(req, res) {
		try {
			const { id } = req.params;
			const result = await BillsService.deleteBill(id);
			return res.status(result.status ? 200 : 404).json(result);
		} catch (error) {
			return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
		}
	}
}

module.exports = BillsController;
