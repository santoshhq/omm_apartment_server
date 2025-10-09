const housekeeping = require('../models/housekeeping');
class HousekeepingService {
    static async createHousekeeping(adminId, personimage, firstname, lastname, mobilenumber, age,assignfloors,gender) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            // Compress image if present
            let processedImage = personimage;
            if (personimage && personimage.startsWith('data:image/')) {
                const compressBase64Image = require('../middleware/compressBase64Image');
                try {
                    processedImage = await compressBase64Image(personimage, 100);
                } catch (err) {
                    console.log('Image compression failed:', err.message);
                }
            }
            const newStaff = new housekeeping({
                adminId,
                personimage: processedImage,
                firstname,
                lastname,
                mobilenumber,
                age,
                assignfloors: Array.isArray(assignfloors) ? assignfloors : [assignfloors],
                gender
            });
            await newStaff.save();
            return { status: true, message: 'Housekeeping staff created successfully', data: newStaff };
        } catch (error) {
            console.error('Error creating housekeeping staff:', error);
            return { status: false, message: 'Error creating housekeeping staff' };
        }
    }
    static async getAllHousekeepingbyadminid(adminId) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            const staffs = await housekeeping.find({ adminId }).populate('adminId', 'firstName lastName email phone address');
            return { status: true, data: staffs };
        }
        catch (error) {
            console.error('Error fetching housekeeping staff:', error);
            return { status: false, message: 'Error fetching housekeeping staff' };
        }
    }
    static async getHousekeepingById(adminId, staffId) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            const staff = await housekeeping.findOne({ _id: staffId, adminId }).populate('adminId', 'firstName lastName email phone address');
            if (!staff) {
                return { status: false, message: 'Housekeeping staff not found' };
            }
            return { status: true, data: staff };
        }
        catch (error) {
            console.error('Error fetching housekeeping staff by ID:', error);
            return { status: false, message: 'Error fetching housekeeping staff by ID' };
        }
    }
    static async updateHousekeeping(adminId, staffId, updateData) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            // Check if housekeeping staff exists
            const existingStaff = await housekeeping.findOne({ _id: staffId, adminId });    
            if (!existingStaff) {
                return { status: false, message: 'Housekeeping staff not found' };
            }
            // If personimage is being updated and is a base64 string, compress it
            if (updateData.personimage && updateData.personimage.startsWith('data:image/')) {
                const compressBase64Image = require('../middleware/compressBase64Image');
                try {
                    updateData.personimage = await compressBase64Image(updateData.personimage, 100);    
                } catch (err) {
                    console.log('Image compression failed:', err.message);
                }
            }
            if (updateData.assignfloors && !Array.isArray(updateData.assignfloors)) {
                updateData.assignfloors = [updateData.assignfloors];
            }
const updatedStaff = await housekeeping.findOneAndUpdate(
  { _id: staffId, adminId }, // ✅ ensure belongs to the same admin
  { $set: updateData },
  { new: true, runValidators: true } // ✅ never upsert implicitly
);
            return { status: true, message: 'Housekeeping staff updated successfully', data: updatedStaff };
        } catch (error) {
            console.error('Error updating housekeeping staff:', error);
            return { status: false, message: 'Error updating housekeeping staff' };
        }
    }
    static async deleteHousekeeping(adminId, staffId) {
        try {   
            if (!adminId) return { status: false, message: 'adminId is required' };
            const existingStaff = await housekeeping.findOne({ _id: staffId, adminId });
            if (!existingStaff) {
                return { status: false, message: 'Housekeeping staff not found' };
            }
            await housekeeping.deleteOne({ _id: staffId, adminId });
            return { status: true, message: 'Housekeeping staff deleted successfully' };
        }
        catch (error) {
            console.error('Error deleting housekeeping staff:', error);
            return { status: false, message: 'Error deleting housekeeping staff' };
        }
    }
}

module.exports = HousekeepingService;