const DonationService = require('../../services/events.cards/donations.services');

class DonationsController {
    static async createDonation(req, res) {
        try {
            const { userId } = req.params;
            const donationData = { ...req.body, userId };
            const result = await DonationService.createDonation(donationData);
            if (result.status) {
                const io = req.app.get('io');
                io.emit('donation-created', { donation: result.data });
            }
            return res.status(result.status ? 201 : 400).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async getAllDonations(req, res) {
        try {
            const { adminId } = req.params;
            const result = await DonationService.getAllDonations(adminId);
            return res.status(result.status ? 200 : 400).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async getDonationsByEventId(req, res) {
        try {
            const { eventId } = req.params;
            const { adminId } = req.params;
            const result = await DonationService.getDonationsByEventId(eventId, adminId);
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async getDonationById(req, res) {
        try {
            const { id } = req.params;
            const { adminId } = req.params;
            const result = await DonationService.getDonationById(id, adminId);
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async updateDonation(req, res) {
        try {
            const { id } = req.params;
            const { adminId } = req.params;
            const result = await DonationService.updateDonation(id, req.body, adminId);
            if (result.status) {
                const io = req.app.get('io');
                io.emit('donation-updated', { donation: result.data });
            }
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }

    static async deleteDonation(req, res) {
        try {
            const { id } = req.params;
            const { adminId } = req.params;
            const result = await DonationService.deleteDonation(id, adminId);
            if (result.status) {
                const io = req.app.get('io');
                io.emit('donation-deleted', { donationId: id });
            }
            return res.status(result.status ? 200 : 404).json(result);
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = DonationsController;