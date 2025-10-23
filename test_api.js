const axios = require('axios');

async function testAdminComplaintsAPI() {
  try {
    const adminId = '68ee106222db0dbd475297a4'; // The admin ID that has complaints
    const baseURL = 'http://localhost:8080'; // Server runs on port 8080
    const apiPrefix = '/api';

    console.log(`Testing GET ${baseURL}${apiPrefix}/complaints/admin/${adminId}`);

    const response = await axios.get(`${baseURL}${apiPrefix}/complaints/admin/${adminId}`);

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error calling API:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Response Headers:', error.response.headers);
    }
  }
}

testAdminComplaintsAPI();