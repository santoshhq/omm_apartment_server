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

            // Emit real-time message if Socket.io is available
            if (io) {
                console.log('🔍 Debug - msg.senderId type:', typeof msg.senderId);
                console.log('🔍 Debug - msg.senderId value:', msg.senderId);
                
                // Check if senderId is populated (has firstName property) or just an ObjectId
                const isPopulated = msg.senderId && msg.senderId.firstName;
                
                const realTimeData = {
                    id: msg._id,
                    complaintId: msg.complaintId,
                    senderId: isPopulated ? {
                        _id: msg.senderId._id,
                        firstName: msg.senderId.firstName,
                        lastName: msg.senderId.lastName,
                        flatNo: msg.senderId.flatNo
                    } : {
                        _id: msg.senderId || messageData.senderId,
                        firstName: 'Unknown',
                        lastName: 'User',
                        flatNo: 'N/A'
                    },
                    message: msg.message,
                    timestamp: msg.timestamp,
                    createdAt: msg.createdAt
                };

                console.log('🔌 Emitting real-time message to room:', complaintId);
                io.to(complaintId.toString()).emit('message_received', realTimeData);
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
                        // If not found in AdminMemberProfile, try adminSignup
                        const AdminSignup = require('../../models/auth.models/adminSignup');
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
