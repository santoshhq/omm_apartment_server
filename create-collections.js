const axios = require('axios');

// Script to create collections in MongoDB by making actual API calls
console.log('🗄️ CREATING MONGODB COLLECTIONS');
console.log('================================\n');

const baseURL = 'http://localhost:8080/api';
const adminId = '68d664d7d84448fff5dc3a8b';

// Function to create collections by making API calls
const createCollections = async () => {
  try {
    console.log('🚀 Starting collection creation process...\n');

    // 1. Create Amenity Collection
    console.log('1️⃣ Creating Amenity collection...');
    try {
      const amenityData = {
        name: "Sample Swimming Pool",
        description: "A sample amenity to create the collection",
        capacity: 50,
        location: "Ground Floor",
        hourlyRate: 25.00,
        imagePaths: ["https://example.com/pool.jpg"],
        features: ["Heated Water", "Pool Lights", "Changing Rooms"],
        active: true
      };

      const amenityResponse = await axios.post(`${baseURL}/amenities/admin/${adminId}`, amenityData);
      console.log('   ✅ Amenity collection created with document ID:', amenityResponse.data.data.amenity.id);
    } catch (error) {
      console.log('   ❌ Error creating amenity:', error.response?.data?.message || error.message);
    }

    // 2. Create EventCard Collection
    console.log('\n2️⃣ Creating EventCard collection...');
    try {
      const eventCardData = {
        title: "Sample Community Event",
        description: "A sample event to create the collection",
        eventType: "Meeting",
        eventDate: "2025-12-15T18:00:00.000Z",
        location: "Community Hall",
        organizer: "Community Committee",
        maxAttendees: 100,
        registrationRequired: true,
        ticketPrice: 10.00,
        contactInfo: "events@community.com",
        images: ["https://example.com/event.jpg"],
        tags: ["Community", "Meeting", "Sample"],
        isActive: true
      };

      const eventResponse = await axios.post(`${baseURL}/event-cards/admin/${adminId}`, eventCardData);
      console.log('   ✅ EventCard collection created with document ID:', eventResponse.data.data.eventCard.id);
    } catch (error) {
      console.log('   ❌ Error creating event card:', error.response?.data?.message || error.message);
    }

    // 3. Check existing Admin Member collections (should already exist)
    console.log('\n3️⃣ Checking AdminMemberProfile and AdminMemberCredentials collections...');
    try {
      const membersResponse = await axios.get(`${baseURL}/admin-members/admin/${adminId}`);
      console.log('   ✅ AdminMemberProfile and AdminMemberCredentials collections exist');
      console.log('   📊 Total members:', membersResponse.data.data.totalMembers);
    } catch (error) {
      console.log('   ❌ Error checking admin members:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 COLLECTION CREATION PROCESS COMPLETED!');
    console.log('\n📋 Collections that should now exist in MongoDB Compass:');
    console.log('   1. ✅ amenities (from Amenity model)');
    console.log('   2. ✅ eventcards (from EventCard model)');
    console.log('   3. ✅ adminmemberprofiles (from AdminMemberProfile model)');
    console.log('   4. ✅ adminmembercredentials (from AdminMemberCredentials model)');
    console.log('   5. ✅ adminsignups (from Signup model)');
    
    console.log('\n🔍 Check MongoDB Compass now!');
    console.log('   Database: omm_server');
    console.log('   Collections should be visible with sample data');

  } catch (error) {
    console.log('❌ Error in collection creation process:', error.message);
  }
};

// Wait a moment for server to be ready, then create collections
setTimeout(() => {
  createCollections().catch(console.error);
}, 2000);