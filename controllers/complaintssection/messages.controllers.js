const MessageService = require('../../services/complaintssection/messages.services');

class MessageController {

    // Send a new message (with Socket.io support)
    static async sendMessage(req, res) {
        try {
            console.log('\n=== 💬 SEND MESSAGE CONTROLLER CALLED ===');
            console.log('📄 Request Body:', req.body);

            const { complaintId, senderId, message } = req.body;

            // Basic validation
            if (!complaintId || !senderId || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: complaintId, senderId, message'
                });
            }

            // Get Socket.io instance from app
            const io = req.app.get('io');

            const result = await MessageService.sendMessage({
                complaintId,
                senderId,
                message,
                io  // Pass Socket.io instance for real-time messaging
            });

            const statusCode = result.success ? 201 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in sendMessage controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all messages for a complaint
    static async getMessages(req, res) {
        try {
            console.log('\n=== 📨 GET MESSAGES CONTROLLER CALLED ===');
            console.log('📝 Complaint ID:', req.params.complaintId);

            const { complaintId } = req.params;

            if (!complaintId) {
                return res.status(400).json({
                    success: false,
                    message: 'Complaint ID is required'
                });
            }

            const result = await MessageService.getMessagesByComplaint(complaintId);

            const statusCode = result.success ? 200 : (result.message.includes('not found') ? 404 : 400);
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getMessages controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get messages by sender
    static async getMessagesBySender(req, res) {
        try {
            console.log('\n=== 👤 GET MESSAGES BY SENDER CONTROLLER CALLED ===');
            console.log('👤 Sender ID:', req.params.senderId);

            const { senderId } = req.params;

            if (!senderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Sender ID is required'
                });
            }

            const result = await MessageService.getMessagesBySender(senderId);

            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getMessagesBySender controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = MessageController;
