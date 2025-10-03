const express = require('express');
const router = express.Router();
const MessageController = require('../../controllers/complaintssection/messages.controllers');

// ===== MESSAGES ROUTES =====

// Message Operations
router.post('/send', MessageController.sendMessage);                          // Send new message
router.get('/complaint/:complaintId', MessageController.getMessages);         // Get messages by complaint
router.get('/sender/:senderId', MessageController.getMessagesBySender);       // Get messages by sender

// Get online users for a complaint
router.get('/complaint/:complaintId/online-users', (req, res) => {
    try {
        const { complaintId } = req.params;
        const io = req.app.get('io');
        
        // Get room information
        const room = io.sockets.adapter.rooms.get(complaintId);
        const onlineCount = room ? room.size : 0;
        
        res.json({
            success: true,
            message: `Found ${onlineCount} online users`,
            data: {
                complaintId: complaintId,
                onlineCount: onlineCount,
                isRoomActive: onlineCount > 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting online users',
            error: error.message
        });
    }
});

// Health check endpoint with Socket.io status
router.get('/health', (req, res) => {
    const io = req.app.get('io');
    const connectedClients = io?.engine?.clientsCount || 0;
    
    res.json({
        success: true,
        message: 'Messages service is running',
        socketConnections: connectedClients,
        realTimeEnabled: !!io,
        timestamp: new Date()
    });
});

// Route Documentation:
// POST   /api/messages/send                                    - Send new message (with enhanced real-time Socket.io support)
// GET    /api/messages/complaint/:complaintId                  - Get all messages for a complaint (with populated sender details)
// GET    /api/messages/sender/:senderId                        - Get all messages by sender
// GET    /api/messages/complaint/:complaintId/online-users     - Get count of online users in complaint room
// GET    /api/messages/health                                  - Check messages service and Socket.io status with connection count

module.exports = router;
