const BillsManagement = require('../../models/bills.managements/bills');
class BillsService {
    static async createBill({ billtitle, billdescription, billamount, upiId, duedate, createdByAdminId, category }) {
        try {
            console.log('\n=== 📋 CREATE BILL SERVICE CALLED ===');
            console.log('🔑 Admin ID:', createdByAdminId);
            console.log('📄 Bill Title:', billtitle);
            console.log('💰 Amount:', billamount);
            console.log('🏷️ Category:', category);
            const newBill = new BillsManagement({
                billtitle,
                billdescription,
                billamount,
                upiId,
                duedate,
                createdByAdminId,
                category
            });
            await newBill.save();
            console.log('✅ Bill created successfully:', newBill._id);
            return {
                status: true,
                message: 'Bill created successfully.',
                data: newBill
            };
        } catch (error) {
            console.log('❌ Error creating bill:', error.message);
            return { status: false, message: 'Error creating bill', error: error.message };
        }
    }
    static async getAllBills(adminId) {
        try {
            console.log('\n=== 📋 GET ALL BILLS SERVICE CALLED ===');
            console.log('� Admin ID:', adminId);
            console.log('�🔍 Filters: {}');
            const bills = await BillsManagement.find({ createdByAdminId: adminId }).populate('createdByAdminId', 'firstName lastName email phone address');
            console.log('📊 Total bills found for admin:', bills.length);
            return { status: true, data: bills };
        } catch (error) {
            console.log('❌ Error fetching bills:', error.message);
            return { status: false, message: 'Error fetching bills', error: error.message };
        }
    }
    static async getBillById(billId) {
        try {
            console.log('\n=== 📋 GET BILL BY ID SERVICE CALLED ===');
            console.log('🆔 Bill ID:', billId);
            const bill = await BillsManagement.findById(billId).populate('createdByAdminId', 'firstName lastName email phone address');
            if (!bill) {
                console.log('❌ Bill not found:', billId);
                return { status: false, message: 'Bill not found' };
            }
            console.log('✅ Bill fetched successfully');
            return { status: true, data: bill };
        } catch (error) {
            console.log('❌ Error fetching bill:', error.message);
            return { status: false, message: 'Error fetching bill', error: error.message };
        }
    }
    static async updateBill(billId, updateData) {
        try {
            console.log('\n=== 📋 UPDATE BILL SERVICE CALLED ===');
            console.log('🆔 Bill ID:', billId);
            console.log('🔄 Update Data:', updateData);
            const updatedBill = await BillsManagement.findByIdAndUpdate(billId, updateData, { new: true });
            if (!updatedBill) {
                console.log('❌ Bill not found for update:', billId);
                return { status: false, message: 'Bill not found' };
            }
            console.log('✅ Bill updated successfully');
            return { status: true, message: 'Bill updated successfully', data: updatedBill };
        } catch (error) {
            console.log('❌ Error updating bill:', error.message);
            return { status: false, message: 'Error updating bill', error: error.message };
        }
    }
    static async deleteBill(billId) {
        try {
            console.log('\n=== 📋 DELETE BILL SERVICE CALLED ===');
            console.log('🆔 Bill ID:', billId);
            const deletedBill = await BillsManagement.findByIdAndDelete(billId);
            if (!deletedBill) {
                console.log('❌ Bill not found for delete:', billId);
                return { status: false, message: 'Bill not found' };
            }
            console.log('✅ Bill deleted successfully');
            return { status: true, message: 'Bill deleted successfully' };
        } catch (error) {
            console.log('❌ Error deleting bill:', error.message);
            return { status: false, message: 'Error deleting bill', error: error.message };
        }
    }
}
module.exports = BillsService;