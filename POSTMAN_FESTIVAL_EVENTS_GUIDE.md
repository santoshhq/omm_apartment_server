# 🎉 POSTMAN TESTING GUIDE - FESTIVAL/DONATION EVENT SYSTEM
# ============================================================

## 🎯 **SYSTEM OVERVIEW:**
This is a **Festival/Donation Event System** where:
- Admins create fundraising events/festivals
- Members can donate to these events
- Track donations progress towards target amounts
- Manage event details and timeline

---

## 🛠️ **POSTMAN SETUP:**

### **Base URL:** `http://localhost:8080/api/events`
### **Admin ID:** `68d664d7d84448fff5dc3a8b`

---

## 📋 **STEP-BY-STEP POSTMAN TESTING:**

### **🔴 1. CREATE FESTIVAL/EVENT**

#### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b`
- **Headers:** 
  - `Content-Type: application/json`

#### **Body (Raw JSON):**
```json
{
  "name": "Community Diwali Festival 2025",
  "description": "Annual Diwali celebration featuring traditional music, dance performances, food stalls, and fireworks display. Help us raise funds for decorations, entertainment, and community activities.",
  "targetAmount": 5000.00,
  "imageUrl": "https://example.com/diwali-festival.jpg",
  "startDate": "2025-11-12T18:00:00.000Z",
  "endDate": "2025-11-15T22:00:00.000Z",
  "eventDetails": [
    "Traditional Dance Performances",
    "Live Music & DJ",
    "Food Stalls with Indian Cuisine",
    "Fireworks Display",
    "Rangoli Competition",
    "Kids Activities Zone",
    "Traditional Decorations",
    "Cultural Programs",
    "Community Participation",
    "Photography Contest"
  ],
  "isActive": true
}
```

#### **Expected Response:**
```json
{
  "success": true,
  "message": "Event created successfully!",
  "data": {
    "event": {
      "id": "EVENT_ID_HERE",
      "name": "Community Diwali Festival 2025",
      "targetAmount": 5000,
      "collectedAmount": 0,
      "donations": [],
      "eventDetails": [...],
      "isActive": true,
      "createdAt": "..."
    }
  }
}
```

---

### **🟢 2. GET ALL EVENTS**

#### **Request Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b`

#### **Expected Response:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "totalEvents": 1,
    "events": [
      {
        "id": "...",
        "name": "Community Diwali Festival 2025",
        "targetAmount": 5000,
        "collectedAmount": 0,
        "donationsCount": 0,
        "progressPercentage": 0,
        "isActive": true
      }
    ]
  }
}
```

---

### **🔍 3. GET SINGLE EVENT**

#### **Request Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b/event/{EVENT_ID}`

#### **Replace {EVENT_ID}** with the ID from Step 1 response

---

### **💰 4. ADD DONATION TO EVENT**

#### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/events/{EVENT_ID}/donate`
- **Headers:** `Content-Type: application/json`

#### **Body (Raw JSON):**
```json
{
  "userId": "68d664d7d84448fff5dc3a8c",
  "amount": 250.00
}
```

#### **Expected Response:**
```json
{
  "success": true,
  "message": "Donation added successfully!",
  "data": {
    "event": {
      "collectedAmount": 250,
      "progressPercentage": 5.0,
      "donationsCount": 1
    },
    "donation": {
      "userId": "68d664d7d84448fff5dc3a8c",
      "amount": 250,
      "donatedAt": "..."
    }
  }
}
```

---

### **✏️ 5. UPDATE EVENT**

#### **Request Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b/event/{EVENT_ID}`
- **Headers:** `Content-Type: application/json`

#### **Body (Raw JSON):**
```json
{
  "name": "Community Diwali Festival 2025 - GRAND CELEBRATION",
  "targetAmount": 7500.00,
  "endDate": "2025-11-16T23:00:00.000Z",
  "eventDetails": [
    "Traditional Dance Performances",
    "Live Music & DJ",
    "Food Stalls with Indian Cuisine",
    "Grand Fireworks Display",
    "Rangoli Competition",
    "Kids Activities Zone",
    "Traditional Decorations",
    "Cultural Programs",
    "Community Participation",
    "Photography Contest",
    "Prize Distribution Ceremony",
    "Extended Celebration Hours"
  ]
}
```

---

### **🔄 6. TOGGLE EVENT STATUS**

#### **Request Setup:**
- **Method:** `PATCH`
- **URL:** `http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b/event/{EVENT_ID}/toggle-status`

---

### **🗑️ 7. DELETE EVENT (SOFT DELETE)**

#### **Request Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b/event/{EVENT_ID}`

---

### **💥 8. DELETE EVENT (HARD DELETE)**

#### **Request Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b/event/{EVENT_ID}?hardDelete=true`

---

## 🔍 **FILTERING & SEARCH TESTS:**

### **Filter Active Events:**
```
GET http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b?isActive=true
```

### **Filter by Target Amount Range:**
```
GET http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b?minTarget=1000&maxTarget=10000
```

### **Search Events:**
```
GET http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b?search=diwali
```

### **Filter by Date Range:**
```
GET http://localhost:8080/api/events/admin/68d664d7d84448fff5dc3a8b?startDate=2025-11-01&endDate=2025-11-30
```

---

## 🧪 **ADDITIONAL TEST CASES:**

### **Christmas Festival Event:**
```json
{
  "name": "Christmas Community Celebration",
  "description": "Annual Christmas celebration with Santa visits, gift exchanges, and holiday feast.",
  "targetAmount": 3000.00,
  "imageUrl": "https://example.com/christmas-event.jpg",
  "startDate": "2025-12-24T17:00:00.000Z",
  "endDate": "2025-12-25T23:00:00.000Z",
  "eventDetails": [
    "Santa Claus Visit",
    "Gift Exchange Program",
    "Christmas Carol Singing",
    "Holiday Feast",
    "Decorations & Lights",
    "Kids Games & Activities"
  ],
  "isActive": true
}
```

### **Community Sports Event:**
```json
{
  "name": "Annual Sports Tournament",
  "description": "Community sports tournament with multiple games and prize distribution.",
  "targetAmount": 2500.00,
  "imageUrl": "https://example.com/sports-tournament.jpg",
  "startDate": "2025-10-15T09:00:00.000Z",
  "endDate": "2025-10-17T18:00:00.000Z",
  "eventDetails": [
    "Cricket Tournament",
    "Badminton Competition",
    "Table Tennis Matches",
    "Prize Distribution",
    "Refreshments",
    "Sports Equipment"
  ],
  "isActive": true
}
```

---

## ⚠️ **VALIDATION TEST CASES:**

### **Missing Required Fields:**
```json
{
  "name": "",
  "description": "",
  "targetAmount": ""
}
```
**Expected:** 400 Error - Missing required fields

### **Invalid Target Amount:**
```json
{
  "name": "Test Event",
  "description": "Test Description",
  "targetAmount": -100
}
```
**Expected:** 400 Error - Invalid target amount

### **Invalid Donation Amount:**
```json
{
  "userId": "68d664d7d84448fff5dc3a8c",
  "amount": -50
}
```
**Expected:** 400 Error - Invalid donation amount

---

## 📊 **EXPECTED DATABASE COLLECTIONS:**

After successful testing, you should see in MongoDB Compass:

### **Collection: `festivals`**
- Documents with event details
- Donations array within each document
- Admin references
- Timestamps

---

## 🎯 **KEY FEATURES TO VERIFY:**

✅ **Event Creation** - With all required fields  
✅ **Donation System** - Members can donate to events  
✅ **Progress Tracking** - Collected vs Target amounts  
✅ **Event Details Array** - Flexible list of features  
✅ **Date Management** - Start and end dates  
✅ **Admin Permissions** - Only admin can manage events  
✅ **Filtering & Search** - Multiple filter options  
✅ **Status Management** - Active/Inactive events  

---

## 🚀 **START TESTING:**

1. **Make sure server is running** (`node index.js`)
2. **Follow the steps 1-8 above**
3. **Check MongoDB Compass** for `festivals` collection
4. **Verify all responses match expected formats**

**Your Festival/Donation Event System is ready for testing!** 🎊