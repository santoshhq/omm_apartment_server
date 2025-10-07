const securityGuard = require('../models/securityguards');
class SecurityGuardService {
    static async createGuard(adminId, guardimage, firstname, lastname, mobilenumber, age, assign, gender) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            // Check if guard with the same mobile number already exists for this admin
            const existingGuard = await securityGuard.findOne({ adminId, mobilenumber });
            if (existingGuard) {
                return { status: false, message: 'Security guard with this mobile number already exists for this admin' };
            }
            // Compress image if present
            let processedImage = guardimage;
            if (guardimage && guardimage.startsWith('data:image/')) {
                const compressBase64Image = require('../middleware/compressBase64Image');
                try {
                    processedImage = await compressBase64Image(guardimage, 100);
                } catch (err) {
                    console.log('Image compression failed:', err.message);
                }
            }
            const newGuard = new securityGuard({
                adminId,
                guardimage: processedImage,
                firstname,
                lastname,
                mobilenumber,
                age,
                assigngates: assign,
                gender
            });
            await newGuard.save();
            return { status: true, message: 'Security guard created successfully', data: newGuard };
        } catch (error) {
            console.error('Error creating security guard:', error);
            return { status: false, message: 'Error creating security guard' };
        }
    }
    static async getAllGuardsbyadminid(adminId) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            const guards = await securityGuard.find({ adminId }).populate('adminId', 'firstName lastName email phone address');
            return { status: true, data: guards };
        } catch (error) {
            console.error('Error fetching security guards:', error);
            return { status: false, message: 'Error fetching security guards' };
        }
    }
    static async getGuardById(adminId, guardId) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            const guard = await securityGuard.findOne({ _id: guardId, adminId }).populate('adminId', 'firstName lastName email phone address');
            if (!guard) {
                return { status: false, message: 'Security guard not found' };
            }
            return { status: true, data: guard };
        } catch (error) {
            console.error('Error fetching security guard by ID:', error);
            return { status: false, message: 'Error fetching security guard by ID' };
        }
    }
    static async updateGuard(adminId, guardId, updateData) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            // Check if guard exists for this admin
            const existingGuard = await securityGuard.findOne({ _id: guardId, adminId });
            if (!existingGuard) {
                return { status: false, message: 'Security guard not found' };
            }
            // If mobile number is being updated, check for uniqueness
            if (updateData.mobilenumber && updateData.mobilenumber !== existingGuard.mobilenumber) {
                const mobileExists = await securityGuard.findOne({ mobilenumber: updateData.mobilenumber, adminId });
                if (mobileExists) {
                    return { status: false, message: 'Another security guard with this mobile number already exists for this admin' };
                }
            }
            // Compress image if present
            if (updateData.guardimage && updateData.guardimage.startsWith('data:image/')) {
                const compressBase64Image = require('../middleware/compressBase64Image');
                try {
                    updateData.guardimage = await compressBase64Image(updateData.guardimage, 100);
                } catch (err) {
                    console.log('Image compression failed:', err.message);
                }
            }
            // Update guard details
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    existingGuard[key] = updateData[key];
                }
            });
            await existingGuard.save();
            return { status: true, message: 'Security guard updated successfully', data: existingGuard };
        } catch (error) {
            console.error('Error updating security guard:', error);
            return { status: false, message: 'Error updating security guard' };
        }
    }
    static async deleteGuard(adminId, guardId) {
        try {
            if (!adminId) return { status: false, message: 'adminId is required' };
            const deletedGuard = await securityGuard.findOneAndDelete({ _id: guardId, adminId });
            if (!deletedGuard) {
                return { status: false, message: 'Security guard not found' };
            }
            return { status: true, message: 'Security guard deleted successfully' };
        } catch (error) {
            console.error('Error deleting security guard:', error);
            return { status: false, message: 'Error deleting security guard' };
        }
    }

}
module.exports = { SecurityGuardService };
