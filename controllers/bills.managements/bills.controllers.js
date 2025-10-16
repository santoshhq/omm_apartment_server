const BillsService = require('../../services/bills.managements/bills.services');

class BillsController {
	static async createBill(req, res) {
		try {
			const result = await BillsService.createBill(req.body);
			if (result.status) {
				const io = req.app.get('io');
				io.emit('bill-created', { bill: result.data });
			}
			return res.status(result.status ? 201 : 400).json(result);
		} catch (error) {
			return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
		}
	}

	static async getAllBills(req, res) {
		try {
			let { adminId } = req.params;

			// Handle case where adminId might be a stringified object like "{_id: 68ef28791fc4a2f925df3e3d, email: admin@example.com}"
			if (typeof adminId === 'string' && adminId.startsWith('{') && adminId.includes('_id')) {
				try {
					// Extract the _id value from the object string
					const idMatch = adminId.match(/_id:\s*([a-f0-9]{24})/i);
					if (idMatch && idMatch[1]) {
						adminId = idMatch[1];
						console.log('Extracted adminId from object string:', adminId);
					} else {
						console.log('Could not extract _id from adminId string:', adminId);
					}
				} catch (parseError) {
					console.log('Failed to parse adminId object string:', adminId, parseError.message);
				}
			}

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
			if (result.status) {
				const io = req.app.get('io');
				io.emit('bill-updated', { bill: result.data });
			}
			return res.status(result.status ? 200 : 404).json(result);
		} catch (error) {
			return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
		}
	}

	static async deleteBill(req, res) {
		try {
			const { id } = req.params;
			const result = await BillsService.deleteBill(id);
			if (result.status) {
				const io = req.app.get('io');
				io.emit('bill-deleted', { billId: id });
			}
			return res.status(result.status ? 200 : 404).json(result);
		} catch (error) {
			return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
		}
	}
}

module.exports = BillsController;
