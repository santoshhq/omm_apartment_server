// Image Upload Test Script for Event Cards
// Run this in Postman or your API testing tool

// Test 1: Create Event with Valid Image URL
console.log("=== TEST 1: Valid Image URL ===");
const test1 = {
  method: "POST",
  url: "http://localhost:3000/api/events",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "image": "https://picsum.photos/800/600?random=1",
    "name": "Festival Event with Image",
    "startdate": "2025-12-01",
    "enddate": "2025-12-05",
    "description": "Testing image upload functionality",
    "targetamount": 15000,
    "eventdetails": ["Live music", "Food stalls", "Games"],
    "adminId": "YOUR_ADMIN_ID_HERE"
  })
};

// Test 2: Create Event with Invalid Image URL
console.log("=== TEST 2: Invalid Image URL ===");
const test2 = {
  method: "POST",
  url: "http://localhost:3000/api/events",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "image": "not-a-valid-url",
    "name": "Event with Invalid Image",
    "startdate": "2025-12-01",
    "enddate": "2025-12-05",
    "description": "Testing invalid image handling",
    "targetamount": 10000,
    "eventdetails": ["Test detail"],
    "adminId": "YOUR_ADMIN_ID_HERE"
  })
};

// Test 3: Create Event with Empty Image
console.log("=== TEST 3: Empty Image ===");
const test3 = {
  method: "POST",
  url: "http://localhost:3000/api/events",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "image": "",
    "name": "Event without Image",
    "startdate": "2025-12-01",
    "enddate": "2025-12-05",
    "description": "Testing empty image handling",
    "targetamount": 8000,
    "eventdetails": ["No image test"],
    "adminId": "YOUR_ADMIN_ID_HERE"
  })
};

// Test 4: Create Event with No Image Field
console.log("=== TEST 4: No Image Field ===");
const test4 = {
  method: "POST",
  url: "http://localhost:3000/api/events",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "name": "Event No Image Field",
    "startdate": "2025-12-01",
    "enddate": "2025-12-05",
    "description": "Testing without image field",
    "targetamount": 12000,
    "eventdetails": ["No image field test"],
    "adminId": "YOUR_ADMIN_ID_HERE"
  })
};

// Test 5: Update Event Image
console.log("=== TEST 5: Update Event Image ===");
const test5 = {
  method: "PUT",
  url: "http://localhost:3000/api/events/EVENT_ID_HERE",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "adminId": "YOUR_ADMIN_ID_HERE",
    "image": "https://via.placeholder.com/800x400/ff6b6b/ffffff?text=Updated+Image"
  })
};

// Instructions:
// 1. Replace YOUR_ADMIN_ID_HERE with actual admin ID
// 2. Replace EVENT_ID_HERE with actual event ID (from test 1 response)
// 3. Run tests in order
// 4. Check server console logs for detailed image processing info
// 5. Verify image field in database/API responses

console.log("Tests created! Copy and paste into Postman.");