# 🏢 Amenity Booking System - Postman Testing Guide

## 📋 Prerequisites
1. **Server Running**: Ensure your Node.js server is running on `http://localhost:8080`
2. **Admin Account**: You need an admin user ID for creating amenities
3. **Member Account**: You need a member user ID for booking amenities
4. **Postman Collection**: Import the provided collection

---

## 🎯 Step-by-Step Testing Process

### **Step 1: Create an Amenity** (Required for booking)
```
Method: POST
URL: http://localhost:8080/api/amenities/admin/{adminId}
Headers:
  Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Swimming Pool",
  "description": "Olympic-sized swimming pool with temperature control",
  "location": "Ground Floor, East Wing",
  "capacity": 50,
  "hourlyRate": 100,
  "bookingType": "shared",
  "weeklySchedule": {
    "monday": { "open": "06:00", "close": "22:00", "closed": false },
    "tuesday": { "open": "06:00", "close": "22:00", "closed": false },
    "wednesday": { "open": "06:00", "close": "22:00", "closed": false },
    "thursday": { "open": "06:00", "close": "22:00", "closed": false },
    "friday": { "open": "06:00", "close": "22:00", "closed": false },
    "saturday": { "open": "08:00", "close": "20:00", "closed": false },
    "sunday": { "open": "08:00", "close": "20:00", "closed": false }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Amenity created successfully",
  "data": {
    "_id": "amenity_id_here",
    "name": "Swimming Pool",
    // ... other amenity details
  }
}
```

---

### **Step 2: Check Available Time Slots**
```
Method: GET
URL: http://localhost:8080/api/bookings/amenity/{amenityId}/available/{date}
```

**Example URL:**
```
http://localhost:8080/api/bookings/amenity/670f1a2b3c4d5e6f7890abc/available/2025-10-25
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-10-25",
    "dayOfWeek": "friday",
    "operatingHours": "06:00 - 22:00",
    "bookingType": "shared",
    "availableSlots": [
      {
        "startTime": "06:00",
        "endTime": "06:30",
        "duration": 0.5,
        "available": true
      },
      {
        "startTime": "06:30",
        "endTime": "07:00",
        "duration": 0.5,
        "available": true
      }
      // ... more slots
    ]
  }
}
```

---

### **Step 3: Create a Booking**
```
Method: POST
URL: http://localhost:8080/api/bookings/create
Headers:
  Content-Type: application/json
```

**Request Body:**
```json
{
  "amenityId": "amenity_id_from_step_1",
  "userId": "member_user_id",
  "bookingType": "shared",
  "date": "2025-10-25",
  "startTime": "10:00",
  "endTime": "11:30",
  "paymentType": "cash",
  "amount": 150
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "booking_id_here",
    "amenityId": {
      "name": "Swimming Pool",
      "location": "Ground Floor, East Wing"
    },
    "userId": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "date": "2025-10-25T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "11:30",
    "status": "pending",
    "amount": 150
  }
}
```

---

### **Step 4: Get All Bookings (Admin)**
```
Method: GET
URL: http://localhost:8080/api/bookings/all
```

**Optional Query Parameters:**
- `?status=pending` - Filter by status
- `?amenityId=amenity_id` - Filter by amenity
- `?userId=user_id` - Filter by user
- `?startDate=2025-10-01&endDate=2025-10-31` - Date range

---

### **Step 5: Get User's Bookings**
```
Method: GET
URL: http://localhost:8080/api/bookings/user/{userId}
```

**Optional Query Parameters:**
- `?upcoming=true` - Only upcoming bookings
- `?status=accepted` - Filter by status

---

### **Step 6: Update Booking Status (Admin)**
```
Method: PUT
URL: http://localhost:8080/api/bookings/booking/{bookingId}/status
Headers:
  Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "accepted",
  "adminId": "admin_user_id"
}
```

---

### **Step 7: Cancel Booking (User)**
```
Method: DELETE
URL: http://localhost:8080/api/bookings/booking/{bookingId}/cancel
Headers:
  Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "member_user_id"
}
```

---

## 🧪 Test Scenarios

### **✅ Valid Booking Test**
1. Create amenity
2. Check available slots for tomorrow
3. Create booking with valid time slot
4. Verify booking appears in user's bookings
5. Verify booking appears in amenity's bookings

### **❌ Invalid Booking Tests**

**Past Date:**
```json
{
  "date": "2025-10-10", // Past date
  "startTime": "10:00",
  "endTime": "11:00"
}
```
**Expected:** `"Booking date cannot be in the past"`

**Invalid Time Format:**
```json
{
  "date": "2025-10-25",
  "startTime": "10:00",
  "endTime": "25:00" // Invalid hour
}
```
**Expected:** `"Invalid time format"`

**End Before Start:**
```json
{
  "date": "2025-10-25",
  "startTime": "11:00",
  "endTime": "10:00" // End before start
}
```
**Expected:** `"End time must be after start time"`

**Outside Operating Hours:**
```json
{
  "date": "2025-10-25",
  "startTime": "23:00", // After closing time
  "endTime": "24:00"
}
```
**Expected:** `"Booking time must be within operating hours"`

**Conflict with Existing Booking:**
1. Create first booking: 10:00-11:00
2. Try second booking: 10:30-11:30 (overlaps)
**Expected:** `"This slot is already booked"`

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/amenities/admin/{adminId}` | Create amenity |
| GET | `/api/bookings/amenity/{amenityId}/available/{date}` | Get available slots |
| POST | `/api/bookings/create` | Create booking |
| GET | `/api/bookings/all` | Get all bookings (admin) |
| GET | `/api/bookings/user/{userId}` | Get user's bookings |
| GET | `/api/bookings/amenity/{amenityId}` | Get amenity bookings |
| PUT | `/api/bookings/booking/{id}/status` | Update booking status |
| DELETE | `/api/bookings/booking/{id}/cancel` | Cancel booking |

---

## 🔧 Troubleshooting

### **Common Issues:**

1. **"Amenity not found"**
   - Ensure amenity ID is correct
   - Check if amenity is active

2. **"User not found"**
   - Verify user ID exists in database
   - Check if user is active member

3. **"Invalid time format"**
   - Use HH:mm format (e.g., "09:00", "14:30")
   - Ensure leading zeros for single digits

4. **"Booking conflicts detected"**
   - Check existing bookings for the same time slot
   - Exclusive bookings block all overlaps
   - Shared bookings allow multiple bookings

5. **"Date cannot be in the past"**
   - Use future dates only
   - Format: YYYY-MM-DD

### **Debug Tips:**
- Check server logs for detailed error messages
- Use `/api/bookings/health` endpoint to verify API status
- Verify database connections and data integrity

---

## 🎉 Success Indicators

✅ **Amenity created successfully**
✅ **Available slots returned with time slots**
✅ **Booking created with valid date/time**
✅ **No conflicts with existing bookings**
✅ **Proper validation error messages**
✅ **Status updates work correctly**
✅ **Cancellation works for users**

Your amenity booking system with date and time selection is now ready for testing! 🚀</content>
<parameter name="filePath">c:\Users\santo\Downloads\omm_server\AMENITY_BOOKING_POSTMAN_GUIDE.md