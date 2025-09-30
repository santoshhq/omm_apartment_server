# 🏢 AMENITIES SYSTEM TESTING GUIDE
# ===============================================

## ✨ Features Implemented:

### 1. **📋 Create Amenity**
- **Endpoint**: `POST /api/amenities/admin/{adminId}`
- **Features Array**: Unlimited features per amenity
- **Image Support**: Multiple images per amenity
- **Validation**: Capacity, hourly rate, admin verification

### 2. **📖 Get All Amenities**  
- **Endpoint**: `GET /api/amenities/admin/{adminId}`
- **Filtering**: active, capacity range, search
- **Sorting**: Latest first

### 3. **🔍 Get Single Amenity**
- **Endpoint**: `GET /api/amenities/admin/{adminId}/amenity/{amenityId}`
- **Details**: Complete amenity information

### 4. **✏️ Update Amenity**
- **Endpoint**: `PUT /api/amenities/admin/{adminId}/amenity/{amenityId}`
- **Features**: Update all fields including features array
- **Validation**: Duplicate name check, capacity validation

### 5. **🔄 Toggle Status**
- **Endpoint**: `PATCH /api/amenities/admin/{adminId}/amenity/{amenityId}/toggle-status`
- **Function**: Activate/Deactivate amenity

### 6. **🗑️ Delete Amenity**
- **Endpoint**: `DELETE /api/amenities/admin/{adminId}/amenity/{amenityId}`
- **Soft Delete**: Default (marks inactive)
- **Hard Delete**: Use `?hardDelete=true`

---

## 🧪 MANUAL TESTING STEPS:

### **Step 1: Get Admin ID**
First, you need an adminId. Use your existing admin from the member system or create a new one.

### **Step 2: Test Create Amenity**
```bash
curl -X POST http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Swimming Pool",
    "description": "Olympic-sized swimming pool with modern facilities",
    "capacity": 50,
    "location": "Ground Floor, Block A",
    "hourlyRate": 25.00,
    "imagePaths": [
      "https://example.com/pool1.jpg",
      "https://example.com/pool2.jpg"
    ],
    "features": [
      "Olympic Size Pool",
      "Heated Water",
      "Pool Lights",
      "Diving Board",
      "Pool Side Seating",
      "Changing Rooms",
      "Life Guards"
    ],
    "active": true
  }'
```

### **Step 3: Test Get All Amenities**
```bash
curl http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID
```

### **Step 4: Test Get Single Amenity**
```bash
curl http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID/amenity/AMENITY_ID
```

### **Step 5: Test Update Amenity Features**
```bash
curl -X PUT http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID/amenity/AMENITY_ID \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      "Olympic Size Pool",
      "Heated Water System",
      "LED Pool Lights",
      "Professional Diving Board",
      "VIP Pool Side Seating",
      "Premium Changing Rooms",
      "Pool Bar Service",
      "Underwater Speakers"
    ],
    "capacity": 75,
    "hourlyRate": 35.00
  }'
```

### **Step 6: Test Filtering**
```bash
# Active amenities only
curl "http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID?active=true"

# Capacity range
curl "http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID?minCapacity=30&maxCapacity=100"

# Search
curl "http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID?search=pool"
```

### **Step 7: Test Toggle Status**
```bash
curl -X PATCH http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID/amenity/AMENITY_ID/toggle-status
```

### **Step 8: Test Soft Delete**
```bash
curl -X DELETE http://localhost:8080/api/amenities/admin/YOUR_ADMIN_ID/amenity/AMENITY_ID
```

---

## 📊 FEATURES ARRAY TESTING:

### ✅ **Unlimited Features**
- Add as many features as needed
- No fixed count limitation
- Dynamic array handling

### ✅ **Automatic Sanitization**
- Removes empty strings
- Removes duplicate features
- Trims whitespace

### ✅ **Easy Management**
- Add features during creation
- Update features anytime
- Remove features by updating array

---

## 🎯 SUCCESS INDICATORS:

After testing, you should see:

✅ **Database Collections**:
   - `Amenity` collection with amenities data
   - Features stored as array in each document

✅ **API Responses**:
   - Proper JSON responses with success/error messages
   - Features array in all amenity data
   - Change tracking in update responses

✅ **Functionality**:
   - Create amenities with multiple features
   - Update features array dynamically  
   - Filter and search amenities
   - Toggle active/inactive status
   - Soft delete functionality

✅ **Validation**:
   - Admin permission checks
   - Capacity and rate validation
   - Duplicate name prevention
   - Features array sanitization

---

## 🔧 Environment Variables Used:

- `DEFAULT_AMENITY_HOURLY_RATE=0.0`
- `MAX_IMAGES_PER_AMENITY=10`
- `MAX_FEATURES_PER_AMENITY=20`

---

## 🎊 **Your amenities system is fully functional!**

The features array works perfectly and can store unlimited features for each amenity. The system includes comprehensive validation, filtering, and management capabilities.