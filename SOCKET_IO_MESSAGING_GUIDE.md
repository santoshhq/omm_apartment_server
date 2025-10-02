# 🔌 SOCKET.IO REAL-TIME MESSAGING SYSTEM

## 🚀 Overview
Socket.io has been integrated **ONLY for the messaging system** while keeping all other collections and functionalities unchanged. This provides real-time messaging capabilities for complaint conversations.

## 📋 Socket.io Events

### **Client Connection Events**

#### **1. Connect to Server**
```javascript
// Frontend JavaScript
const socket = io('http://localhost:8080', {
    withCredentials: true
});

socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
});
```

#### **2. Join Complaint Room**
```javascript
// Join a specific complaint conversation
socket.emit('join_complaint', {
    complaintId: '60d5ecb54e5b2c001f5d7a2d',
    userId: '60d5ecb54e5b2c001f5d7a2b'
});

// Listen for join confirmation
socket.on('user_joined', (data) => {
    console.log('User joined:', data.message);
});
```

#### **3. Leave Complaint Room**
```javascript
// Leave complaint conversation
socket.emit('leave_complaint', {
    complaintId: '60d5ecb54e5b2c001f5d7a2d',
    userId: '60d5ecb54e5b2c001f5d7a2b'
});

// Listen for leave confirmation
socket.on('user_left', (data) => {
    console.log('User left:', data.message);
});
```

### **Real-Time Messaging Events**

#### **4. Send Real-Time Message**
```javascript
// Send message via Socket.io (instant delivery)
socket.emit('send_message', {
    complaintId: '60d5ecb54e5b2c001f5d7a2d',
    senderId: '60d5ecb54e5b2c001f5d7a2b',
    senderName: 'John Doe',
    message: 'The maintenance issue has been resolved!'
});
```

#### **5. Receive Real-Time Messages**
```javascript
// Listen for new messages in real-time
socket.on('new_message', (data) => {
    console.log('New message received:', data);
    // Update UI with new message
    displayMessage(data);
});

// Listen for messages saved to database
socket.on('message_received', (data) => {
    console.log('Message saved to database:', data);
    // Update message status to "delivered"
    updateMessageStatus(data.id, 'delivered');
});
```

### **Typing Indicators**

#### **6. Typing Start/Stop**
```javascript
// User starts typing
socket.emit('typing_start', {
    complaintId: '60d5ecb54e5b2c001f5d7a2d',
    userId: '60d5ecb54e5b2c001f5d7a2b',
    userName: 'John Doe'
});

// User stops typing
socket.emit('typing_stop', {
    complaintId: '60d5ecb54e5b2c001f5d7a2d',
    userId: '60d5ecb54e5b2c001f5d7a2b',
    userName: 'John Doe'
});

// Listen for typing indicators
socket.on('user_typing', (data) => {
    if (data.isTyping) {
        showTypingIndicator(data.userName);
    } else {
        hideTypingIndicator(data.userName);
    }
});
```

## 🌐 REST API Integration

### **Enhanced Message Sending**
The REST API now supports both database storage AND real-time delivery:

**URL:** `POST http://localhost:8080/api/messages/send`
**Body:**
```json
{
    "complaintId": "60d5ecb54e5b2c001f5d7a2d",
    "senderId": "60d5ecb54e5b2c001f5d7a2b",
    "message": "The water leak has been fixed successfully!"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Message sent successfully",
    "data": {
        "id": "message_id_123",
        "complaintId": "60d5ecb54e5b2c001f5d7a2d",
        "senderId": {
            "firstName": "John",
            "lastName": "Doe",
            "flatNo": "301"
        },
        "message": "The water leak has been fixed successfully!",
        "timestamp": "2025-10-02T14:30:00.000Z"
    }
}
```

### **Additional Endpoints**

#### **Check System Health**
**URL:** `GET http://localhost:8080/api/messages/health`
**Response:**
```json
{
    "success": true,
    "message": "Messages service is running",
    "socketio": "Connected",
    "timestamp": "2025-10-02T14:30:00.000Z"
}
```

#### **Get Online Users**
**URL:** `GET http://localhost:8080/api/messages/complaint/60d5ecb54e5b2c001f5d7a2d/online-users`
**Response:**
```json
{
    "success": true,
    "message": "Found 3 online users",
    "data": {
        "complaintId": "60d5ecb54e5b2c001f5d7a2d",
        "onlineUsers": 3,
        "timestamp": "2025-10-02T14:30:00.000Z"
    }
}
```

## 💻 Frontend Implementation Example

### **Complete React Component Example**
```javascript
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ComplaintMessaging = ({ complaintId, userId, userName }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [typingUsers, setTypingUsers] = useState([]);

    useEffect(() => {
        // Initialize Socket.io connection
        const newSocket = io('http://localhost:8080', {
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            
            // Join complaint room
            newSocket.emit('join_complaint', {
                complaintId,
                userId
            });
        });

        // Listen for real-time messages
        newSocket.on('message_received', (data) => {
            setMessages(prev => [...prev, data]);
        });

        // Listen for typing indicators
        newSocket.on('user_typing', (data) => {
            if (data.isTyping && data.userId !== userId) {
                setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
            } else {
                setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave_complaint', { complaintId, userId });
            newSocket.disconnect();
        };
    }, [complaintId, userId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            // Send via REST API (saves to database + real-time delivery)
            const response = await fetch('http://localhost:8080/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    complaintId,
                    senderId: userId,
                    message: newMessage
                })
            });

            if (response.ok) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = () => {
        if (socket) {
            socket.emit('typing_start', {
                complaintId,
                userId,
                userName
            });

            // Stop typing after 2 seconds of inactivity
            setTimeout(() => {
                socket.emit('typing_stop', {
                    complaintId,
                    userId,
                    userName
                });
            }, 2000);
        }
    };

    return (
        <div className="messaging-container">
            <div className="messages-list">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <strong>{msg.senderId.firstName} {msg.senderId.lastName}:</strong>
                        <p>{msg.message}</p>
                        <small>{new Date(msg.timestamp).toLocaleString()}</small>
                    </div>
                ))}
                
                {/* Typing indicators */}
                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        {typingUsers.map(user => user.userName).join(', ')} is typing...
                    </div>
                )}
            </div>

            <div className="message-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleTyping}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>

            <div className="online-status">
                Online users: {onlineUsers}
            </div>
        </div>
    );
};

export default ComplaintMessaging;
```

## 📱 Testing with Postman

### **1. REST API Testing (Normal)**
All existing REST API endpoints work exactly the same:
- `POST /api/complaints/create`
- `GET /api/complaints/admin/:adminId`
- `PUT /api/complaints/status/:id`
- etc.

### **2. Socket.io Testing**
Use tools like:
- **Socket.io Client Test Tool**: Online Socket.io client tester
- **Postman**: Has Socket.io testing capabilities
- **Browser Console**: Simple JavaScript testing

## 🔐 Security Features

### **CORS Configuration**
```javascript
// Already configured in index.js
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
```

### **Room-based Isolation**
- Each complaint has its own room
- Messages only delivered to users in the same complaint room
- No cross-complaint message leakage

## ⚡ Performance Benefits

1. **Instant Message Delivery**: No need to refresh or poll for new messages
2. **Real-time Typing Indicators**: Users see when others are typing
3. **Online User Count**: Know how many people are actively viewing the complaint
4. **Automatic Reconnection**: Socket.io handles connection drops gracefully
5. **Dual Delivery**: Messages saved to database AND delivered in real-time

## 🚨 Important Notes

1. **Other Collections Unchanged**: Only messaging uses Socket.io - all other APIs work normally
2. **Backward Compatible**: REST API still works for message sending
3. **Real-time Enhancement**: Socket.io adds real-time features without breaking existing functionality
4. **Database Persistence**: All messages are still saved to MongoDB
5. **Scalable**: Can handle multiple complaint conversations simultaneously

## 🎯 Quick Start

1. **Install Socket.io client** in your frontend:
   ```bash
   npm install socket.io-client
   ```

2. **Connect to server**:
   ```javascript
   const socket = io('http://localhost:8080');
   ```

3. **Join complaint room**:
   ```javascript
   socket.emit('join_complaint', { complaintId, userId });
   ```

4. **Listen for messages**:
   ```javascript
   socket.on('message_received', (data) => {
       // Handle new message
   });
   ```

Your messaging system now has real-time capabilities while all other systems remain unchanged! 🎉