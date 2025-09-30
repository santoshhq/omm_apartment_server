const { createAdminProfile } = require('./services/adminProfiles.services');

async function testUpdateProfile() {
    console.log('=== Testing Update Profile Function ===\n');

    // First, let's get a profile to update (you'll need to replace this with actual profile ID)
    const testProfileId = '67123abc456def789012345'; // Replace with actual ID

    try {
        // Test 1: Update single field
        console.log('Test 1: Update single field (firstName)');
        const result1 = await createAdminProfile.updateProfile(testProfileId, {
            firstName: 'Updated John'
        });
        console.log('Result:', JSON.stringify(result1, null, 2));
        console.log('---\n');

        // Test 2: Update multiple fields
        console.log('Test 2: Update multiple fields');
        const result2 = await createAdminProfile.updateProfile(testProfileId, {
            firstName: 'John Updated Again',
            phone: '+1999888777',
            apartment: 'B-202'
        });
        console.log('Result:', JSON.stringify(result2, null, 2));
        console.log('---\n');

        // Test 3: Test with invalid profile ID
        console.log('Test 3: Invalid profile ID');
        const result3 = await createAdminProfile.updateProfile('invalid123', {
            firstName: 'Test'
        });
        console.log('Result:', JSON.stringify(result3, null, 2));
        console.log('---\n');

        // Test 4: Empty update data (will be handled by controller)
        console.log('Test 4: Empty update data');
        const result4 = await createAdminProfile.updateProfile(testProfileId, {});
        console.log('Result:', JSON.stringify(result4, null, 2));
        console.log('---\n');

    } catch (error) {
        console.error('Test Error:', error);
    }

    process.exit(0);
}

// Run the test
testUpdateProfile();