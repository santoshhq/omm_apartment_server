// Test script for Admin Profile CRUD operations
console.log('=== Admin Profile CRUD Test Guide ===\n');

console.log('🚀 Server should be running on http://localhost:8080\n');

console.log('📋 Complete Testing Steps:\n');

console.log('1️⃣ GET ALL PROFILES:');
console.log('   Method: GET');
console.log('   URL: http://localhost:8080/api/admin-profiles');
console.log('   Purpose: Get real profile IDs\n');

console.log('2️⃣ CREATE NEW PROFILE (if needed):');
console.log('   Method: POST');
console.log('   URL: http://localhost:8080/api/admin-profiles');
console.log('   Body: {');
console.log('     "userId": "VERIFIED_USER_ID_HERE",');
console.log('     "firstName": "Test User",');
console.log('     "lastName": "Test Last",');
console.log('     "email": "test@example.com",');
console.log('     "apartment": "A-101",');
console.log('     "phone": "+1234567890",');
console.log('     "address": "123 Test Street"');
console.log('   }\n');

console.log('3️⃣ UPDATE PROFILE:');
console.log('   Method: PUT');
console.log('   URL: http://localhost:8080/api/admin-profiles/REAL_PROFILE_ID');
console.log('   Body: {');
console.log('     "firstName": "Updated Name",');
console.log('     "phone": "+1999888777"');
console.log('   }\n');

console.log('4️⃣ GET SINGLE PROFILE:');
console.log('   Method: GET'); 
console.log('   URL: http://localhost:8080/api/admin-profiles/REAL_PROFILE_ID\n');

console.log('5️⃣ GET USER DETAILS BY USER ID:');
console.log('   Method: GET');
console.log('   URL: http://localhost:8080/api/admin-profiles/user/USER_ID\n');

console.log('6️⃣ GET USER DETAILS BY EMAIL:');
console.log('   Method: GET');
console.log('   URL: http://localhost:8080/api/admin-profiles/email/user@example.com\n');

console.log('7️⃣ DELETE PROFILE:');
console.log('   Method: DELETE');
console.log('   URL: http://localhost:8080/api/admin-profiles/REAL_PROFILE_ID\n');

console.log('⚠️  IMPORTANT NOTES:');
console.log('   - Replace REAL_PROFILE_ID with actual ObjectId from Step 1');
console.log('   - Replace USER_ID with actual user ID from signup collection');
console.log('   - Replace email with actual email from profiles');
console.log('   - ObjectIds are 24 characters long (like: 66f4a1b2c3d4e5f678901234)\n');

console.log('✅ Success Indicators:');
console.log('   - Status code 200/201 for success');
console.log('   - Status code 400/404 for errors');
console.log('   - JSON response with status: true/false\n');

console.log('🧪 Quick PowerShell Test:');
console.log('   # Get all profiles');
console.log("   Invoke-WebRequest -Uri 'http://localhost:8080/api/admin-profiles' -Method GET");
console.log('   # Update profile (replace ID)');
console.log('   $body = @{firstName="Updated"} | ConvertTo-Json');
console.log("   Invoke-WebRequest -Uri 'http://localhost:8080/api/admin-profiles/YOUR_ID' -Method PUT -ContentType 'application/json' -Body $body");

console.log('\n🎯 Start testing with Step 1 to get real profile IDs!');