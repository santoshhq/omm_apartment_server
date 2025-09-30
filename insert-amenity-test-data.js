const axios = require('axios');

// Insert Test Data for Amenities Collection
console.log('🏢 INSERTING TEST DATA INTO AMENITIES COLLECTION');
console.log('================================================\n');

const baseURL = 'http://localhost:8080/api';
const adminId = "68d664d7d84448fff5dc3a8b"; // Your provided admin ID

console.log('🔑 Using Admin ID:', adminId);
console.log('📊 Inserting multiple test amenities...\n');

// Test amenities data
const testAmenities = [
  {
    name: "Swimming Pool Complex",
    description: "Olympic-sized swimming pool with modern facilities and professional equipment",
    capacity: 100,
    location: "Ground Floor, Recreation Center",
    hourlyRate: 35.00,
    imagePaths: [
      "https://example.com/pool-main.jpg",
      "https://example.com/pool-diving.jpg",
      "https://example.com/pool-kids.jpg",
      "https://example.com/pool-facilities.jpg"
    ],
    features: [
      "Olympic Size Main Pool",
      "Kids Pool",
      "Heated Water System",
      "LED Underwater Lighting",
      "Professional Diving Board",
      "8 Swimming Lanes",
      "Pool Side Lounge Area",
      "Premium Changing Rooms",
      "Shower Facilities",
      "Digital Lockers",
      "Life Guard Service",
      "Pool Equipment Rental",
      "Swimming Lessons Available",
      "Pool Bar & Cafe",
      "Poolside WiFi"
    ],
    active: true
  },
  {
    name: "Gymnasium & Fitness Center",
    description: "State-of-the-art fitness facility with modern equipment and professional trainers",
    capacity: 80,
    location: "First Floor, Health Center",
    hourlyRate: 25.00,
    imagePaths: [
      "https://example.com/gym-main.jpg",
      "https://example.com/gym-equipment.jpg",
      "https://example.com/gym-cardio.jpg"
    ],
    features: [
      "Modern Cardio Equipment",
      "Weight Training Area",
      "Free Weights Section",
      "Functional Training Zone",
      "Group Exercise Studio",
      "Personal Training Available",
      "Yoga & Pilates Classes",
      "Air Conditioning",
      "Music System",
      "Towel Service",
      "Protein Bar",
      "Locker Facilities",
      "Shower Rooms",
      "Professional Trainers"
    ],
    active: true
  },
  {
    name: "Multi-Purpose Hall",
    description: "Spacious hall perfect for events, meetings, celebrations and community gatherings",
    capacity: 200,
    location: "Second Floor, Community Center",
    hourlyRate: 50.00,
    imagePaths: [
      "https://example.com/hall-main.jpg",
      "https://example.com/hall-setup.jpg",
      "https://example.com/hall-stage.jpg"
    ],
    features: [
      "Large Open Space",
      "Stage Area",
      "Professional Sound System",
      "LED Lighting Setup",
      "Air Conditioning",
      "Projector & Screen",
      "Wireless Microphones",
      "Tables & Chairs Available",
      "Catering Kitchen Access",
      "Parking Space",
      "Security System",
      "Wi-Fi Internet"
    ],
    active: true
  },
  {
    name: "Tennis Court",
    description: "Professional tennis court with quality surface and equipment for tournaments and practice",
    capacity: 20,
    location: "Outdoor Sports Area",
    hourlyRate: 30.00,
    imagePaths: [
      "https://example.com/tennis-court.jpg",
      "https://example.com/tennis-equipment.jpg"
    ],
    features: [
      "Professional Court Surface",
      "Net & Equipment",
      "Seating Area",
      "Court Lighting",
      "Equipment Rental",
      "Coaching Available",
      "Tournament Hosting",
      "Line Marking",
      "Ball Machine Available",
      "Water Station"
    ],
    active: true
  },
  {
    name: "Children's Play Area",
    description: "Safe and fun playground designed for children with various age-appropriate activities",
    capacity: 50,
    location: "Ground Floor, Family Zone",
    hourlyRate: 15.00,
    imagePaths: [
      "https://example.com/playground-main.jpg",
      "https://example.com/playground-equipment.jpg"
    ],
    features: [
      "Slides & Swings",
      "Climbing Structures",
      "Sand Play Area",
      "Safety Flooring",
      "Age-Appropriate Equipment",
      "Shaded Seating",
      "Security Fencing",
      "First Aid Station",
      "Parent Supervision Area",
      "Clean Restrooms",
      "Water Fountain"
    ],
    active: true
  },
  {
    name: "Business Center",
    description: "Professional workspace with meeting rooms, internet, and business facilities",
    capacity: 40,
    location: "Third Floor, Office Wing",
    hourlyRate: 40.00,
    imagePaths: [
      "https://example.com/business-center.jpg",
      "https://example.com/meeting-room.jpg"
    ],
    features: [
      "Meeting Rooms",
      "High-Speed Internet",
      "Printing & Scanning",
      "Video Conferencing",
      "Presentation Equipment",
      "Office Supplies",
      "Coffee & Refreshments",
      "Reception Services",
      "Phone Services",
      "Air Conditioning",
      "Professional Ambiance"
    ],
    active: true
  },
  {
    name: "Rooftop Garden & BBQ Area",
    description: "Beautiful rooftop space with garden views, BBQ facilities and outdoor dining",
    capacity: 60,
    location: "Rooftop Level",
    hourlyRate: 45.00,
    imagePaths: [
      "https://example.com/rooftop-garden.jpg",
      "https://example.com/bbq-area.jpg"
    ],
    features: [
      "Garden Views",
      "BBQ Grills",
      "Outdoor Dining Tables",
      "Garden Plants & Landscaping",
      "String Lighting",
      "Weather Protection",
      "Outdoor Kitchen",
      "Seating Areas",
      "City Views",
      "Event Hosting",
      "Photography Spot"
    ],
    active: true
  },
  {
    name: "Library & Study Room",
    description: "Quiet study space with books, internet access and comfortable seating for reading and work",
    capacity: 30,
    location: "Second Floor, Quiet Zone",
    hourlyRate: 10.00,
    imagePaths: [
      "https://example.com/library-main.jpg",
      "https://example.com/study-room.jpg"
    ],
    features: [
      "Book Collection",
      "Study Tables",
      "Comfortable Seating",
      "Free Wi-Fi",
      "Quiet Environment",
      "Reading Lamps",
      "Computer Access",
      "Printing Services",
      "Reference Materials",
      "Individual Study Pods",
      "Group Study Areas"
    ],
    active: true
  }
];

// Function to insert amenity
const insertAmenity = async (amenityData, index) => {
  try {
    console.log(`📤 ${index + 1}. Creating: ${amenityData.name}`);
    console.log(`   👥 Capacity: ${amenityData.capacity}`);
    console.log(`   💰 Rate: $${amenityData.hourlyRate}/hour`);
    console.log(`   📍 Location: ${amenityData.location}`);
    console.log(`   ✨ Features: ${amenityData.features.length} features`);
    console.log(`   🖼️ Images: ${amenityData.imagePaths.length} images`);
    
    const response = await axios.post(`${baseURL}/amenities/admin/${adminId}`, amenityData);
    
    console.log(`   ✅ Created successfully! ID: ${response.data.data.amenity.id}`);
    console.log(`   📝 Features stored: ${response.data.data.amenity.features.length}\n`);
    
    return response.data.data.amenity;
    
  } catch (error) {
    console.log(`   ❌ Error creating ${amenityData.name}:`, error.response?.data?.message || error.message);
    console.log('');
    return null;
  }
};

// Main function to insert all test data
const insertAllTestData = async () => {
  try {
    console.log('🚀 Starting test data insertion...\n');
    
    const createdAmenities = [];
    
    // Insert each amenity
    for (let i = 0; i < testAmenities.length; i++) {
      const amenity = await insertAmenity(testAmenities[i], i);
      if (amenity) {
        createdAmenities.push(amenity);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎉 TEST DATA INSERTION COMPLETED!');
    console.log(`✅ Successfully created: ${createdAmenities.length} amenities`);
    console.log(`❌ Failed to create: ${testAmenities.length - createdAmenities.length} amenities\n`);
    
    // Verify by getting all amenities
    console.log('🔍 Verifying inserted data...');
    try {
      const verifyResponse = await axios.get(`${baseURL}/amenities/admin/${adminId}`);
      console.log(`📊 Total amenities in database: ${verifyResponse.data.data.totalAmenities}`);
      
      console.log('\n📋 Created Amenities Summary:');
      verifyResponse.data.data.amenities.forEach((amenity, index) => {
        console.log(`   ${index + 1}. ${amenity.name} (ID: ${amenity.id})`);
        console.log(`      Capacity: ${amenity.capacity}, Rate: $${amenity.hourlyRate}, Features: ${amenity.features.length}`);
      });
      
    } catch (verifyError) {
      console.log('❌ Error verifying data:', verifyError.response?.data?.message || verifyError.message);
    }
    
    console.log('\n🎊 All test amenities have been inserted into the database!');
    console.log(`🔑 Admin ID used: ${adminId}`);
    console.log('✨ Features arrays are populated with multiple features for each amenity');
    console.log('📱 You can now test the amenity system with real data!');
    
  } catch (error) {
    console.log('\n❌ Failed to insert test data:', error.message);
  }
};

// Run the insertion
insertAllTestData().catch(console.error);