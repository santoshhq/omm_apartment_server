# Event Card Update Functionality Testing Guide

## Enhanced Update Features
The event card update functionality now includes comprehensive validation for all fields including images:

### Validation Features:
- **Name Validation**: Checks for valid string, sanitizes HTML
- **Description Validation**: Checks for valid string, sanitizes HTML
- **Image URL Validation**: Validates URL format and accessibility
- **Date Validation**: Ensures start date is not in the past, end date is after start date
- **Amount Validation**: Ensures target amount is positive number
- **Event Details Validation**: Sanitizes HTML content
- **Admin Verification**: Verifies admin exists before update
- **Change Tracking**: Logs before and after values for all changes

## Testing Steps

### Prerequisites
1. Start your server: `node app.js` or `node index.js`
2. Ensure MongoDB is running
3. Have a valid admin ID and event card ID ready

### Step 1: Create Test Event Card (if needed)
**Method:** POST  
**URL:** `http://localhost:3000/api/events`  
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "image": "https://example.com/test-image.jpg",
  "name": "Test Festival Event",
  "startdate": "2024-12-25",
  "enddate": "2024-12-31",
  "description": "A test festival event for testing purposes",
  "targetamount": 10000,
  "eventdetails": "Detailed information about the test event",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### Step 2: Test Complete Update (All Fields)
**Method:** PUT  
**URL:** `http://localhost:3000/api/events/YOUR_EVENT_ID_HERE`  
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Updated Festival Event Name",
  "description": "Updated description for the festival event",
  "imageUrl": "https://example.com/updated-image.jpg",
  "targetAmount": 15000,
  "startDate": "2024-12-26",
  "endDate": "2025-01-05",
  "eventDetails": "Updated detailed information about the event with more comprehensive details",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### Step 3: Test Partial Update (Only Some Fields)
**Method:** PUT  
**URL:** `http://localhost:3000/api/events/YOUR_EVENT_ID_HERE`  
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Partially Updated Event Name",
  "targetAmount": 20000,
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### Step 4: Test Image Update Only
**Method:** PUT  
**URL:** `http://localhost:3000/api/events/YOUR_EVENT_ID_HERE`  
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "imageUrl": "https://picsum.photos/800/600",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```

### Step 5: Test Validation Errors

#### Test Invalid Image URL
**Body:**
```json
{
  "imageUrl": "not-a-valid-url",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```
**Expected Response:** 400 Bad Request with validation error

#### Test Invalid Date Range
**Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2023-12-31",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```
**Expected Response:** 400 Bad Request with date validation error

#### Test Past Start Date
**Body:**
```json
{
  "startDate": "2023-01-01",
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```
**Expected Response:** 400 Bad Request with past date error

#### Test Negative Amount
**Body:**
```json
{
  "targetAmount": -5000,
  "adminId": "YOUR_ADMIN_ID_HERE"
}
```
**Expected Response:** 400 Bad Request with amount validation error

#### Test Missing Admin ID
**Body:**
```json
{
  "name": "Test Update Without Admin"
}
```
**Expected Response:** 400 Bad Request with admin ID required error

#### Test Invalid Admin ID
**Body:**
```json
{
  "name": "Test Update With Invalid Admin",
  "adminId": "invalid_admin_id"
}
```
**Expected Response:** 400 Bad Request with admin not found error

## Expected Success Response Format
```json
{
  "success": true,
  "message": "Event card updated successfully",
  "data": {
    "_id": "event_id",
    "name": "Updated Event Name",
    "description": "Updated description",
    "imageUrl": "https://example.com/updated-image.jpg",
    "startDate": "2024-12-26T00:00:00.000Z",
    "endDate": "2025-01-05T00:00:00.000Z",
    "targetAmount": 15000,
    "currentAmount": 0,
    "eventDetails": "Updated event details",
    "isActive": true,
    "donations": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  },
  "changes": {
    "name": {
      "before": "Old Event Name",
      "after": "Updated Event Name"
    },
    "targetAmount": {
      "before": 10000,
      "after": 15000
    }
  }
}
```

## Testing Checklist
- [ ] Complete field update works
- [ ] Partial field update works
- [ ] Image URL validation works
- [ ] Date validation works (past dates, invalid ranges)
- [ ] Amount validation works (negative numbers)
- [ ] Admin verification works
- [ ] HTML sanitization works
- [ ] Change tracking logs properly
- [ ] Error responses are appropriate
- [ ] Success responses include all data

## Troubleshooting
1. **Server Error 500**: Check server logs for detailed error information
2. **Event Not Found**: Verify the event ID exists in your database
3. **Admin Not Found**: Verify the admin ID exists in your database
4. **Validation Errors**: Check the specific field mentioned in the error message
5. **Image URL Issues**: Ensure the URL is accessible and properly formatted

## Additional Testing
You can also test the update functionality through other methods:
- Get event by ID: `GET /api/events/:id`
- Get all events: `GET /api/events`
- Check if changes persisted in database