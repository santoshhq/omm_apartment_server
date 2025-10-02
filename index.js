require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const PORT = process.env.PORT || 8080;
const db = require('./config/db');
const Signup = require('./models/auth.models/signup');

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

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join complaint room for real-time messaging
    socket.on('join-complaint', (complaintId) => {
        socket.join(complaintId);
        console.log(`👥 User ${socket.id} joined complaint room: ${complaintId}`);
        
        // Notify others in the room
        socket.to(complaintId).emit('user-joined', {
            message: 'A user joined the conversation',
            timestamp: new Date()
        });
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        socket.to(data.complaintId).emit('typing', {
            senderId: data.senderId,
            isTyping: true
        });
    });

    socket.on('stop-typing', (data) => {
        socket.to(data.complaintId).emit('typing', {
            senderId: data.senderId,
            isTyping: false
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('Hello World! Socket.io is running.');
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🔌 Socket.io is ready for real-time messaging`);
});