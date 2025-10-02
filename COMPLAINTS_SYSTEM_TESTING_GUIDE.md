# 📝 COMPLAINTS SYSTEM - COMPLETE TESTING GUIDE

## 🔧 System Overview
The complaints system has been fully optimized with enhanced validation, error handling, logging, and comprehensive CRUD operations.

## 🚀 API Base URL
```
http://localhost:3000/api/complaints
```

## 📋 Complete API Endpoints Testing

### 1. ➕ **CREATE COMPLAINT**
**Endpoint:** `POST /api/complaints/create`

**Request Body:**
```json
{
    "userId": "60d5ecb54e5b2c001f5d7a2b",
    "createdByadmin": "60d5ecb54e5b2c001f5d7a2c",
    "title": "Water Leakage in Apartment 301",
    "description": "There is a continuous water leakage from the ceiling in the living room. This started yesterday evening and is getting worse.",
    "priority": "High"
}
```

**Expected Response (201):**
```json
{
    "success": true,
    "message": "Complaint created successfully",
    "data": {
        "id": "...generated_id...",
        "title": "Water Leakage in Apartment 301",
        "description": "There is a continuous water leakage...",
        "status": "pending",
        "priority": "High",
        "userId": {
            "firstName": "John",
            "flatNo": "301",
            "email": "john@example.com"
        },
        "createdByadmin": {
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
        },
        "createdAt": "2025-10-02T10:00:00.000Z"
    }
}
```

### 2. 📋 **GET ALL COMPLAINTS FOR ADMIN**
**Endpoint:** `GET /api/complaints/admin/:adminId`

**Query Parameters (Optional):**
- `status=pending` - Filter by status
- `priority=High` - Filter by priority

**Examples:**
```
GET /api/complaints/admin/60d5ecb54e5b2c001f5d7a2c
GET /api/complaints/admin/60d5ecb54e5b2c001f5d7a2c?status=pending
GET /api/complaints/admin/60d5ecb54e5b2c001f5d7a2c?priority=High
GET /api/complaints/admin/60d5ecb54e5b2c001f5d7a2c?status=pending&priority=High
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Found 5 complaints",
    "data": [
        {
            "id": "complaint_id_1",
            "title": "Water Leakage in Apartment 301",
            "description": "There is a continuous water leakage...",
            "status": "pending",
            "priority": "High",
            "userId": {
                "firstName": "John",
                "flatNo": "301",
                "email": "john@example.com"
            },
            "createdByadmin": {
                "firstName": "Admin",
                "lastName": "User"
            },
            "createdAt": "2025-10-02T10:00:00.000Z",
            "updatedAt": "2025-10-02T10:00:00.000Z"
        }
    ]
}
```

### 3. 🔍 **GET COMPLAINT DETAILS WITH MESSAGES**
**Endpoint:** `GET /api/complaints/:id`

**Example:** `GET /api/complaints/60d5ecb54e5b2c001f5d7a2d`

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Complaint details retrieved successfully",
    "data": {
        "complaint": {
            "id": "60d5ecb54e5b2c001f5d7a2d",
            "title": "Water Leakage in Apartment 301",
            "description": "There is a continuous water leakage...",
            "status": "pending",
            "priority": "High",
            "userId": {
                "firstName": "John",
                "flatNo": "301",
                "email": "john@example.com"
            },
            "createdByadmin": {
                "firstName": "Admin",
                "lastName": "User"
            },
            "createdAt": "2025-10-02T10:00:00.000Z",
            "updatedAt": "2025-10-02T10:00:00.000Z"
        },
        "messages": [
            {
                "_id": "message_id_1",
                "complaintId": "60d5ecb54e5b2c001f5d7a2d",
                "senderId": {
                    "firstName": "John",
                    "lastName": "Doe"
                },
                "message": "The leakage is getting worse",
                "timestamp": "2025-10-02T11:00:00.000Z"
            }
        ]
    }
}
```

### 4. 🏷️ **GET COMPLAINTS BY STATUS**
**Endpoint:** `GET /api/complaints/admin/:adminId/status/:status`

**Valid Statuses:** pending, solved, unsolved

**Examples:**
```
GET /api/complaints/admin/60d5ecb54e5b2c001f5d7a2c/status/pending
GET /api/complaints/admin/60d5ecb54e5b2c001f5d7a2c/status/solved
GET /api/complaints/admin/60d5ecb54e5b2c001f5d7a2c/status/unsolved
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Found 3 pending complaints",
    "data": [
        {
            "id": "complaint_id",
            "title": "Water Leakage in Apartment 301",
            "description": "There is a continuous water leakage...",
            "status": "pending",
            "priority": "High",
            "userId": {
                "firstName": "John",
                "flatNo": "301"
            },
            "createdAt": "2025-10-02T10:00:00.000Z",
            "updatedAt": "2025-10-02T10:00:00.000Z"
        }
    ]
}
```

### 5. ✏️ **UPDATE COMPLAINT STATUS**
**Endpoint:** `PUT /api/complaints/status/:id`

**Request Body:**
```json
{
    "status": "solved",
    "adminId": "60d5ecb54e5b2c001f5d7a2c"
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Complaint status updated successfully",
    "data": {
        "id": "complaint_id",
        "title": "Water Leakage in Apartment 301",
        "status": "solved",
        "priority": "High",
        "userId": {
            "firstName": "John",
            "flatNo": "301"
        },
        "createdByadmin": {
            "firstName": "Admin",
            "lastName": "User"
        },
        "updatedAt": "2025-10-02T12:00:00.000Z"
    }
}
```

## 🧪 **Postman Testing Sequence**

### Step 1: Setup Environment Variables
```
BASE_URL = http://localhost:3000/api/complaints
ADMIN_ID = 60d5ecb54e5b2c001f5d7a2c
USER_ID = 60d5ecb54e5b2c001f5d7a2b
COMPLAINT_ID = (will be filled after creating)
```

### Step 2: Test Create Complaint
1. Set method to `POST`
2. URL: `{{BASE_URL}}/create`
3. Body (JSON):
```json
{
    "userId": "{{USER_ID}}",
    "createdByadmin": "{{ADMIN_ID}}",
    "title": "Test Complaint - AC Not Working",
    "description": "The air conditioning unit in apartment 205 has stopped working completely. The room temperature is unbearable.",
    "priority": "High"
}
```
4. Send request and save `id` from response

### Step 3: Test Get All Complaints
1. Set method to `GET`
2. URL: `{{BASE_URL}}/admin/{{ADMIN_ID}}`
3. Test with query parameters:
   - `{{BASE_URL}}/admin/{{ADMIN_ID}}?status=pending`
   - `{{BASE_URL}}/admin/{{ADMIN_ID}}?priority=High`

### Step 4: Test Get Single Complaint
1. Set method to `GET`
2. URL: `{{BASE_URL}}/{{COMPLAINT_ID}}`

### Step 5: Test Get by Status
1. Set method to `GET`
2. URL: `{{BASE_URL}}/admin/{{ADMIN_ID}}/status/pending`

### Step 6: Test Update Status
1. Set method to `PUT`
2. URL: `{{BASE_URL}}/status/{{COMPLAINT_ID}}`
3. Body (JSON):
```json
{
    "status": "solved",
    "adminId": "{{ADMIN_ID}}"
}
```

## ⚠️ **Error Testing Scenarios**

### Test Invalid Data
1. **Missing Required Fields:**
```json
{
    "title": "Test Complaint"
    // Missing userId, createdByadmin, description
}
```
Expected: 400 Bad Request

2. **Invalid Status:**
```json
{
    "status": "invalid_status",
    "adminId": "60d5ecb54e5b2c001f5d7a2c"
}
```
Expected: 400 Bad Request

3. **Invalid Priority:**
```json
{
    "userId": "60d5ecb54e5b2c001f5d7a2b",
    "createdByadmin": "60d5ecb54e5b2c001f5d7a2c",
    "title": "Test",
    "description": "Test description",
    "priority": "Critical"
}
```
Expected: 400 Bad Request

### Test Authorization Errors
1. **Update without Admin ID:**
```json
{
    "status": "solved"
    // Missing adminId
}
```
Expected: 400 Bad Request

2. **Wrong Admin ID for Update:**
```json
{
    "status": "solved",
    "adminId": "different_admin_id"
}
```
Expected: 404 Not Found or Access Denied

## 🎯 **Success Criteria**
✅ All CRUD operations work correctly
✅ Proper validation and error handling
✅ Admin authorization works for updates
✅ Query filters function properly
✅ Status updates operate correctly
✅ Priority filtering works
✅ Messages integration works
✅ Comprehensive logging for debugging
✅ Proper HTTP status codes returned
✅ Clean, formatted responses

## 🔧 **Enhanced Features**
- **Priority System**: Support for High/Medium/Low priority complaints
- **Status Management**: Easy tracking of pending/solved/unsolved complaints
- **Admin Authorization**: Secure operations with admin verification
- **Filter Support**: Multiple query parameters for flexible filtering
- **Messages Integration**: Complaint details include associated messages
- **Comprehensive Logging**: Detailed console logs for debugging
- **Validation**: Strong input validation at multiple layers
- **Error Handling**: Graceful error responses with meaningful messages

## 🚨 **Important Notes**
1. **Admin ID Required**: All update operations require valid adminId for authorization
2. **Status Values**: Only "pending", "solved", "unsolved" are accepted
3. **Priority Values**: Only "High", "Medium", "Low" are accepted
4. **User Reference**: userId must reference existing AdminMemberProfile
5. **Admin Reference**: createdByadmin must reference existing adminSignup
6. **Messages Integration**: Complaint details automatically include related messages

The complaints system is now fully optimized and ready for production use! 🎉