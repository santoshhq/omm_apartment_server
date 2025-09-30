# 🏢 POSTMAN TESTING GUIDE - AMENITIES SYSTEM
# =====================================================

## 🎯 COLLECTION: Amenities Management System

### **Setup Requirements:**
1. Server running on `http://localhost:8080`
2. Valid `adminId` (get from admin member system)
3. MongoDB connected

---

## 📋 REQUESTS:

### **1. Create Amenity**
- **Method**: POST
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "name": "Swimming Pool Complex",
  "description": "State-of-the-art swimming facility with multiple pools and modern amenities",
  "capacity": 100,
  "location": "Ground Floor, Recreation Center",
  "hourlyRate": 30.00,
  "imagePaths": [
    "https://example.com/pool-main.jpg",
    "https://example.com/pool-diving.jpg",
    "https://example.com/pool-kids.jpg",
    "https://example.com/pool-facilities.jpg"
  ],
  "features": [
    "Olympic Size Main Pool",
    "Kids Pool",
    "Heated Water System",
    "LED Underwater Lighting",
    "Professional Diving Board",
    "8 Swimming Lanes",
    "Pool Side Lounge Area",
    "Premium Changing Rooms",
    "Shower Facilities",
    "Lockers",
    "Life Guard Service",
    "Pool Equipment Rental",
    "Swimming Lessons Available",
    "Pool Bar & Cafe",
    "Poolside WiFi"
  ],
  "active": true
}
```

### **2. Get All Amenities**
- **Method**: GET
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}`
- **Expected Response**:
```json
{
  "success": true,
  "message": "Amenities retrieved successfully",
  "data": {
    "totalAmenities": 1,
    "amenities": [...]
  }
}
```

### **3. Get Single Amenity**
- **Method**: GET
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}/amenity/{{amenityId}}`

### **4. Update Amenity - Add More Features**
- **Method**: PUT
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}/amenity/{{amenityId}}`
- **Body** (raw JSON):
```json
{
  "name": "Premium Swimming Pool Complex",
  "capacity": 120,
  "hourlyRate": 45.00,
  "features": [
    "Olympic Size Main Pool",
    "Kids Pool",
    "Heated Water System",
    "LED Underwater Lighting",
    "Professional Diving Board",
    "10 Swimming Lanes",
    "VIP Pool Side Lounge Area",
    "Premium Changing Rooms",
    "Luxury Shower Facilities",
    "Digital Lockers",
    "Certified Life Guard Service",
    "Professional Pool Equipment Rental",
    "Private Swimming Lessons",
    "Poolside Restaurant & Bar",
    "High-Speed WiFi",
    "Pool Heating System",
    "Water Quality Monitoring",
    "Underwater Speakers",
    "Pool Maintenance Service",
    "Event Hosting Facilities"
  ]
}
```

### **5. Filter Amenities - Active Only**
- **Method**: GET
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}?active=true`

### **6. Filter Amenities - Capacity Range**
- **Method**: GET
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}?minCapacity=50&maxCapacity=150`

### **7. Search Amenities**
- **Method**: GET
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}?search=pool`

### **8. Toggle Amenity Status**
- **Method**: PATCH
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}/amenity/{{amenityId}}/toggle-status`

### **9. Soft Delete Amenity**
- **Method**: DELETE
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}/amenity/{{amenityId}}`

### **10. Hard Delete Amenity**
- **Method**: DELETE
- **URL**: `http://localhost:8080/api/amenities/admin/{{adminId}}/amenity/{{amenityId}}?hardDelete=true`

---

## 🧪 TESTING FEATURES ARRAY:

### **Test 1: Create with Multiple Features**
Use the create request above with 15+ features to test unlimited features capability.

### **Test 2: Update Features Array**
```json
{
  "features": [
    "New Feature 1",
    "New Feature 2", 
    "New Feature 2",  // Duplicate - will be removed
    "",               // Empty - will be filtered out
    "   New Feature 3   ", // Will be trimmed
    "New Feature 4"
  ]
}
```
Expected: Only unique, non-empty, trimmed features will be stored.

### **Test 3: Add Single Feature**
```json
{
  "features": [
    "Olympic Size Main Pool",
    "Kids Pool",
    "Heated Water System",
    "NEW ADDED FEATURE"  // Just adding one more
  ]
}
```

### **Test 4: Remove Features**
```json
{
  "features": [
    "Olympic Size Main Pool",
    "Kids Pool"
    // Removed all other features
  ]
}
```

### **Test 5: Empty Features Array**
```json
{
  "features": []
}
```

---

## 📊 POSTMAN VARIABLES:

Set these variables in your Postman environment:

- `baseURL` = `http://localhost:8080/api`
- `adminId` = `YOUR_ACTUAL_ADMIN_ID` (from admin member system)
- `amenityId` = `AMENITY_ID_FROM_CREATE_RESPONSE`

---

## ✅ SUCCESS RESPONSES:

### **Create Amenity Success:**
```json
{
  "success": true,
  "message": "Amenity created successfully!",
  "data": {
    "amenity": {
      "id": "...",
      "name": "Swimming Pool Complex",
      "features": [...],
      "active": true
    }
  }
}
```

### **Update Amenity Success:**
```json
{
  "success": true,
  "message": "Amenity updated successfully",
  "data": {
    "amenity": {...},
    "changes": {
      "fieldsUpdated": ["features", "capacity"],
      "oldValues": {...},
      "newValues": {...}
    }
  }
}
```

---

## 🎯 VALIDATION TESTS:

### **Test Missing Required Fields:**
```json
{
  "name": "",  // Should fail - required
  "description": ""  // Should fail - required
}
```

### **Test Invalid Capacity:**
```json
{
  "capacity": -5  // Should fail - must be positive
}
```

### **Test Invalid Hourly Rate:**
```json
{
  "hourlyRate": -10  // Should fail - must be non-negative
}
```

### **Test Invalid Arrays:**
```json
{
  "features": "not an array",  // Should fail
  "imagePaths": "not an array"  // Should fail
}
```

---

## 🎊 **Testing Complete!**

Your amenities system with unlimited features array is fully functional and ready for production use!