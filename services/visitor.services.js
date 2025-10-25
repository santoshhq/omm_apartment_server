// visitor.services.js
const Visitor = require('../models/visitor');
const AdminMemberProfile = require('../models/auth.models/adminMemberProfile');

class VisitorService {
    // 🏠 Create Visitor Pre-Approval
    static async createVisitor(data) {
        try {
            const { memberUid, adminId, flatId, guestName, guestPhone, preApprovalType, inviteType, totalCount, vehicleNumber, cabCompanyName, deliveryCompanyName, serviceName, servicePersonName, servicePersonPhone, gateId, expiryHours } = data;

            // Get member to verify adminId
            const member = await AdminMemberProfile.findById(memberUid);
            if (!member) {
                throw new Error('Member not found');
            }

            console.log('👤 Member found:', member.name, 'Flat:', member.flatNo, 'Admin:', member.createdByAdminId);

            // Determine adminId: use provided or from member
            let adminIdToUse = adminId;
            if (!adminIdToUse) {
                if (!member.createdByAdminId) {
                    throw new Error('Admin ID not provided and member has no admin association');
                }
                adminIdToUse = member.createdByAdminId;
            }

            // If adminId was provided, verify it matches member's admin
            if (adminId && member.createdByAdminId && member.createdByAdminId.toString() !== adminId.toString()) {
                throw new Error('Admin ID mismatch with member\'s admin');
            }

            // Calculate expiry
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + (expiryHours || 1)); // Default 1 hour, max 8

            // Prepare visitor data based on preApprovalType
            const visitorData = {
                adminId: adminIdToUse,
                memberUid,
                flatId: flatId || member.flatNo,
                preApprovalType: preApprovalType || 'guest',
                gateId,
                expiry
            };

            // Add type-specific fields
            if (preApprovalType === 'guest') {
                visitorData.inviteType = inviteType || 'single';
                visitorData.totalCount = totalCount || 1;

                // Add guest details only for single invites
                if (inviteType === 'single') {
                    visitorData.guestName = guestName;
                    visitorData.guestPhone = guestPhone;
                }
            } else if (preApprovalType === 'cab') {
                visitorData.vehicleNumber = vehicleNumber;
                visitorData.cabCompanyName = cabCompanyName;
            } else if (preApprovalType === 'delivery') {
                visitorData.deliveryCompanyName = deliveryCompanyName;
            } else if (preApprovalType === 'tools') {
                visitorData.serviceName = serviceName;
                visitorData.servicePersonName = servicePersonName;
                visitorData.servicePersonPhone = servicePersonPhone;
            }

            const visitor = new Visitor(visitorData);
            await visitor.save();

            let message = 'Visitor pre-approval created successfully';
            if (preApprovalType === 'guest') {
                message = `${inviteType === 'single' ? 'Single' : 'Group'} guest pre-approval created successfully`;
            } else if (preApprovalType === 'cab') {
                message = 'Cab pre-approval created successfully';
            } else if (preApprovalType === 'delivery') {
                message = 'Delivery pre-approval created successfully';
            } else if (preApprovalType === 'tools') {
                message = 'Service/Tools pre-approval created successfully';
            }

            return {
                message,
                visitor
            };
        } catch (error) {
            throw new Error(`Failed to create visitor: ${error.message}`);
        }
    }

    // 📋 Get Visitors for Guard (filtered by adminId and gateId)
    static async getVisitorsForGuard(adminId, gateId) {
        try {
            const visitors = await Visitor.find({
                adminId,
                gateId: { $in: [gateId] }, // Check if guard's gateId is in the visitor's gateId array
                status: 'pending',
                expiry: { $gt: new Date() }
            }).populate('memberUid', 'name flatId')
              .sort({ createdAt: -1 });

            return visitors;
        } catch (error) {
            throw new Error(`Failed to fetch visitors for guard: ${error.message}`);
        }
    }

    // ✅ Approve Visitor by ID and OTP (Security Guard)
    static async approveVisitor(visitorId, otpCode) {
        try {
            const visitor = await Visitor.findOne({
                _id: visitorId,
                otpCode: otpCode,
                status: 'pending',
                expiry: { $gt: new Date() }
            });

            if (!visitor) {
                throw new Error('Invalid visitor ID, OTP code, or visitor already approved/expired');
            }

            // Increment approved count
            visitor.approvedCount += 1;

            // Check if fully approved
            if (visitor.approvedCount >= visitor.totalCount) {
                visitor.status = 'approved';
            }

            await visitor.save();

            const progressText = `${visitor.approvedCount}/${visitor.totalCount}`;
            const message = visitor.inviteType === 'single'
                ? 'Single visitor approved successfully'
                : `Group visitor approved (${progressText})`;

            return {
                message,
                visitor,
                progress: progressText,
                isFullyApproved: visitor.status === 'approved'
            };
        } catch (error) {
            throw new Error(`Failed to approve visitor: ${error.message}`);
        }
    }

    //  Get All Visitors for Admin
    static async getVisitorsForAdmin(adminId) {
        try {
            const visitors = await Visitor.find({ adminId })
                .populate('memberUid', 'name flatId')
                .sort({ createdAt: -1 });

            return visitors;
        } catch (error) {
            throw new Error(`Failed to fetch visitors for admin: ${error.message}`);
        }
    }

    // 🔄 Update Visitor Status (Admin only - approve pending requests)
    static async updateVisitorStatus(visitorId, status) {
        try {
            // Only allow approving pending requests
            if (status !== 'approved') {
                throw new Error('Only approval of pending requests is allowed');
            }

            const visitor = await Visitor.findOneAndUpdate(
                { _id: visitorId, status: 'pending' },
                { status },
                { new: true }
            );

            if (!visitor) {
                throw new Error('Pending visitor not found');
            }

            return {
                message: 'Visitor approved successfully',
                visitor
            };
        } catch (error) {
            throw new Error(`Failed to update visitor status: ${error.message}`);
        }
    }

    // 🗑️ Delete Visitor
    static async deleteVisitor(visitorId) {
        try {
            const visitor = await Visitor.findByIdAndDelete(visitorId);

            if (!visitor) {
                throw new Error('Visitor not found');
            }

            return {
                message: 'Visitor deleted successfully',
                visitor
            };
        } catch (error) {
            throw new Error(`Failed to delete visitor: ${error.message}`);
        }
    }
}

module.exports = VisitorService;