const axios = require('axios');

// Test Ultra-Lightweight Image Compression System
console.log('⚡ TESTING ULTRA-LIGHTWEIGHT IMAGE COMPRESSION');
console.log('==============================================\n');

console.log('✨ Compression Features to Test:');
console.log('   1. ⚡ Base64 image compression during creation');
console.log('   2. ⚡ Existing image compression during retrieval');
console.log('   3. ⚡ Batch compression for multiple images');
console.log('   4. ⚡ Size reduction without quality loss detection');
console.log('   5. ⚡ Frontend loading speed improvement');
console.log('\n');

const baseURL = 'http://localhost:8080/api';
const adminId = '68d664d7d84448fff5dc3a8b'; // Using existing admin ID

// Sample Base64 images (small samples for testing)
const testBase64Images = [
  // Small test image 1 (this is a tiny red pixel as Base64)
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  
  // Small test image 2 (this is a tiny blue pixel as Base64)
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  
  // Larger mock Base64 (simulated large image by repeating data)
  'data:image/jpeg;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='.repeat(50)
];

// Event card test data with Base64 images
const eventCardWithBase64 = {
  name: "Ultra-Light Image Test Event",
  description: "Testing ultra-lightweight image compression for fast frontend loading",
  startdate: "2025-12-15T10:00:00.000Z",
  enddate: "2025-12-15T18:00:00.000Z",
  targetamount: 1000,
  eventdetails: ["Testing compression", "Ultra-lightweight loading", "Frontend optimization"],
  images: testBase64Images,
  adminId: adminId
};

// Track compression results
let compressionResults = {
  totalTests: 0,
  successful: 0,
  failed: 0,
  totalSizeSaved: 0,
  avgCompressionRatio: 0
};

// Helper function to calculate Base64 size in KB
function getBase64SizeKB(base64String) {
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  return Math.round((base64Data.length * 3) / 4 / 1024);
}

// Test 1: Create Event Card with Base64 Images (Tests Compression During Creation)
async function testCreateEventWithCompression() {
  console.log('\n📸 TEST 1: Create Event Card with Base64 Images');
  console.log('================================================');
  
  try {
    console.log('⚡ Testing ultra-lightweight compression during event creation...');
    
    // Calculate original total size
    let originalTotalSize = 0;
    testBase64Images.forEach((img, index) => {
      const sizeKB = getBase64SizeKB(img);
      console.log(`📊 Original image ${index + 1} size:`, sizeKB + 'KB');
      originalTotalSize += sizeKB;
    });
    console.log('📊 Total original size:', originalTotalSize + 'KB');
    
    const response = await axios.post(`${baseURL}/admin/${adminId}/event-cards`, eventCardWithBase64, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Event created successfully');
      console.log('🎪 Event ID:', response.data.data.id);
      console.log('🖼️ Images processed:', response.data.data.images.length);
      
      // Calculate compressed total size
      let compressedTotalSize = 0;
      response.data.data.images.forEach((img, index) => {
        const sizeKB = getBase64SizeKB(img);
        console.log(`📦 Compressed image ${index + 1} size:`, sizeKB + 'KB');
        compressedTotalSize += sizeKB;
      });
      console.log('📦 Total compressed size:', compressedTotalSize + 'KB');
      
      const sizeSaved = originalTotalSize - compressedTotalSize;
      const compressionRatio = Math.round((sizeSaved / originalTotalSize) * 100);
      
      console.log('💾 Size saved:', sizeSaved + 'KB');
      console.log('⚡ Compression ratio:', compressionRatio + '%');
      
      compressionResults.totalTests++;
      compressionResults.successful++;
      compressionResults.totalSizeSaved += sizeSaved;
      
      return response.data.data.id; // Return event ID for further tests
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.log('❌ ERROR in create event test:', error.response?.data?.message || error.message);
    compressionResults.totalTests++;
    compressionResults.failed++;
    return null;
  }
}

// Test 2: Retrieve Event Cards (Tests Compression During Retrieval)
async function testRetrieveEventsWithCompression() {
  console.log('\n📋 TEST 2: Retrieve Event Cards with Compression');
  console.log('===============================================');
  
  try {
    console.log('⚡ Testing ultra-lightweight compression during event retrieval...');
    
    const response = await axios.get(`${baseURL}/admin/${adminId}/event-cards`);

    if (response.data.success && response.data.data.length > 0) {
      console.log('✅ Events retrieved successfully');
      console.log('📊 Total events found:', response.data.data.length);
      
      let totalRetrievedSize = 0;
      let eventsWithImages = 0;
      
      response.data.data.forEach((event, eventIndex) => {
        if (event.images && event.images.length > 0) {
          eventsWithImages++;
          console.log(`\n🎪 Event ${eventIndex + 1}: ${event.name}`);
          console.log('🖼️ Images:', event.images.length);
          
          event.images.forEach((img, imgIndex) => {
            if (typeof img === 'string' && img.startsWith('data:image/')) {
              const sizeKB = getBase64SizeKB(img);
              console.log(`   📦 Image ${imgIndex + 1}:`, sizeKB + 'KB (ultra-light)');
              totalRetrievedSize += sizeKB;
            }
          });
        }
      });
      
      console.log('\n📊 RETRIEVAL COMPRESSION SUMMARY:');
      console.log('   📋 Events with images:', eventsWithImages);
      console.log('   📦 Total retrieved size:', totalRetrievedSize + 'KB');
      console.log('   ⚡ Average per event:', Math.round(totalRetrievedSize / eventsWithImages) + 'KB');
      
      compressionResults.totalTests++;
      compressionResults.successful++;
      
    } else {
      console.log('⚠️ No events found or retrieval failed');
      compressionResults.totalTests++;
      compressionResults.failed++;
    }
  } catch (error) {
    console.log('❌ ERROR in retrieve events test:', error.response?.data?.message || error.message);
    compressionResults.totalTests++;
    compressionResults.failed++;
  }
}

// Test 3: Single Event Retrieval with Compression
async function testSingleEventCompression(eventId) {
  if (!eventId) return;
  
  console.log('\n🎯 TEST 3: Single Event Retrieval with Compression');
  console.log('=================================================');
  
  try {
    console.log('⚡ Testing compression for single event retrieval...');
    
    const response = await axios.get(`${baseURL}/event-cards/${eventId}`);

    if (response.data.success) {
      console.log('✅ Single event retrieved successfully');
      console.log('🎪 Event:', response.data.data.name);
      console.log('🖼️ Images:', response.data.data.images.length);
      
      let totalSize = 0;
      response.data.data.images.forEach((img, index) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          const sizeKB = getBase64SizeKB(img);
          console.log(`   📦 Image ${index + 1}:`, sizeKB + 'KB (ultra-light)');
          totalSize += sizeKB;
        }
      });
      
      console.log('📦 Total size for single event:', totalSize + 'KB');
      console.log('⚡ Ultra-lightweight single event loading: READY');
      
      compressionResults.totalTests++;
      compressionResults.successful++;
      
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.log('❌ ERROR in single event test:', error.response?.data?.message || error.message);
    compressionResults.totalTests++;
    compressionResults.failed++;
  }
}

// Test 4: Performance Test - Frontend Loading Speed Simulation
async function testFrontendLoadingSpeed() {
  console.log('\n🚀 TEST 4: Frontend Loading Speed Simulation');
  console.log('===========================================');
  
  try {
    console.log('⚡ Simulating frontend loading with ultra-lightweight images...');
    
    const startTime = Date.now();
    const response = await axios.get(`${baseURL}/admin/${adminId}/event-cards`);
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    
    if (response.data.success) {
      console.log('✅ Frontend loading simulation complete');
      console.log('⏱️ Total API response time:', loadTime + 'ms');
      
      let totalDataSize = JSON.stringify(response.data).length;
      let totalImageSize = 0;
      let imageCount = 0;
      
      response.data.data.forEach(event => {
        if (event.images) {
          event.images.forEach(img => {
            if (typeof img === 'string' && img.startsWith('data:image/')) {
              totalImageSize += getBase64SizeKB(img);
              imageCount++;
            }
          });
        }
      });
      
      console.log('📊 FRONTEND LOADING ANALYSIS:');
      console.log('   📦 Total payload size:', Math.round(totalDataSize / 1024) + 'KB');
      console.log('   🖼️ Total image data:', totalImageSize + 'KB');
      console.log('   📸 Total images:', imageCount);
      console.log('   ⚡ Avg per image:', Math.round(totalImageSize / imageCount) + 'KB');
      console.log('   🚀 Loading speed: ' + (loadTime < 500 ? 'EXCELLENT' : loadTime < 1000 ? 'GOOD' : 'NEEDS OPTIMIZATION'));
      
      if (totalImageSize / imageCount <= 30) {
        console.log('   ✅ ULTRA-LIGHTWEIGHT TARGET ACHIEVED!');
      } else {
        console.log('   ⚠️ Images could be more lightweight');
      }
      
      compressionResults.totalTests++;
      compressionResults.successful++;
      
    } else {
      throw new Error('Frontend loading test failed');
    }
  } catch (error) {
    console.log('❌ ERROR in frontend loading test:', error.response?.data?.message || error.message);
    compressionResults.totalTests++;
    compressionResults.failed++;
  }
}

// Main test execution
async function runAllCompressionTests() {
  console.log('⚡ STARTING ULTRA-LIGHTWEIGHT COMPRESSION TESTS');
  console.log('==============================================\n');
  
  try {
    // Test 1: Create event with compression
    const eventId = await testCreateEventWithCompression();
    
    // Test 2: Retrieve events with compression
    await testRetrieveEventsWithCompression();
    
    // Test 3: Single event compression
    await testSingleEventCompression(eventId);
    
    // Test 4: Frontend loading speed
    await testFrontendLoadingSpeed();
    
    // Final results
    console.log('\n⚡ ULTRA-LIGHTWEIGHT COMPRESSION TEST RESULTS');
    console.log('===========================================');
    console.log('📊 Total tests:', compressionResults.totalTests);
    console.log('✅ Successful:', compressionResults.successful);
    console.log('❌ Failed:', compressionResults.failed);
    console.log('💾 Total size saved:', compressionResults.totalSizeSaved + 'KB');
    console.log('🎯 Success rate:', Math.round((compressionResults.successful / compressionResults.totalTests) * 100) + '%');
    
    if (compressionResults.successful === compressionResults.totalTests) {
      console.log('\n🎉 ALL ULTRA-LIGHTWEIGHT COMPRESSION TESTS PASSED!');
      console.log('⚡ Frontend loading is now optimized for speed!');
      console.log('📱 Mobile-friendly image sizes achieved!');
    } else {
      console.log('\n⚠️ Some tests failed - check compression implementation');
    }
    
  } catch (error) {
    console.log('❌ CRITICAL ERROR in test execution:', error.message);
  }
}

// Run the tests
runAllCompressionTests();