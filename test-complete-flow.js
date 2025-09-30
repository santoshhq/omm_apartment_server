const { createAdminProfile } = require('./services/adminProfiles.services');
const Signup = require('./models/auth.models/signup');

async function testCompleteFlow() {
    console.log('=== Complete Test Flow ===\n');

    try {
        // Step 1: Get all existing profiles
        console.log('Step 1: Getting all existing profiles...');
        const allProfiles = await createAdminProfile.getAllProfiles();
        console.log('Existing profiles:', JSON.stringify(allProfiles, null, 2));
        
        if (allProfiles.status && allProfiles.data.length > 0) {
            const firstProfile = allProfiles.data[0];
            const profileId = firstProfile._id;
            
            console.log(`\nStep 2: Testing update with real profile ID: ${profileId}`);
            
            // Test update
            const updateResult = await createAdminProfile.updateProfile(profileId, {
                firstName: 'Updated Name',
                phone: '+1999888777'
            });
            
            console.log('Update result:', JSON.stringify(updateResult, null, 2));
            
            // Get updated profile
            console.log('\nStep 3: Verifying update...');
            const updatedProfile = await createAdminProfile.getProfileById(profileId);
            console.log('Updated profile:', JSON.stringify(updatedProfile, null, 2));
            
        } else {
            console.log('No existing profiles found. Please create a profile first.');
            
            // Show how to get users for profile creation
            console.log('\nStep 2: Getting users for profile creation...');
            const users = await Signup.find({ isVerified: true });
            console.log('Verified users:', users.map(u => ({ id: u._id, email: u.email, isProfile: u.isProfile })));
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
    
    process.exit(0);
}

testCompleteFlow();