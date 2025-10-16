const BillRequest = require('../../models/bills.managements/billrequests');
const AdminMemberCredentials = require('../../models/auth.models/adminMemberCredentials');
const AdminMemberProfile = require('../../models/auth.models/adminMemberProfile');
class BillRequestService {
    static async createBillRequest({ userId, billId, transactionId, paymentapp, PaymentAppName }) {
        try {
            console.log('\n=== 📋 CREATE BILL REQUEST SERVICE CALLED ===');
            console.log('👤 User ID (string):', userId);
            console.log('💳 Bill ID:', billId);
            console.log('🔢 Transaction ID:', transactionId);
            console.log('💰 Payment App:', paymentapp);

            // Convert string userId to ObjectId by finding the member profile
            let memberProfileId = userId;

            // Check if userId is a string (not ObjectId)
            if (typeof userId === 'string' && !userId.match(/^[0-9a-fA-F]{24}$/)) {
                console.log('🔄 Converting string userId to ObjectId...');

                // Find member credentials by userId string
                const credentials = await AdminMemberCredentials.findOne({
                    userId: userId,
                    isActive: true
                });

                if (!credentials) {
                    console.log('❌ Member credentials not found for userId:', userId);
                    return {
                        status: false,
                        message: 'Member not found or inactive'
                    };
                }

                if (!credentials.memberProfileId) {
                    console.log('❌ Member profile not linked for userId:', userId);
                    return {
                        status: false,
                        message: 'Member profile not found'
                    };
                }

                memberProfileId = credentials.memberProfileId;
                console.log('✅ Converted to memberProfileId:', memberProfileId);
            }

            const newBillRequest = new BillRequest({
                userId: memberProfileId, // Use the ObjectId
                billId,
                transactionId,
                paymentapp,
                PaymentAppName
            });

            await newBillRequest.save();

            // Populate user and bill details for the response
            await newBillRequest.populate('userId', 'firstName lastName flatNo floor mobile');
            await newBillRequest.populate('billId', 'billtitle billdescription billamount duedate');

            console.log('✅ Bill request created successfully:', newBillRequest._id);
            return {
                status: true,
                message: 'Bill request created successfully.',
                data: newBillRequest
            };
        } catch (error) {
            console.log('❌ Error creating bill request:', error.message);
            return { status: false, message: 'Error creating bill request', error: error.message };
        }
    }
    static async getAllBillRequests(adminId) {
        try {
            console.log('\n=== 📋 GET ALL BILL REQUESTS SERVICE CALLED ===');
            console.log('👨‍💼 Admin ID:', adminId);

            let filter = {};
            let billRequests;

            if (adminId) {
                // Find all member profiles created by this admin
                const memberProfiles = await AdminMemberProfile.find({
                    createdByAdminId: adminId
                }).select('_id');

                const memberProfileIds = memberProfiles.map(profile => profile._id);

                console.log('� Found', memberProfileIds.length, 'member profiles for admin');

                if (memberProfileIds.length === 0) {
                    console.log('📊 No members found for this admin');
                    return { status: true, data: [], message: 'No bill requests found for this admin' };
                }

                filter = { userId: { $in: memberProfileIds } };
                console.log('🔍 Filtering bill requests by member profiles:', memberProfileIds);
            } else {
                console.log('🔍 No admin filter - getting all bill requests');
            }

            billRequests = await BillRequest.find(filter)
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('billId', 'billtitle billdescription billamount duedate')
                .sort({ createdAt: -1 });

            console.log('📊 Total bill requests found:', billRequests.length);
            return { status: true, data: billRequests };
        } catch (error) {
            console.log('❌ Error fetching bill requests:', error.message);
            return { status: false, message: 'Error fetching bill requests', error: error.message };
        }
    }

    static async getBillRequestsByAdmin(adminId) {
        try {
            console.log('\n=== 📋 GET BILL REQUESTS BY ADMIN SERVICE CALLED ===');
            console.log('👨‍💼 Admin ID:', adminId);

            // Validate adminId format
            const mongoose = require('mongoose');
            if (!mongoose.Types.ObjectId.isValid(adminId)) {
                return { status: false, message: 'Invalid admin ID format' };
            }

            // Find bill requests where the user was created by this admin
            const billRequests = await BillRequest.find()
                .populate({
                    path: 'userId',
                    match: { createdByAdminId: adminId },
                    select: 'firstName lastName flatNo floor mobile createdByAdminId'
                })
                .populate('billId', 'billtitle billdescription billamount duedate')
                .sort({ createdAt: -1 });

            // Filter out requests where userId is null (user not created by this admin)
            const filteredRequests = billRequests.filter(request => request.userId !== null);

            console.log(`📊 Found ${filteredRequests.length} bill requests for admin ${adminId}`);

            return {
                status: true,
                message: `Found ${filteredRequests.length} bill requests for this admin`,
                data: filteredRequests
            };
        } catch (error) {
            console.log('❌ Error fetching bill requests by admin:', error.message);
            return { status: false, message: 'Error fetching bill requests', error: error.message };
        }
    }

    static async getBillRequestsByBillId(billId) {
        try {
            console.log('\n=== 📋 GET BILL REQUESTS BY BILL ID SERVICE CALLED ===');
            console.log('💳 Bill ID:', billId);
            console.log('🔍 Filters: {}');
            const billRequests = await BillRequest.find({ billId })
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('billId', 'billtitle billdescription billamount duedate');
            console.log('📊 Total bill requests found for bill:', billRequests.length);
            return { status: true, data: billRequests };
        } catch (error) {
            console.log('❌ Error fetching bill requests by bill ID:', error.message);
            return { status: false, message: 'Error fetching bill requests', error: error.message };
        }
    }
    static async getBillRequestById(requestId) {
        try {
            console.log('\n=== 📋 GET BILL REQUEST BY ID SERVICE CALLED ===');
            console.log('🆔 Request ID:', requestId);
            const billRequest = await BillRequest.findById(requestId)
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('billId', 'billtitle billdescription billamount duedate');
            if (!billRequest) {
                console.log('❌ Bill request not found:', requestId);
                return { status: false, message: 'Bill request not found' };
            }
            console.log('✅ Bill request fetched successfully');
            return { status: true, data: billRequest };
        } catch (error) {
            console.log('❌ Error fetching bill request:', error.message);
            return { status: false, message: 'Error fetching bill request', error: error.message };
        }
    }
    static async updateBillRequest(requestId, updateData) {
        try {
            console.log('\n=== 📋 UPDATE BILL REQUEST SERVICE CALLED ===');
            console.log('🆔 Request ID:', requestId);
            console.log('🔄 Update Data:', updateData);
            const updatedBillRequest = await BillRequest
                .findByIdAndUpdate(requestId, updateData, { new: true })
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('billId', 'billtitle billdescription billamount duedate');
            if (!updatedBillRequest) {
                console.log('❌ Bill request not found for update:', requestId);
                return { status: false, message: 'Bill request not found' };
            }
            console.log('✅ Bill request updated successfully');
            return { status: true, message: 'Bill request updated successfully', data: updatedBillRequest };
        } catch (error) {
            console.log('❌ Error updating bill request:', error.message);
            return { status: false, message: 'Error updating bill request', error: error.message };
        }
    }
    static async deleteBillRequest(requestId) {
        try {
            console.log('\n=== 📋 DELETE BILL REQUEST SERVICE CALLED ===');
            console.log('🆔 Request ID:', requestId);
            const deletedBillRequest = await BillRequest
                .findByIdAndDelete(requestId)
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('billId', 'billtitle billdescription billamount duedate');
            if (!deletedBillRequest) {
                console.log('❌ Bill request not found for delete:', requestId);
                return { status: false, message: 'Bill request not found' };
            }
            console.log('✅ Bill request deleted successfully');
            return { status: true, message: 'Bill request deleted successfully' };
        } catch (error) {
            console.log('❌ Error deleting bill request:', error.message);
            return { status: false, message: 'Error deleting bill request', error: error.message };
        }
    }
}
module.exports = BillRequestService;