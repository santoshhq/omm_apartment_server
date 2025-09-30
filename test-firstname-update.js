const axios = require('axios');

async function updateFirstName() {
    try {
        console.log('=== Performing firstName Update Operation ===');
        console.log('Profile ID: 68d66709d84448fff5dc3ab8');
        console.log('Current firstName: santoshgudi');
        console.log('New firstName: Santosh Kumar');
        console.log('');

        const profileId = '68d66709d84448fff5dc3ab8';
        const updateData = {
            firstName: 'Santosh Kumar'
        };

        console.log('Sending PUT request...');
        const response = await axios.put(`http://localhost:8080/api/admin-profiles/${profileId}`, updateData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Update Successful!');
        console.log('Status Code:', response.status);
        console.log('Response Data:');
        console.log(JSON.stringify(response.data, null, 2));

        // Verify the update by getting the profile
        console.log('\n=== Verifying Update ===');
        const verifyResponse = await axios.get(`http://localhost:8080/api/admin-profiles/${profileId}`);
        console.log('✅ Verification Successful!');
        console.log('Updated Profile Data:');
        console.log(JSON.stringify(verifyResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error during update:');
        if (error.response) {
            console.error('Status Code:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }

    process.exit(0);
}

updateFirstName();