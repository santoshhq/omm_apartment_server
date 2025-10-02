const express = require('express');
const router = express.Router();
const MessageController = require('../../controllers/complaintssection/messages.controllers');

// ===== MESSAGES ROUTES =====

// Message Operations
router.post('/send', MessageController.sendMessage);                          // Send new message
router.get('/complaint/:complaintId', MessageController.getMessages);         // Get messages by complaint
router.get('/sender/:senderId', MessageController.getMessagesBySender);       // Get messages by sender

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Messages service is running',
        timestamp: new Date()
    });
});

// Route Documentation:
// POST   /api/messages/send                           - Send new message (with real-time Socket.io support)
// GET    /api/messages/complaint/:complaintId         - Get all messages for a complaint
// GET    /api/messages/sender/:senderId               - Get all messages by sender
// GET    /api/messages/health                         - Check messages service and Socket.io status
// GET    /api/messages/complaint/:complaintId/online-users - Get count of online users in complaint room

module.exports = router;
