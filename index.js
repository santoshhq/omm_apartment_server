require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const PORT = process.env.PORT || 8080;
const db = require('./config/db');
const Signup = require('./models/auth.models/signup');
const Visitor = require('./models/visitor');
const cron = require('node-cron');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Make io accessible to the app
app.set('io', io);

// Middleware to attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Track online users per complaint
const onlineUsers = new Map(); // complaintId -> Set of user objects

// Socket.io connection handling with enhanced real-time messaging
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);
    
    // Store user info on socket for easy access
    socket.userInfo = null;
    socket.currentComplaintId = null;

    // Join gate room for guards
    socket.on('join-gate', (data) => {
        const { gateId, guardId } = data;
        socket.join(`gate-${gateId}`);
        console.log(`👮 Guard ${guardId} joined gate room: gate-${gateId}`);
    });

    // Enhanced join complaint room with user tracking
    socket.on('join-complaint', (data) => {
        const { complaintId, userId, userType, userName } = data;
        
        // Leave previous room if any
        if (socket.currentComplaintId) {
            socket.leave(socket.currentComplaintId);
            removeUserFromComplaint(socket.currentComplaintId, socket.id);
        }
        
        // Join new room
        socket.join(complaintId);
        socket.currentComplaintId = complaintId;
        socket.userInfo = { userId, userType, userName, socketId: socket.id };
        
        // Track online users
        if (!onlineUsers.has(complaintId)) {
            onlineUsers.set(complaintId, new Set());
        }
        onlineUsers.get(complaintId).add(socket.userInfo);
        
        console.log(`👥 User ${userName} (${userType}) joined complaint room: ${complaintId}`);
        
        // Notify others in the room with user details
        socket.to(complaintId).emit('user-joined', {
            userId: userId,
            userName: userName,
            userType: userType,
            message: `${userName} joined the conversation`,
            timestamp: new Date(),
            onlineCount: onlineUsers.get(complaintId).size
        });
        
        // Send online users list to the new user
        const onlineUsersList = Array.from(onlineUsers.get(complaintId) || []);
        socket.emit('online-users-updated', {
            onlineUsers: onlineUsersList,
            count: onlineUsersList.length
        });
    });

    // Enhanced typing indicators with user details
    socket.on('typing', (data) => {
        if (socket.currentComplaintId && socket.userInfo) {
            socket.to(socket.currentComplaintId).emit('user-typing', {
                userId: socket.userInfo.userId,
                userName: socket.userInfo.userName,
                userType: socket.userInfo.userType,
                isTyping: true,
                timestamp: new Date()
            });
        }
    });

    socket.on('stop-typing', (data) => {
        if (socket.currentComplaintId && socket.userInfo) {
            socket.to(socket.currentComplaintId).emit('user-typing', {
                userId: socket.userInfo.userId,
                userName: socket.userInfo.userName,
                userType: socket.userInfo.userType,
                isTyping: false,
                timestamp: new Date()
            });
        }
    });

    // Handle message delivery confirmation
    socket.on('message-delivered', (data) => {
        const { messageId, complaintId } = data;
        socket.to(complaintId).emit('message-delivery-confirmed', {
            messageId: messageId,
            deliveredBy: socket.userInfo?.userId,
            timestamp: new Date()
        });
    });

    // Handle message read confirmation
    socket.on('message-read', (data) => {
        const { messageId, complaintId } = data;
        socket.to(complaintId).emit('message-read-confirmed', {
            messageId: messageId,
            readBy: socket.userInfo?.userId,
            timestamp: new Date()
        });
    });

    // Handle disconnect with cleanup
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
        
        if (socket.currentComplaintId && socket.userInfo) {
            // Remove user from online tracking
            removeUserFromComplaint(socket.currentComplaintId, socket.id);
            
            // Notify others about user leaving
            socket.to(socket.currentComplaintId).emit('user-left', {
                userId: socket.userInfo.userId,
                userName: socket.userInfo.userName,
                userType: socket.userInfo.userType,
                message: `${socket.userInfo.userName} left the conversation`,
                timestamp: new Date(),
                onlineCount: onlineUsers.get(socket.currentComplaintId)?.size || 0
            });
        }
    });
});

// Helper function to remove user from complaint tracking
function removeUserFromComplaint(complaintId, socketId) {
    if (onlineUsers.has(complaintId)) {
        const users = onlineUsers.get(complaintId);
        const userToRemove = Array.from(users).find(user => user.socketId === socketId);
        if (userToRemove) {
            users.delete(userToRemove);
            if (users.size === 0) {
                onlineUsers.delete(complaintId);
            }
        }
    }
}

app.get('/', (req, res) => {
    res.send('Hello World! Socket.io is running.');
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🔌 Socket.io is ready for real-time messaging`);
});

// Cron job to expire pending visitors and clean up old approved records
cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running visitor cleanup check...');
    try {
        await Visitor.expireOldApprovals();
        console.log('✅ Visitor cleanup check completed');
    } catch (error) {
        console.error('❌ Error during visitor cleanup check:', error);
    }
});