# 📢 ANNOUNCEMENT CARDS SYSTEM - COMPLETE TESTING GUIDE

## 🔧 System Overview
The announcement cards system has been fully optimized with enhanced validation, error handling, logging, and comprehensive CRUD operations.

## 🚀 API Base URL
```
http://localhost:3000/api/announcements
```

## 📋 Complete API Endpoints Testing

### 1. ➕ CREATE ANNOUNCEMENT CARD
**Endpoint:** `POST /api/announcements`

**Request Body:**
```json
{
    "title": "Important Notice",
    "description": "This is an important announcement regarding upcoming maintenance.",
    "priority": "High",
    "adminId": "60d5ecb54e5b2c001f5d7a2b",
    "date": "2024-01-15",
    "tags": ["maintenance", "important", "notice"],
    "expiryDate": "2024-02-15T23:59:59.000Z"
}
```

**Expected Response (201):**
```json
{
    "success": true,
    "message": "Announcement card created successfully",
    "data": {
        "id": "...generated_id...",
        "title": "Important Notice",
        "description": "This is an important announcement regarding upcoming maintenance.",
        "priority": "High",
        "isActive": true,
        "adminId": {
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
        },
        "createdAt": "2024-01-10T10:00:00.000Z"
    }
}
```

### 2. 📋 GET ALL ANNOUNCEMENTS
**Endpoint:** `GET /api/announcements`

**Query Parameters (Optional):**
- `activeOnly=true` - Get only active announcements
- `adminId=60d5ecb54e5b2c001f5d7a2b` - Filter by admin
- `priority=High` - Filter by priority

**Examples:**
```
GET /api/announcements
GET /api/announcements?activeOnly=true
GET /api/announcements?adminId=60d5ecb54e5b2c001f5d7a2b
GET /api/announcements?priority=High&activeOnly=true
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Found X announcement cards",
    "data": [
        {
            "id": "announcement_id_1",
            "title": "Important Notice",
            "description": "This is an important announcement...",
            "priority": "High",
            "isActive": true,
            "adminId": {
                "firstName": "Admin",
                "lastName": "User",
                "email": "admin@example.com"
            }
        }
    ]
}
```

### 3. 🔍 GET SINGLE ANNOUNCEMENT BY ID
**Endpoint:** `GET /api/announcements/:id`

**Example:** `GET /api/announcements/60d5ecb54e5b2c001f5d7a2c`

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Announcement card found",
    "data": {
        "id": "60d5ecb54e5b2c001f5d7a2c",
        "title": "Important Notice",
        "description": "This is an important announcement...",
        "priority": "High",
        "date": "2024-01-15",
        "isActive": true,
        "tags": ["maintenance", "important"],
        "adminId": {
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
        },
        "isExpired": false,
        "createdAt": "2024-01-10T10:00:00.000Z"
    }
}
```

### 4. 🏷️ GET ANNOUNCEMENTS BY PRIORITY
**Endpoint:** `GET /api/announcements/priority/:priority`

**Valid Priorities:** High, Medium, Low

**Examples:**
```
GET /api/announcements/priority/High
GET /api/announcements/priority/Medium
GET /api/announcements/priority/Low
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Found X High priority announcements",
    "data": [
        {
            "id": "announcement_id",
            "title": "High Priority Notice",
            "description": "This is urgent...",
            "priority": "High",
            "isActive": true,
            "tags": ["urgent"],
            "adminId": {
                "firstName": "Admin",
                "lastName": "User"
            }
        }
    ]
}
```

### 5. ✏️ UPDATE ANNOUNCEMENT CARD
**Endpoint:** `PUT /api/announcements/:id`

**Request Body:**
```json
{
    "adminId": "60d5ecb54e5b2c001f5d7a2b",
    "title": "Updated Important Notice",
    "description": "This is an updated announcement with new information.",
    "priority": "Medium",
    "tags": ["updated", "notice"],
    "expiryDate": "2024-03-15T23:59:59.000Z"
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Announcement card updated successfully",
    "data": {
        "id": "announcement_id",
        "title": "Updated Important Notice",
        "description": "This is an updated announcement with new information.",
        "priority": "Medium",
        "isActive": true,
        "adminId": {
            "firstName": "Admin",
            "lastName": "User"
        },
        "updatedAt": "2024-01-10T11:00:00.000Z"
    }
}
```

### 6. 🔄 TOGGLE ANNOUNCEMENT STATUS
**Endpoint:** `PUT /api/announcements/:id/toggle`

**Request Body:**
```json
{
    "adminId": "60d5ecb54e5b2c001f5d7a2b"
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Announcement card is now inactive",
    "data": {
        "id": "announcement_id",
        "title": "Important Notice",
        "isActive": false
    }
}
```

### 7. 🗑️ DELETE ANNOUNCEMENT CARD
**Endpoint:** `DELETE /api/announcements/:id`

**Request Body:**
```json
{
    "adminId": "60d5ecb54e5b2c001f5d7a2b"
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Announcement card deleted successfully",
    "data": {
        "id": "announcement_id",
        "title": "Deleted Announcement"
    }
}
```

## 🧪 Postman Testing Sequence

### Step 1: Setup Environment Variables
```
BASE_URL = http://localhost:3000/api/announcements
ADMIN_ID = 60d5ecb54e5b2c001f5d7a2b
```

### Step 2: Test Create Announcement
1. Set method to `POST`
2. URL: `{{BASE_URL}}`
3. Body (JSON):
```json
{
    "title": "Test Announcement",
    "description": "This is a test announcement for API validation.",
    "priority": "High",
    "adminId": "{{ADMIN_ID}}",
    "date": "2024-01-15",
    "tags": ["test", "api"],
    "expiryDate": "2024-02-15T23:59:59.000Z"
}
```
4. Send request and save `id` from response

### Step 3: Test Get All Announcements
1. Set method to `GET`
2. URL: `{{BASE_URL}}`
3. Test with query parameters:
   - `{{BASE_URL}}?activeOnly=true`
   - `{{BASE_URL}}?priority=High`

### Step 4: Test Get Single Announcement
1. Set method to `GET`
2. URL: `{{BASE_URL}}/{{ANNOUNCEMENT_ID}}`

### Step 5: Test Get by Priority
1. Set method to `GET`
2. URL: `{{BASE_URL}}/priority/High`

### Step 6: Test Update Announcement
1. Set method to `PUT`
2. URL: `{{BASE_URL}}/{{ANNOUNCEMENT_ID}}`
3. Body (JSON):
```json
{
    "adminId": "{{ADMIN_ID}}",
    "title": "Updated Test Announcement",
    "description": "This announcement has been updated.",
    "priority": "Medium"
}
```

### Step 7: Test Toggle Status
1. Set method to `PUT`
2. URL: `{{BASE_URL}}/{{ANNOUNCEMENT_ID}}/toggle`
3. Body (JSON):
```json
{
    "adminId": "{{ADMIN_ID}}"
}
```

### Step 8: Test Delete Announcement
1. Set method to `DELETE`
2. URL: `{{BASE_URL}}/{{ANNOUNCEMENT_ID}}`
3. Body (JSON):
```json
{
    "adminId": "{{ADMIN_ID}}"
}
```

## ⚠️ Error Testing Scenarios

### Test Invalid Data
1. **Missing Required Fields:**
```json
{
    "title": "Test"
    // Missing description, priority, adminId
}
```
Expected: 400 Bad Request

2. **Invalid Priority:**
```json
{
    "title": "Test",
    "description": "Test description",
    "priority": "Invalid",
    "adminId": "60d5ecb54e5b2c001f5d7a2b"
}
```
Expected: 400 Bad Request

3. **Invalid Admin ID:**
```json
{
    "title": "Test",
    "description": "Test description",
    "priority": "High",
    "adminId": "invalid_id"
}
```
Expected: 400 Bad Request

### Test Authorization Errors
1. **Update without Admin ID:**
```json
{
    "title": "Updated Title"
    // Missing adminId
}
```
Expected: 400 Bad Request

2. **Wrong Admin ID for Update:**
```json
{
    "adminId": "different_admin_id",
    "title": "Updated Title"
}
```
Expected: 404 Not Found or Access Denied

## 🎯 Success Criteria
✅ All CRUD operations work correctly
✅ Proper validation and error handling
✅ Admin authorization works for updates/deletes
✅ Query filters function properly
✅ Status toggle operates correctly
✅ Priority filtering works
✅ Comprehensive logging for debugging
✅ Proper HTTP status codes returned
✅ Clean, formatted responses

## 🔧 Enhanced Features
- **Duplicate Title Prevention**: System prevents duplicate announcement titles
- **Admin Verification**: All write operations verify admin exists
- **Expiry Date Support**: Announcements can have expiry dates
- **Tags System**: Support for tagging announcements
- **Priority Filtering**: Get announcements by priority level
- **Active/Inactive Toggle**: Easy status management
- **Comprehensive Logging**: Detailed console logs for debugging
- **Flexible Queries**: Multiple query parameters for filtering
- **Virtual Properties**: isExpired calculated automatically

## 🚨 Important Notes
1. **Admin ID Required**: All create, update, delete, and toggle operations require valid adminId
2. **Priority Values**: Only "High", "Medium", "Low" are accepted
3. **Title Uniqueness**: Duplicate titles are not allowed
4. **Expiry Handling**: Expired announcements are filtered out from active queries
5. **Logging**: All operations are logged with detailed information for debugging

The announcement cards system is now fully optimized and ready for production use! 🎉