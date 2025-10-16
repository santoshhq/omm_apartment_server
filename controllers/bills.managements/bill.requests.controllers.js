const BillRequestService = require('../../services/bills.managements/bill.requests.services');

class BillRequestsController {
    static async createBillRequest(req, res) {
        try {
            const result = await BillRequestService.createBillRequest(req.body);
            if (result.status) {
                const io = req.app.get('io');
                io.emit('bill-request-created', { request: result.data });
            }
            return res.status(result.status ? 201 : 400).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async getAllBillRequests(req, res) {
        try {
            const { adminId } = req.params;
            const result = await BillRequestService.getAllBillRequests(adminId);
            return res.status(result.status ? 200 : 400).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async getBillRequestsByAdmin(req, res) {
        try {
            const { adminId } = req.params;
            const result = await BillRequestService.getBillRequestsByAdmin(adminId);
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async getBillRequestsByBillId(req, res) {
        try {
            const { billId } = req.params;
            const result = await BillRequestService.getBillRequestsByBillId(billId);
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async getBillRequestById(req, res) {
        try {
            const { id } = req.params;
            const result = await BillRequestService.getBillRequestById(id);
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async updateBillRequest(req, res) {
        try {
            const { id } = req.params;
            const result = await BillRequestService.updateBillRequest(id, req.body);
            if (result.status) {
                const io = req.app.get('io');
                io.emit('bill-request-updated', { request: result.data });
            }
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async deleteBillRequest(req, res) {
        try {
            const { id } = req.params;
            const result = await BillRequestService.deleteBillRequest(id);
            if (result.status) {
                const io = req.app.get('io');
                io.emit('bill-request-deleted', { requestId: id });
            }
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = BillRequestsController;
