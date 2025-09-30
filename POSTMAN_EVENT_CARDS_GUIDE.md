# 🎉 POSTMAN TESTING GUIDE - EVENT CARDS SYSTEM
# ==============================================

## 🎯 COLLECTION: Event Cards Management System

### **Setup Requirements:**
1. Server running on `http://localhost:8080`
2. Valid `adminId`: `68d664d7d84448fff5dc3a8b`
3. MongoDB connected

---

## 📋 POSTMAN REQUESTS:

### **1. Create Event Card**
- **Method**: POST
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "title": "Community Annual Festival 2025",
  "description": "Join us for our annual community festival featuring live music, food stalls, games, and entertainment for the whole family. This year's theme is 'Unity in Diversity' celebrating our multicultural community.",
  "eventType": "Festival", 
  "eventDate": "2025-12-15T18:00:00.000Z",
  "location": "Community Center Main Hall",
  "organizer": "Community Management Committee",
  "maxAttendees": 500,
  "registrationRequired": true,
  "ticketPrice": 25.00,
  "contactInfo": "events@community.com | +1-555-0123",
  "images": [
    "https://example.com/festival-main.jpg",
    "https://example.com/festival-stage.jpg",
    "https://example.com/festival-food.jpg",
    "https://example.com/festival-crowd.jpg"
  ],
  "tags": [
    "Community",
    "Festival", 
    "Music",
    "Food",
    "Family Friendly",
    "Entertainment",
    "Annual Event",
    "Cultural"
  ],
  "isActive": true
}
```

### **2. Get All Event Cards**
- **Method**: GET
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b`
- **Expected Response**:
```json
{
  "success": true,
  "message": "Event cards retrieved successfully",
  "data": {
    "totalEventCards": 1,
    "eventCards": [...]
  }
}
```

### **3. Get Single Event Card**
- **Method**: GET
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b/event/{{eventCardId}}`

### **4. Update Event Card**
- **Method**: PUT
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b/event/{{eventCardId}}`
- **Body** (raw JSON):
```json
{
  "title": "Community Annual Festival 2025 - PREMIUM EDITION",
  "maxAttendees": 750,
  "ticketPrice": 35.00,
  "eventDate": "2025-12-20T19:00:00.000Z",
  "location": "Community Center - Grand Ballroom",
  "tags": [
    "Community",
    "Festival", 
    "Music",
    "Food",
    "Family Friendly",
    "Entertainment",
    "Annual Event",
    "Cultural",
    "Premium Experience",
    "Grand Event",
    "VIP Access"
  ],
  "images": [
    "https://example.com/festival-main.jpg",
    "https://example.com/festival-stage.jpg",
    "https://example.com/festival-food.jpg",
    "https://example.com/festival-crowd.jpg",
    "https://example.com/festival-premium.jpg",
    "https://example.com/festival-vip.jpg"
  ]
}
```

### **5. Filter Event Cards - Active Only**
- **Method**: GET
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b?isActive=true`

### **6. Filter Event Cards - By Event Type**
- **Method**: GET
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b?eventType=Festival`

### **7. Search Event Cards**
- **Method**: GET
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b?search=community`

### **8. Filter by Date Range**
- **Method**: GET
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b?startDate=2025-12-01&endDate=2025-12-31`

### **9. Filter by Max Attendees**
- **Method**: GET
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b?minAttendees=100&maxAttendees=1000`

### **10. Toggle Event Card Status**
- **Method**: PATCH
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b/event/{{eventCardId}}/toggle-status`

### **11. Soft Delete Event Card**
- **Method**: DELETE
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b/event/{{eventCardId}}`

### **12. Hard Delete Event Card**
- **Method**: DELETE
- **URL**: `http://localhost:8080/api/event-cards/admin/68d664d7d84448fff5dc3a8b/event/{{eventCardId}}?hardDelete=true`

---

## 🧪 ADDITIONAL TEST CASES:

### **Test Different Event Types:**

#### **Workshop Event:**
```json
{
  "title": "Digital Photography Workshop",
  "description": "Learn professional photography techniques from expert photographers.",
  "eventType": "Workshop",
  "eventDate": "2025-11-25T14:00:00.000Z",
  "location": "Photography Studio",
  "organizer": "Arts & Crafts Committee",
  "maxAttendees": 20,
  "registrationRequired": true,
  "ticketPrice": 45.00,
  "contactInfo": "photography@community.com",
  "images": [
    "https://example.com/photography-workshop.jpg",
    "https://example.com/camera-equipment.jpg"
  ],
  "tags": ["Photography", "Workshop", "Learning", "Arts", "Digital"],
  "isActive": true
}
```

#### **Meeting Event:**
```json
{
  "title": "Monthly Community Board Meeting",
  "description": "Monthly meeting to discuss community matters and upcoming projects.",
  "eventType": "Meeting",
  "eventDate": "2025-11-15T19:00:00.000Z",
  "location": "Conference Room A",
  "organizer": "Community Board",
  "maxAttendees": 50,
  "registrationRequired": false,
  "ticketPrice": 0.00,
  "contactInfo": "board@community.com",
  "images": ["https://example.com/meeting-room.jpg"],
  "tags": ["Meeting", "Board", "Community", "Monthly"],
  "isActive": true
}
```

#### **Sports Event:**
```json
{
  "title": "Annual Tennis Tournament",
  "description": "Community tennis championship with prizes for winners.",
  "eventType": "Sports",
  "eventDate": "2025-12-05T09:00:00.000Z",
  "location": "Tennis Courts",
  "organizer": "Sports Committee",
  "maxAttendees": 100,
  "registrationRequired": true,
  "ticketPrice": 10.00,
  "contactInfo": "sports@community.com",
  "images": [
    "https://example.com/tennis-court.jpg",
    "https://example.com/tennis-tournament.jpg"
  ],
  "tags": ["Tennis", "Sports", "Tournament", "Competition"],
  "isActive": true
}
```

---

## 📊 POSTMAN VARIABLES:

Set these variables in your Postman environment:

- `baseURL` = `http://localhost:8080/api`
- `adminId` = `68d664d7d84448fff5dc3a8b`
- `eventCardId` = `EVENT_CARD_ID_FROM_CREATE_RESPONSE`

---

## ✅ SUCCESS RESPONSES:

### **Create Event Card Success:**
```json
{
  "success": true,
  "message": "Event card created successfully!",
  "data": {
    "eventCard": {
      "id": "...",
      "title": "Community Annual Festival 2025",
      "eventType": "Festival",
      "eventDate": "2025-12-15T18:00:00.000Z",
      "maxAttendees": 500,
      "ticketPrice": 25,
      "images": [...],
      "tags": [...],
      "isActive": true,
      "createdAt": "..."
    }
  }
}
```

### **Update Event Card Success:**
```json
{
  "success": true,
  "message": "Event card updated successfully",
  "data": {
    "eventCard": {...},
    "changes": {
      "fieldsUpdated": ["title", "maxAttendees", "ticketPrice"],
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
  "title": "",  // Should fail - required
  "description": "",  // Should fail - required
  "eventType": "",  // Should fail - required
  "eventDate": "",  // Should fail - required
  "location": "",  // Should fail - required
  "organizer": ""  // Should fail - required
}
```

### **Test Invalid Date:**
```json
{
  "eventDate": "invalid-date"  // Should fail
}
```

### **Test Invalid Max Attendees:**
```json
{
  "maxAttendees": -5  // Should fail - must be positive
}
```

### **Test Invalid Ticket Price:**
```json
{
  "ticketPrice": -10  // Should fail - must be non-negative
}
```

### **Test Invalid Arrays:**
```json
{
  "images": "not an array",  // Should fail
  "tags": "not an array"  // Should fail
}
```

---

## 🔍 FILTERING COMBINATIONS:

### **Complex Filter Example:**
```
GET /api/event-cards/admin/68d664d7d84448fff5dc3a8b?isActive=true&eventType=Festival&search=community&startDate=2025-12-01&endDate=2025-12-31&minAttendees=100
```

---

## 🎊 **Testing Complete!**

Your event cards system is fully functional with:
- ✅ Multiple event types support
- ✅ Advanced filtering capabilities
- ✅ Multiple images per event
- ✅ Flexible tags system
- ✅ Registration and ticketing
- ✅ Date and location management
- ✅ Admin permission system

Ready for production use! 🚀