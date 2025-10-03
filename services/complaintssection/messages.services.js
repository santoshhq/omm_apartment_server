const Messages = require('../../models/complaintssection/messages');
const Complaints = require('../../models/complaintssection/complaints');
const AdminMemberProfile = require('../../models/auth.models/adminMemberProfile');

class MessageService {

    // Send a message (with Socket.io support)
    static async sendMessage({ complaintId, senderId, message, io = null }) {
        try {
            console.log('\n=== 💬 SEND MESSAGE SERVICE CALLED ===');
            console.log('📝 Complaint ID:', complaintId);
            console.log('👤 Sender ID:', senderId);
            console.log('💬 Message:', message?.substring(0, 50) + '...');
            console.log('🔌 Socket.io:', io ? 'Available' : 'Not Available');

            // Validate required fields
            if (!complaintId || !senderId || !message) {
                return {
                    success: false,
                    message: 'Missing required fields: complaintId, senderId, message'
                };
            }

            // Check if complaint exists
            const complaint = await Complaints.findById(complaintId);
            if (!complaint) {
                return {
                    success: false,
                    message: 'Complaint not found'
                };
            }

            const messageData = {
                complaintId,
                senderId,
                message: message.trim()
            };

            const msg = await Messages.create(messageData);
            
            // Try to populate sender info, but handle if sender doesn't exist
            try {
                await msg.populate('senderId', 'firstName lastName email flatNo');
                console.log('✅ Sender populated successfully:', msg.senderId ? 'Found' : 'Not Found');
            } catch (populateError) {
                console.log('⚠️  Could not populate sender info:', populateError.message);
            }

            // If populate returned null, it means sender doesn't exist in AdminMemberProfile
            if (!msg.senderId) {
                console.log('⚠️  Sender ID not found in AdminMemberProfile collection:', senderId);
            }

            // Enhanced real-time message broadcasting
            if (io) {
                console.log('� Preparing real-time message broadcast...');
                
                // Get proper sender details for real-time broadcast
                let senderDetails = {
                    _id: messageData.senderId,
                    firstName: 'Unknown',
                    lastName: 'User',
                    flatNo: 'N/A',
                    userType: 'unknown'
                };

                try {
                    // Try to find sender details for better real-time display
                    const senderProfile = await AdminMemberProfile.findById(messageData.senderId);
                    if (senderProfile) {
                        senderDetails = {
                            _id: senderProfile._id,
                            firstName: senderProfile.firstName,
                            lastName: senderProfile.lastName,
                            email: senderProfile.email,
                            flatNo: senderProfile.flatNo,
                            userType: 'member'
                        };
                    } else {
                        // Try admin collection
                        const AdminSignup = require('../../models/auth.models/signup');
                        const adminProfile = await AdminSignup.findById(messageData.senderId);
                        if (adminProfile) {
                            senderDetails = {
                                _id: adminProfile._id,
                                firstName: adminProfile.firstName || 'Admin',
                                lastName: adminProfile.lastName || 'User',
                                email: adminProfile.email,
                                flatNo: 'N/A',
                                userType: 'admin'
                            };
                        }
                    }
                } catch (error) {
                    console.log('⚠️  Could not fetch sender details for real-time:', error.message);
                }

                const realTimeMessageData = {
                    id: msg._id,
                    complaintId: msg.complaintId,
                    senderId: senderDetails,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    createdAt: msg.createdAt,
                    messageType: 'text',
                    deliveryStatus: 'sent'
                };

                console.log(`🔌 Broadcasting message to room: ${complaintId}`);
                console.log(`👤 Sender: ${senderDetails.firstName} ${senderDetails.lastName} (${senderDetails.userType})`);
                
                // Emit to all users in the complaint room
                io.to(complaintId.toString()).emit('new-message', realTimeMessageData);
                
                // Also emit with the old event name for backward compatibility
                io.to(complaintId.toString()).emit('message_received', realTimeMessageData);
                
                console.log('✅ Real-time message broadcasted successfully');
            } else {
                console.log('⚠️  Socket.io not available for real-time messaging');
            }

            console.log('✅ Message sent successfully');

            return {
                success: true,
                message: 'Message sent successfully',
                data: {
                    id: msg._id,
                    complaintId: msg.complaintId,
                    senderId: msg.senderId || messageData.senderId,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    createdAt: msg.createdAt
                }
            };
        } catch (error) {
            console.log('❌ ERROR in sendMessage:', error.message);
            return {
                success: false,
                message: 'Error sending message',
                error: error.message
            };
        }
    }

    // Get all messages of a complaint
    static async getMessagesByComplaint(complaintId) {
        try {
            console.log('\n=== 📨 GET MESSAGES BY COMPLAINT SERVICE CALLED ===');
            console.log('📝 Complaint ID:', complaintId);

            if (!complaintId) {
                return {
                    success: false,
                    message: 'Complaint ID is required'
                };
            }

            // Check if complaint exists
            const complaint = await Complaints.findById(complaintId);
            if (!complaint) {
                return {
                    success: false,
                    message: 'Complaint not found'
                };
            }

            // Get messages without population first
            const messages = await Messages.find({ complaintId })
                .sort({ timestamp: 1 });

            console.log(`📊 Found ${messages.length} messages for complaint ${complaintId}`);

            // Manually populate sender details for each message
            const formattedMessages = await Promise.all(messages.map(async (msg) => {
                let senderInfo = {
                    _id: msg.senderId,
                    firstName: 'Unknown',
                    lastName: 'User',
                    email: null,
                    flatNo: null
                };

                try {
                    // Try to find sender in AdminMemberProfile first
                    const memberProfile = await AdminMemberProfile.findById(msg.senderId);
                    if (memberProfile) {
                        senderInfo = {
                            _id: memberProfile._id,
                            firstName: memberProfile.firstName,
                            lastName: memberProfile.lastName,
                            email: memberProfile.email,
                            flatNo: memberProfile.flatNo
                        };
                        console.log(`👤 Found member: ${memberProfile.firstName} ${memberProfile.lastName}`);
                    } else {
                        // If not found in AdminMemberProfile, try signup (admin) collection
                        const AdminSignup = require('../../models/auth.models/signup');
                        const adminProfile = await AdminSignup.findById(msg.senderId);
                        if (adminProfile) {
                            senderInfo = {
                                _id: adminProfile._id,
                                firstName: adminProfile.firstName || 'Admin',
                                lastName: adminProfile.lastName || 'User',
                                email: adminProfile.email,
                                flatNo: 'N/A'
                            };
                            console.log(`👨‍💼 Found admin: ${adminProfile.firstName || 'Admin'} ${adminProfile.lastName || 'User'}`);
                        } else {
                            console.log(`⚠️  Sender not found in any collection: ${msg.senderId}`);
                        }
                    }
                } catch (error) {
                    console.log(`❌ Error fetching sender details: ${error.message}`);
                }

                return {
                    id: msg._id,
                    complaintId: msg.complaintId,
                    senderId: senderInfo,
                    message: msg.message,
                    timestamp: msg.timestamp
                };
            }));

            console.log('✅ Found', messages.length, 'messages');

            return {
                success: true,
                message: `Found ${messages.length} messages`,
                data: formattedMessages
            };
        } catch (error) {
            console.log('❌ ERROR in getMessagesByComplaint:', error.message);
            return {
                success: false,
                message: 'Error fetching messages',
                error: error.message
            };
        }
    }

    // Get messages by sender
    static async getMessagesBySender(senderId) {
        try {
            console.log('\n=== 👤 GET MESSAGES BY SENDER SERVICE CALLED ===');
            console.log('👤 Sender ID:', senderId);

            if (!senderId) {
                return {
                    success: false,
                    message: 'Sender ID is required'
                };
            }

            const messages = await Messages.find({ senderId })
                .populate('complaintId', 'title status')
                .populate('senderId', 'firstName lastName email flatNo')
                .sort({ timestamp: -1 });

            const formattedMessages = messages.map(msg => ({
                id: msg._id,
                complaintId: msg.complaintId,
                senderId: msg.senderId,
                message: msg.message,
                timestamp: msg.timestamp
            }));

            console.log('✅ Found', messages.length, 'messages by sender');

            return {
                success: true,
                message: `Found ${messages.length} messages by sender`,
                data: formattedMessages
            };
        } catch (error) {
            console.log('❌ ERROR in getMessagesBySender:', error.message);
            return {
                success: false,
                message: 'Error fetching messages by sender',
                error: error.message
            };
        }
    }
}

module.exports = MessageService;
