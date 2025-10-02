const Complaints = require('../../models/complaintssection/complaints');

class ComplaintService {

    // Create a new complaint
    static async createComplaint({ userId, createdByadmin, title, description }) {
        try {
            console.log('\n=== 📝 CREATE COMPLAINT SERVICE CALLED ===');
            console.log('👤 User ID:', userId);
            console.log('🔑 Admin ID:', createdByadmin);
            console.log('📋 Title:', title);

            // Validate required fields
            if (!userId || !createdByadmin || !title || !description) {
                return {
                    success: false,
                    message: 'Missing required fields: userId, createdByadmin, title, description'
                };
            }

            // Check if user exists and is under this admin
            // You might want to add this validation based on your AdminMemberProfile model

            const complaintData = {
                userId,
                createdByadmin,
                title: title.trim(),
                description: description.trim()
            };

            const complaint = await Complaints.create(complaintData);
            await complaint.populate('userId', 'firstName flatNo email mobile');
            await complaint.populate('createdByadmin', 'firstName lastName email');

            console.log('✅ Complaint created successfully');

            return {
                success: true,
                message: 'Complaint created successfully',
                data: {
                    id: complaint._id,
                    title: complaint.title,
                    description: complaint.description,
                    status: complaint.status,
                    userId: complaint.userId,
                    createdByadmin: complaint.createdByadmin,
                    createdAt: complaint.createdAt
                }
            };
        } catch (error) {
            console.log('❌ ERROR in createComplaint:', error.message);
            return {
                success: false,
                message: 'Error creating complaint',
                error: error.message
            };
        }
    }

    // Get all complaints of a particular admin
    static async getComplaintsByAdmin(adminId, filters = {}) {
        try {
            console.log('\n=== 📋 GET COMPLAINTS BY ADMIN SERVICE CALLED ===');
            console.log('🔑 Admin ID:', adminId);

            if (!adminId) {
                return {
                    success: false,
                    message: 'Admin ID is required'
                };
            }

            let query = { createdByadmin: adminId };

            // Apply filters
            if (filters.status) {
                query.status = filters.status;
            }

            const complaints = await Complaints.find(query)
                .populate('userId', 'firstName flatNo email mobile')
                .populate('createdByadmin', 'firstName lastName email')
                .sort({ createdAt: -1 });

            const formattedComplaints = complaints.map(complaint => ({
                id: complaint._id,
                title: complaint.title,
                description: complaint.description,
                status: complaint.status,
                userId: complaint.userId,
                createdByadmin: complaint.createdByadmin,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt
            }));

            console.log('✅ Found', complaints.length, 'complaints');

            return {
                success: true,
                message: `Found ${complaints.length} complaints`,
                data: formattedComplaints
            };
        } catch (error) {
            console.log('❌ ERROR in getComplaintsByAdmin:', error.message);
            return {
                success: false,
                message: 'Error fetching complaints',
                error: error.message
            };
        }
    }

    // Get single complaint details
    static async getComplaintById(complaintId) {
        try {
            console.log('\n=== 🔍 GET COMPLAINT BY ID SERVICE CALLED ===');
            console.log('📝 Complaint ID:', complaintId);

            if (!complaintId) {
                return {
                    success: false,
                    message: 'Complaint ID is required'
                };
            }

            const complaint = await Complaints.findById(complaintId)
                .populate('userId', 'firstName flatNo email mobile')
                .populate('createdByadmin', 'firstName lastName email');

            if (!complaint) {
                return {
                    success: false,
                    message: 'Complaint not found'
                };
            }

            const formattedComplaint = {
                id: complaint._id,
                title: complaint.title,
                description: complaint.description,
                status: complaint.status,
                userId: complaint.userId,
                createdByadmin: complaint.createdByadmin,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt
            };

            console.log('✅ Complaint found successfully');

            return {
                success: true,
                message: 'Complaint found',
                data: formattedComplaint
            };
        } catch (error) {
            console.log('❌ ERROR in getComplaintById:', error.message);
            return {
                success: false,
                message: 'Error fetching complaint',
                error: error.message
            };
        }
    }

    // Update complaint status
    static async updateComplaintStatus(complaintId, status, adminId) {
        try {
            console.log('\n=== ✏️ UPDATE COMPLAINT STATUS SERVICE CALLED ===');
            console.log('📝 Complaint ID:', complaintId);
            console.log('🔄 New Status:', status);
            console.log('🔑 Admin ID:', adminId);

            if (!complaintId || !status) {
                return {
                    success: false,
                    message: 'Complaint ID and status are required'
                };
            }

            if (!['pending', 'solved', 'unsolved'].includes(status)) {
                return {
                    success: false,
                    message: 'Status must be pending, solved, or unsolved'
                };
            }

            // Verify complaint belongs to this admin
            const complaint = await Complaints.findOne({
                _id: complaintId,
                createdByadmin: adminId
            });

            if (!complaint) {
                return {
                    success: false,
                    message: 'Complaint not found or access denied'
                };
            }

            const updatedComplaint = await Complaints.findByIdAndUpdate(
                complaintId,
                { status },
                { new: true, runValidators: true }
            ).populate('userId', 'firstName flatNo email mobile')
             .populate('createdByadmin', 'firstName lastName email');

            console.log('✅ Complaint status updated successfully');

            return {
                success: true,
                message: 'Complaint status updated successfully',
                data: {
                    id: updatedComplaint._id,
                    title: updatedComplaint.title,
                    status: updatedComplaint.status,
                    userId: updatedComplaint.userId,
                    createdByadmin: updatedComplaint.createdByadmin,
                    updatedAt: updatedComplaint.updatedAt
                }
            };
        } catch (error) {
            console.log('❌ ERROR in updateComplaintStatus:', error.message);
            return {
                success: false,
                message: 'Error updating complaint status',
                error: error.message
            };
        }
    }

    // Get complaints by status
    static async getComplaintsByStatus(adminId, status) {
        try {
            console.log('\n=== 🏷️ GET COMPLAINTS BY STATUS SERVICE CALLED ===');
            console.log('🔑 Admin ID:', adminId);
            console.log('🔄 Status:', status);

            if (!['pending', 'solved', 'unsolved'].includes(status)) {
                return {
                    success: false,
                    message: 'Status must be pending, solved, or unsolved'
                };
            }

            const complaints = await Complaints.find({
                createdByadmin: adminId,
                status: status
            })
                .populate('userId', 'firstName flatNo email mobile')
                .populate('createdByadmin', 'firstName lastName email')
                .sort({ createdAt: -1 });

            const formattedComplaints = complaints.map(complaint => ({
                id: complaint._id,
                title: complaint.title,
                description: complaint.description,
                status: complaint.status,
                userId: complaint.userId,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt
            }));

            console.log('✅ Found', complaints.length, status, 'complaints');

            return {
                success: true,
                message: `Found ${complaints.length} ${status} complaints`,
                data: formattedComplaints
            };
        } catch (error) {
            console.log('❌ ERROR in getComplaintsByStatus:', error.message);
            return {
                success: false,
                message: 'Error fetching complaints by status',
                error: error.message
            };
        }
    }
}

module.exports = ComplaintService;
