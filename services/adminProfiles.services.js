const { adminuser } = require('../models/adminProfiles');
const Signup = require('../models/auth.models/signup');

class createAdminProfile {
    static async createProfile(userId, firstName, lastName, email, apartment, phone, address, imagePath) {
        try {
            // Check if user exists and is verified
            const user = await Signup.findById(userId);
            if (!user) {
                return { status: false, message: 'User not found' };
            }
            if (!user.isVerified) {
                return { status: false, message: 'User must be verified before creating profile' };
            }

            // Check if profile already exists
            const existingProfile = await adminuser.findOne({ userId });
            if (existingProfile) {
                return { status: false, message: 'Admin profile already exists for this user' };
            }

            // Create new admin profile
            const newProfile = new adminuser({
                userId,
                firstName,  
                lastName,
                email,
                apartment,
                phone,
                address,
                imagePath,
            });
            await newProfile.save();

            // Update user's isProfile status to true
            await Signup.findByIdAndUpdate(userId, { isProfile: true });

            return { 
                status: true, 
                message: 'Admin profile created successfully. User profile status updated.', 
                data: newProfile 
            };
        } catch (error) {
            return { status: false, message: 'Error creating admin profile', error: error.message };
        }       
    }
    static async getAllProfiles() {
        try {
            const profiles = await adminuser.find().populate('membersId', 'firstName lastName email phone address');
            return { status: true, data: profiles };
        } catch (error) {
            return { status: false, message: 'Error fetching admin profiles', error: error.message };
        }
    }
    static async getProfileById(profileId) {
        try {
            const profile = await adminuser.findById(profileId).populate('membersId', 'firstName lastName email phone address');
            if (!profile) {
                return { status: false, message: 'Admin profile not found' };
            }
            return { status: true, data: profile };
        } catch (error) {
            return { status: false, message: 'Error fetching admin profile', error: error.message };
        }
    }

    static async updateProfile(profileId, updateData) {
        try {
            // Check if profile exists
            const existingProfile = await adminuser.findById(profileId);
            if (!existingProfile) {
                return { status: false, message: 'Admin profile not found' };
            }

            // Check if email is being updated and already exists in another profile
            if (updateData.email && updateData.email !== existingProfile.email) {
                const emailExists = await adminuser.findOne({ 
                    email: updateData.email, 
                    _id: { $ne: profileId } // Exclude current profile
                });
                if (emailExists) {
                    return { status: false, message: 'Email already exists in another profile' };
                }
            }

            // Update the profile
            const updatedProfile = await adminuser.findByIdAndUpdate(
                profileId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('membersId', 'firstName lastName email phone address');

            return { 
                status: true, 
                message: 'Admin profile updated successfully', 
                data: updatedProfile 
            };

        } catch (error) {
            return { 
                status: false, 
                message: 'Error updating admin profile', 
                error: error.message 
            };
        }
    }

    static async deleteProfile(profileId) {
        try {
            const deletedProfile = await adminuser.findByIdAndDelete(profileId);
            if (!deletedProfile) {
                return { status: false, message: 'Admin profile not found' };
            }

            // Update user's isProfile status back to false when profile is deleted
            await Signup.findByIdAndUpdate(deletedProfile.userId, { isProfile: false });

            return { 
                status: true, 
                message: 'Admin profile deleted successfully and user profile status updated',
                data: { deletedId: profileId, deletedEmail: deletedProfile.email }
            };
        } catch (error) {
            return { 
                status: false, 
                message: 'Error deleting admin profile', 
                error: error.message 
            };
        }
    }

    static async getUserProfileDetails(userId) {
        try {
            // Find user profile by userId
            const userProfile = await adminuser.findOne({ userId }).populate('userId', 'email isVerified isProfile createdAt');
            
            if (!userProfile) {
                return { status: false, message: 'User profile not found' };
            }

            // Extract and format user details
            const userDetails = {
                userId: userProfile.userId._id,
                email: userProfile.email,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                apartment: userProfile.apartment,
                phone: userProfile.phone,
                address: userProfile.address,
                imagePath: userProfile.imagePath || null,
                isVerified: userProfile.userId.isVerified,
                isProfile: userProfile.userId.isProfile,
                profileCreatedAt: userProfile.createdAt,
                accountCreatedAt: userProfile.userId.createdAt,
                membersCount: userProfile.membersId.length
            };

            return { 
                status: true, 
                message: 'User profile details retrieved successfully', 
                data: userDetails 
            };

        } catch (error) {
            return { 
                status: false, 
                message: 'Error fetching user profile details', 
                error: error.message 
            };
        }
    }

    static async getUserProfileByEmail(email) {
        try {
            // Find user profile by email
            const userProfile = await adminuser.findOne({ email }).populate('userId', 'email isVerified isProfile createdAt');
            
            if (!userProfile) {
                return { status: false, message: 'User profile not found' };
            }

            // Extract and format user details
            const userDetails = {
                userId: userProfile.userId._id,
                email: userProfile.email,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                apartment: userProfile.apartment,
                phone: userProfile.phone,
                address: userProfile.address,
                imagePath: userProfile.imagePath || null,
                isVerified: userProfile.userId.isVerified,
                isProfile: userProfile.userId.isProfile,
                profileCreatedAt: userProfile.createdAt,
                accountCreatedAt: userProfile.userId.createdAt,
                membersCount: userProfile.membersId.length
            };

            return { 
                status: true, 
                message: 'User profile details retrieved successfully', 
                data: userDetails 
            };

        } catch (error) {
            return { 
                status: false, 
                message: 'Error fetching user profile details', 
                error: error.message 
            };
        }
    }   
}
module.exports = { createAdminProfile };