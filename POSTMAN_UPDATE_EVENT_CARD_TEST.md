# Postman Testing Guide for Update Event Card

## Updated Function Signature
The `updateEventCard` function now follows this structure:
```javascript
updateEventCard(adminId, cardId, updateData)
```

## Postman Test Requirements

### 1. Method & URL
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/events/:id`
- **Replace `:id` with your actual event card ID**

### 2. Headers
```
Content-Type: application/json
```

### 3. Request Body Structure
```json
{
  "image": "https://example.com/new-image.jpg",
  "name": "Updated Event Name",
  "startdate": "2025-10-15",
  "enddate": "2025-10-20",
  "description": "Updated event description",
  "targetamount": 15000,
  "eventdetails": ["Updated detail 1", "Updated detail 2", "Updated detail 3"],
  "status": true,
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

## Test Cases

### Test Case 1: Complete Update
**URL:** `PUT http://localhost:3000/api/events/YOUR_EVENT_ID`
**Body:**
```json
{
  "image": "https://picsum.photos/800/600",
  "name": "New Year Festival 2025",
  "startdate": "2025-12-31",
  "enddate": "2026-01-02",
  "description": "Celebrate the New Year with amazing festivities",
  "targetamount": 25000,
  "eventdetails": [
    "Live music performances",
    "Food and beverages",
    "Fireworks display",
    "Dancing and entertainment"
  ],
  "status": true,
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### Test Case 2: Partial Update (Only Name and Amount)
**URL:** `PUT http://localhost:3000/api/events/YOUR_EVENT_ID`
**Body:**
```json
{
  "name": "Updated Event Name Only",
  "targetamount": 30000,
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### Test Case 3: Image Update Only
**URL:** `PUT http://localhost:3000/api/events/YOUR_EVENT_ID`
**Body:**
```json
{
  "image": "https://via.placeholder.com/800x400/ff6b6b/ffffff?text=Updated+Event+Image",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### Test Case 4: Date Update
**URL:** `PUT http://localhost:3000/api/events/YOUR_EVENT_ID`
**Body:**
```json
{
  "startdate": "2025-11-01",
  "enddate": "2025-11-05",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### Test Case 5: Status Toggle
**URL:** `PUT http://localhost:3000/api/events/YOUR_EVENT_ID`
**Body:**
```json
{
  "status": false,
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

## Error Test Cases

### Test Case 6: Invalid Date Range (End before Start)
**Body:**
```json
{
  "startdate": "2025-12-31",
  "enddate": "2025-12-30",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```
**Expected:** 400 Bad Request with date validation error

### Test Case 7: Missing Admin ID
**Body:**
```json
{
  "name": "Test without admin ID"
}
```
**Expected:** 400 Bad Request

### Test Case 8: Invalid Admin ID
**Body:**
```json
{
  "name": "Test with invalid admin",
  "adminId": "invalid_admin_id_123"
}
```
**Expected:** 400 Bad Request or 404 Not Found

### Test Case 9: Non-existent Event ID
**URL:** `PUT http://localhost:3000/api/events/507f1f77bcf86cd799439011`
**Body:**
```json
{
  "name": "Update non-existent event",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```
**Expected:** 404 Not Found

## Prerequisites Before Testing

### 1. Get Valid IDs
You need to have:
- **Admin ID**: Get from your admin signup/login response
- **Event Card ID**: Get from creating an event or listing all events

### 2. Create Test Event (if needed)
**Method:** `POST`
**URL:** `http://localhost:3000/api/events`
**Body:**
```json
{
  "image": "https://picsum.photos/800/600",
  "name": "Test Event for Update",
  "startdate": "2025-11-01",
  "enddate": "2025-11-05",
  "description": "This is a test event for update testing",
  "targetamount": 10000,
  "eventdetails": ["Initial detail 1", "Initial detail 2"],
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### 3. Get All Events (to find IDs)
**Method:** `GET`
**URL:** `http://localhost:3000/api/events`

## Expected Success Response Format
```json
{
  "success": true,
  "message": "Event card updated successfully",
  "data": {
    "eventCard": {
      "id": "event_id_here",
      "image": "updated_image_url",
      "name": "Updated Event Name",
      "startdate": "2025-11-01T00:00:00.000Z",
      "enddate": "2025-11-05T00:00:00.000Z",
      "description": "Updated description",
      "targetamount": 15000,
      "collectedamount": 0,
      "eventdetails": ["Updated detail 1", "Updated detail 2"],
      "donations": [],
      "status": true,
      "adminId": "admin_id_here",
      "updatedAt": "2025-09-30T12:30:00.000Z",
      "createdAt": "2025-09-30T10:00:00.000Z"
    },
    "changes": {
      "fieldsUpdated": ["name", "targetamount", "description"],
      "changeDetails": {
        "name": {
          "old": "Old Event Name",
          "new": "Updated Event Name"
        },
        "targetamount": {
          "old": 10000,
          "new": 15000
        }
      },
      "totalChanges": 3
    }
  }
}
```

## Quick Test Steps

1. **Start your server:** `node app.js` or `node index.js`
2. **Open Postman**
3. **Create a new request**
4. **Set method to PUT**
5. **Enter URL:** `http://localhost:3000/api/events/YOUR_EVENT_ID`
6. **Add Content-Type header:** `application/json`
7. **Add request body** from any test case above
8. **Replace YOUR_ADMIN_ID_HERE with actual admin ID**
9. **Replace YOUR_EVENT_ID with actual event ID**
10. **Send the request**

## Troubleshooting
- **500 Server Error**: Check server console logs
- **404 Not Found**: Verify event ID exists and admin has access
- **400 Bad Request**: Check request body format and required fields
- **Validation Errors**: Check date ranges and data types

## Note
⚠️ **Important**: The function now requires `adminId` in the URL path logic, so make sure your controller is updated to pass the adminId from the request body to the service function.