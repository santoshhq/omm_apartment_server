# Announcement Cards Testing Guide with Postman

## 📢 **Announcement System Overview:**

Your announcement system includes:
- **Model:** `announs.cards.js` with title, description, priority, date, adminId, isActive
- **Service:** `announs.cards.services.js` with all CRUD operations
- **Controller:** `announs.cards.controllers.js` with API endpoints
- **Router:** `announs.cards.routers.js` with route definitions
- **Connected:** Already linked in `app.js` at `/api/announcements`

## 🎯 **Available API Endpoints:**

### **Base URL:** `http://localhost:8080/api/announcements`

1. **Create Announcement:** `POST /`
2. **Get All Announcements:** `GET /`
3. **Get Active Announcements:** `GET /active`
4. **Get Announcement by ID:** `GET /:id`
5. **Update Announcement:** `PUT /:id`
6. **Delete Announcement:** `DELETE /:id`
7. **Toggle Status:** `PUT /:id/toggle`
8. **Get by Priority:** `GET /priority/:priority`

## 🧪 **Complete Testing Process:**

### **Prerequisites:**
1. **Server Running:** `node index.js` (should show port 8080)
2. **Admin ID:** Valid admin ID from your admin signup
3. **Postman Ready:** Set Content-Type to application/json

### **Test 1: Create Announcement**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/announcements`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "title": "Important Building Notice",
  "description": "The water supply will be temporarily shut off tomorrow from 9 AM to 2 PM for maintenance work. Please store water in advance.",
  "priority": "High",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Announcement created successfully",
  "data": {
    "id": "announcement_id_here",
    "title": "Important Building Notice",
    "description": "The water supply will be temporarily shut off...",
    "priority": "High",
    "date": "2025-10-01T10:30:00.000Z",
    "isActive": true,
    "adminId": "admin_id_here",
    "createdAt": "2025-10-01T10:30:00.000Z"
  }
}
```

### **Test 2: Create Different Priority Announcements**

#### **Medium Priority:**
```json
{
  "title": "Community Event Announcement",
  "description": "Join us for the annual community gathering this Saturday at 6 PM in the community hall.",
  "priority": "Medium",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

#### **Low Priority:**
```json
{
  "title": "Parking Reminder",
  "description": "Please ensure your vehicles are parked within designated spots to avoid inconvenience.",
  "priority": "Low",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### **Test 3: Get All Announcements**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/announcements`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "announcement1_id",
      "title": "Important Building Notice",
      "description": "The water supply will be...",
      "priority": "High",
      "date": "2025-10-01T10:30:00.000Z",
      "isActive": true,
      "adminId": {
        "_id": "admin_id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "createdAt": "2025-10-01T10:30:00.000Z",
      "updatedAt": "2025-10-01T10:30:00.000Z"
    }
  ]
}
```

### **Test 4: Get Active Announcements Only**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/announcements/active`

### **Test 5: Get Announcement by ID**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/announcements/YOUR_ANNOUNCEMENT_ID`

### **Test 6: Update Announcement**
**Method:** `PUT`  
**URL:** `http://localhost:8080/api/announcements/YOUR_ANNOUNCEMENT_ID`

**Body:**
```json
{
  "adminId": "YOUR_ADMIN_ID_HERE",
  "title": "Updated Building Notice",
  "description": "Water supply maintenance has been rescheduled to tomorrow from 10 AM to 3 PM.",
  "priority": "Medium"
}
```

### **Test 7: Toggle Announcement Status**
**Method:** `PUT`  
**URL:** `http://localhost:8080/api/announcements/YOUR_ANNOUNCEMENT_ID/toggle`

**Body:**
```json
{
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### **Test 8: Get Announcements by Priority**

#### **High Priority:**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/announcements/priority/High`

#### **Medium Priority:**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/announcements/priority/Medium`

#### **Low Priority:**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/announcements/priority/Low`

### **Test 9: Delete Announcement**
**Method:** `DELETE`  
**URL:** `http://localhost:8080/api/announcements/YOUR_ANNOUNCEMENT_ID`

**Body:**
```json
{
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

## 🚨 **Error Testing Cases:**

### **Test 10: Missing Required Fields**
```json
{
  "title": "Missing Description and Admin ID"
}
```
**Expected:** 400 Bad Request

### **Test 11: Invalid Priority**
```json
{
  "title": "Test Announcement",
  "description": "Test description",
  "priority": "Urgent",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```
**Expected:** Should default to "Medium" or validation error

### **Test 12: Invalid Admin ID**
```json
{
  "title": "Test Announcement",
  "description": "Test description",
  "priority": "High",
  "adminId": "invalid_admin_id"
}
```

### **Test 13: Non-existent Announcement ID**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/announcements/507f1f77bcf86cd799439011`

## 📊 **Sample Testing Sequence:**

### **Complete Test Flow:**
```bash
# 1. Create high priority announcement
POST http://localhost:8080/api/announcements
{
  "title": "Emergency Notice",
  "description": "Elevator maintenance in progress",
  "priority": "High",
  "adminId": "your_admin_id"
}

# 2. Create medium priority announcement
POST http://localhost:8080/api/announcements
{
  "title": "Community Meeting",
  "description": "Monthly community meeting this Friday",
  "priority": "Medium", 
  "adminId": "your_admin_id"
}

# 3. Get all announcements
GET http://localhost:8080/api/announcements

# 4. Get only high priority announcements
GET http://localhost:8080/api/announcements/priority/High

# 5. Update an announcement
PUT http://localhost:8080/api/announcements/announcement_id
{
  "adminId": "your_admin_id",
  "description": "Updated description"
}

# 6. Toggle status (deactivate)
PUT http://localhost:8080/api/announcements/announcement_id/toggle
{
  "adminId": "your_admin_id"
}

# 7. Get active announcements (should not include deactivated)
GET http://localhost:8080/api/announcements/active

# 8. Delete announcement
DELETE http://localhost:8080/api/announcements/announcement_id
{
  "adminId": "your_admin_id"
}
```

## 🔍 **What to Verify:**

### **For Create Operations:**
- ✅ Response status: 201 Created
- ✅ Success message: "Announcement created successfully"
- ✅ Data contains all fields (id, title, description, priority, date, isActive, adminId, createdAt)
- ✅ Default isActive: true
- ✅ Default priority: "Medium" (if not specified)
- ✅ Automatic date: Current timestamp

### **For Get Operations:**
- ✅ Response status: 200 OK
- ✅ Data contains array of announcements
- ✅ Sorted by creation date (newest first)
- ✅ Admin details populated (firstName, lastName, email)
- ✅ Priority filtering works correctly

### **For Update Operations:**
- ✅ Response status: 200 OK
- ✅ Only specified fields updated
- ✅ updatedAt timestamp changed
- ✅ Change tracking in response

### **For Delete Operations:**
- ✅ Response status: 200 OK
- ✅ Announcement removed from database
- ✅ Subsequent GET returns 404

## 🚀 **Quick Start Commands:**

1. **Start Server:** `node index.js`
2. **Test Create:** `POST http://localhost:8080/api/announcements`
3. **Test Get All:** `GET http://localhost:8080/api/announcements`
4. **Test Priority Filter:** `GET http://localhost:8080/api/announcements/priority/High`

## 📝 **Priority System:**
- **High:** Urgent notices (water shutoff, elevator breakdown, emergency)
- **Medium:** Important info (community events, policy changes)
- **Low:** General reminders (parking, noise policy, tips)

## 🔧 **Model Schema Validation:**
- **title:** Required, trimmed string
- **description:** Required, trimmed string  
- **priority:** Enum ['High', 'Medium', 'Low'], default 'Medium'
- **date:** Auto-generated timestamp
- **adminId:** Required, references adminSignup collection
- **isActive:** Boolean, default true

**Your announcement system is fully functional and ready for testing!** 🎉

Start with creating a few announcements and let me know what results you get!