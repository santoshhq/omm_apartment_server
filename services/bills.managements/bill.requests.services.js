const BillRequest = require('../../models/bills.managements/billrequests');
class BillRequestService {
    static async createBillRequest({ userId, billId, transactionId, paymentapp, PaymentAppName }) {
        try {
            console.log('\n=== 📋 CREATE BILL REQUEST SERVICE CALLED ===');
            console.log('👤 User ID:', userId);
            console.log('💳 Bill ID:', billId);
            console.log('🔢 Transaction ID:', transactionId);
            console.log('💰 Payment App:', paymentapp);
            const newBillRequest = new BillRequest({
                userId,
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
    static async getAllBillRequests() {
        try {
            console.log('\n=== 📋 GET ALL BILL REQUESTS SERVICE CALLED ===');
            console.log('🔍 Filters: {}');
            const billRequests = await BillRequest.find()
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('billId', 'billtitle billdescription billamount duedate');
            console.log('📊 Total bill requests found:', billRequests.length);
            return { status: true, data: billRequests };
        } catch (error) {
            console.log('❌ Error fetching bill requests:', error.message);
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