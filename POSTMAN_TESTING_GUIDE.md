# 🚀 POSTMAN TESTING GUIDE - Admin Member Management System

## 📋 Prerequisites
1. Make sure your server is running: `node index.js`
2. Server should be accessible at: `http://localhost:8080`
3. Open Postman application

---

## 🧪 STEP-BY-STEP TESTING FLOW

### **STEP 1: Test Server Connection**
**Method:** `GET`  
**URL:** `http://localhost:8080/`  
**Expected Response:**
```json
"Hello World!"
```

---

### **STEP 2: Admin Signup**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/auth/signup`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```
**Expected Response:**
```json
{
  "status": true,
  "message": "User registered successfully. OTP sent to your email. Please verify within 10 minutes.",
  "data": {
    "id": "66f...",
    "email": "admin@example.com",
    "otp": "1234",
    "expiresAt": "2025-09-27T..."
  }
}
```
**📝 Note:** Copy the `otp` value for next step!

---

### **STEP 3: Verify Admin OTP**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/auth/verify-otp`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "admin@example.com",
  "otp": "1234"
}
```
**Expected Response:**
```json
{
  "status": true,
  "message": "Email verified successfully. You can now login.",
  "data": {
    "id": "66f...",
    "email": "admin@example.com",
    "verifiedAt": "2025-09-27T..."
  }
}
```
**📝 Note:** Copy the `id` value as `adminId` for next step!

---

### **STEP 4: Admin Creates Member Account (🔑 Manual 6-Digit User ID)**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/admin-member/create-member`  
**Headers:**
```
Content-Type: application/json
```
#### 4a. With Parking Assignment
**Body (raw JSON):**
```json
{
  "adminId": "66f1234567890abcdef12345",
  "adminSetUserId": "123456",
  "adminSetPassword": "MemberPass123",
  "profileImage": "https://example.com/member-profile.jpg",
  "firstName": "Jane",
  "lastName": "Smith",
  "mobile": "9876543213",
  "email": "jane.smith@example.com",
  "floor": "III",
  "flatNo": "301",
  "paymentStatus": "Booked",
  "parkingArea": "P2",
  "parkingSlot": "P2-20",
  "govtIdType": "PanCard",
  "govtIdImage": "https://example.com/jane-pan.jpg"
}
```

#### 4b. Without Parking Assignment (Empty Strings)
**Body (raw JSON):**
```json
{
  "adminId": "66f1234567890abcdef12345",
  "adminSetUserId": "123457",
  "adminSetPassword": "MemberPass456",
  "profileImage": "https://example.com/member2-profile.jpg",
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "9876543214",
  "email": "john.doe@example.com",
  "floor": "II",
  "flatNo": "201",
  "paymentStatus": "Available",
  "parkingArea": "",
  "parkingSlot": "",
  "govtIdType": "AadharCard",
  "govtIdImage": "https://example.com/john-aadhar.jpg"
}
```

#### 4c. Without Parking Assignment (Fields Omitted)
**Body (raw JSON):**
```json
{
  "adminId": "66f1234567890abcdef12345",
  "adminSetUserId": "123458",
  "adminSetPassword": "MemberPass789",
  "profileImage": "https://example.com/member3-profile.jpg",
  "firstName": "Alice",
  "lastName": "Johnson",
  "mobile": "9876543215",
  "email": "alice.johnson@example.com",
  "floor": "IV",
  "flatNo": "401",
  "paymentStatus": "Pending",
  "govtIdType": "VoterID",
  "govtIdImage": "https://example.com/alice-voter.jpg"
}
```

**📝 IMPORTANT FIELDS:**
- `adminId`: Use the `id` from Step 3 (Verify OTP) response
- `adminSetUserId`: Must be exactly 6 digits (e.g., "123456")  
- `adminSetPassword`: Password that admin sets for the member
- `email`: Must be different from admin's email

**Expected Response:**
```json
{
  "success": true,
  "message": "Member account created successfully by admin!",
  "data": {
    "profile": {
      "id": "66f...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "mobile": "9876543213",
      "flatDetails": "Floor III, Flat 301",
      "parkingDetails": "P2-P2-20",
      "createdByAdminId": "66f1234567890abcdef12345"
    },
    "credentials": {
      "userId": "123456",
      "password": "MemberPass123",
      "message": "Member can now login with these credentials"
    }
  }
}
```

---

### **STEP 5: Member Login with Admin-Created Credentials**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/admin-member/member-login`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "userId": "123456",
  "password": "MemberPass123"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Member login successful!",
  "data": {
    "userId": "123456",
    "memberDetails": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "mobile": "9876543213",
      "flatDetails": "Floor III, Flat 301",
      "parkingDetails": "P2-P2-20"
    },
      "lastLogin": "2025-09-27T...",
      "loginCount": 1,
      "accountStatus": "Active"
    }
  }
}
```

---

### **STEP 6: Update Member Profile (All Fields Except userId/password)**
**Method:** `PUT`  
**URL:** `http://localhost:8080/api/admin-member/admin/{adminId}/member/{memberId}`  
**Headers:**
```
Content-Type: application/json
```

#### 6a. Basic Information Update
**Body (raw JSON):**
```json
{
  "firstName": "Jane Updated",
  "lastName": "Smith Updated",
  "mobile": "9876543214",
  "profileImage": "https://example.com/jane-updated.jpg"
}
```

#### 6b. Address and Parking Update
**Body (raw JSON):**
```json
{
  "floor": "IV",
  "flatNo": "401",
  "parkingArea": "P3",
  "parkingSlot": "P3-25"
}
```

#### 6c. Email and Payment Status Update
**Body (raw JSON):**
```json
{
  "email": "jane.updated@example.com",
  "paymentStatus": "Paid",
  "govtIdType": "DrivingLicense",
  "govtIdImage": "https://example.com/jane-dl.jpg"
}
```

#### 6d. Complete Profile Update (All Updatable Fields)
**Body (raw JSON):**
```json
{
  "profileImage": "https://example.com/jane-complete.jpg",
  "firstName": "Jane Complete",
  "lastName": "Smith Complete",
  "mobile": "9876543215",
  "email": "jane.complete@example.com",
  "floor": "V",
  "flatNo": "501",
  "paymentStatus": "Paid",
  "parkingArea": "P4",
  "parkingSlot": "P4-30",
  "govtIdType": "VoterID",
  "govtIdImage": "https://example.com/jane-voter.jpg"
}
```

#### 6e. Remove Parking Assignment (Empty Strings)
**Body (raw JSON):**
```json
{
  "parkingArea": "",
  "parkingSlot": ""
}
```

#### 6f. Remove Parking Assignment (Null Values)
**Body (raw JSON):**
```json
{
  "parkingArea": null,
  "parkingSlot": null
}
```

#### 6g. Add Parking to Member Without Parking
**Body (raw JSON):**
```json
{
  "parkingArea": "P3",
  "parkingSlot": "P3-25"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Member profile updated successfully",
  "data": {
    "updatedMember": {
      "id": "66f...",
      "firstName": "Jane Complete",
      "lastName": "Smith Complete",
      "email": "jane.complete@example.com",
      "mobile": "9876543215",
      "flatDetails": "Floor V, Flat 501",
      "parkingDetails": "P4-P4-30",
      "paymentStatus": "Paid"
    },
    "changes": {
      "fieldsUpdated": ["firstName", "lastName", "mobile", "email", "floor", "flatNo"],
      "oldValues": {
        "firstName": "Jane",
        "lastName": "Smith",
        "mobile": "9876543213",
        "email": "jane.smith@example.com"
      },
      "newValues": {
        "firstName": "Jane Complete",
        "lastName": "Smith Complete",
        "mobile": "9876543215",
        "email": "jane.complete@example.com"
      }
    }
  }
}
```

#### 🚫 Testing Forbidden Updates (Should Return Error)
**Body (raw JSON):**
```json
{
  "userId": "999999",
  "password": "NewPassword123",
  "firstName": "Should Not Update"
}
```
**Expected Error Response:**
```json
{
  "success": false,
  "message": "Cannot update userId or password through this endpoint",
  "allowedFields": ["profileImage", "firstName", "lastName", "mobile", "email", "floor", "flatNo", "paymentStatus", "parkingArea", "parkingSlot", "govtIdType", "govtIdImage"]
}
```

**📝 UPDATABLE FIELDS:**
- ✅ `profileImage` - Profile picture URL
- ✅ `firstName` - First name
- ✅ `lastName` - Last name  
- ✅ `mobile` - Mobile number (with uniqueness validation)
- ✅ `email` - Email address (with uniqueness validation, auto-syncs to credentials)
- ✅ `floor` - Floor number
- ✅ `flatNo` - Flat number
- ✅ `paymentStatus` - Payment status (Booked/Paid/Due)
- ✅ `parkingArea` - Parking area
- ✅ `parkingSlot` - Parking slot number
- ✅ `govtIdType` - Government ID type
- ✅ `govtIdImage` - Government ID image URL

**🚫 PROTECTED FIELDS:**
- ❌ `userId` - Cannot be changed (permanent 6-digit identifier)
- ❌ `password` - Cannot be changed through update endpoint

---

### **STEP 7: Get All Members (Admin View)**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/admin-member/admin/{adminId}`  
**Expected Response:**
```json
{
  "success": true,
  "message": "Members retrieved successfully",
  "data": {
    "totalMembers": 1,
    "members": [
      {
        "id": "66f...",
        "profile": {
          "firstName": "Jane Complete",
          "lastName": "Smith Complete",
          "email": "jane.complete@example.com",
          "mobile": "9876543215",
          "flatDetails": "Floor V, Flat 501",
          "parkingDetails": "P4-P4-30",
          "paymentStatus": "Paid"
        },
        "credentials": {
          "userId": "123456",
          "lastLogin": "2025-01-01T...",
          "loginCount": 1
        }
      }
    ]
  }
}
```

---

### **STEP 8: Get All Profiles (Legacy - Will Be Removed)**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/complete-profile/all`  
**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "66f...",
      "profileImage": "https://example.com/profile.jpg",
      "firstName": "John",
      "lastName": "Doe",
      "mobile": "9876543210",
      "email": "john.doe@example.com",
      "floor": "II",
      "flatNo": "201",
      "paymentStatus": "Booked",
      "parkingArea": "P1",
      "parkingSlot": "P1-15",
      "govtIdType": "AadharCard",
      "govtIdImage": "https://example.com/aadhar.jpg",
      "isProfileComplete": true,
      "signupId": {
        "_id": "66f...",
        "email": "john.doe@example.com",
        "isVerified": true,
        "createdAt": "2025-09-27T..."
      },
      "credentialsId": {
        "_id": "66f...",
        "userId": "OMM2025001",
        "isActive": true,
        "lastLogin": "2025-09-27T...",
        "loginCount": 1
      },
      "createdAt": "2025-09-27T...",
      "updatedAt": "2025-09-27T..."
    }
  ]
}
```

---

## 🔧 ADDITIONAL TESTS

### **Test 7: Get Profile by Signup ID**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/complete-profile/profile/{SIGNUP_ID}`  
Replace `{SIGNUP_ID}` with actual signup ID from Step 3 response.

### **Test 8: Test Original Login Still Works**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/auth/login`  
**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "TestPass123"
}
```

---

## 🎯 VALIDATION TESTS

### **Test Invalid Profile Creation (Missing Fields)**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/complete-profile/create`  
**Body (missing required fields):**
```json
{
  "firstName": "John",
  "email": "john.doe@example.com"
}
```
**Expected:** `400 Bad Request` with validation error

### **Test Invalid Login Credentials**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/complete-profile/login`  
**Body:**
```json
{
  "userId": "INVALID001",
  "password": "wrongpass"
}
```
**Expected:** `401 Unauthorized` with invalid credentials error

---

## 📊 POSTMAN COLLECTION SETUP

### Create a New Collection:
1. Open Postman
2. Click "New" → "Collection"
3. Name it: "Complete Profile System"
4. Add all the above requests to this collection

### Environment Variables (Optional):
Create environment variables for reusability:
- `base_url`: `http://localhost:8080`
- `test_email`: `john.doe@example.com`
- `test_password`: `TestPass123`
- `generated_userId`: (set after Step 4)
- `generated_password`: (set after Step 4)

---

## 🚨 TROUBLESHOOTING

### If Server Not Responding:
```bash
# Start the server
node index.js

# Should show:
# 🚀 Server is running on port 8080
# 🌍 Environment: development
# 📍 Server URL: http://localhost:8080
# 🔗 MongoDB connected successfully
```

### If Database Connection Issues:
- Check MongoDB is running
- Verify `.env` file exists with correct DB connection string

### If Environment Variables Not Loading:
- Ensure `.env` file is in root directory
- Check that `dotenv` package is installed: `npm install dotenv`

---

## 🎉 SUCCESS INDICATORS

After completing all tests, you should see:

✅ **Terminal Logs:** Comprehensive logging for all operations  
✅ **Database:** Three collections with linked data:
   - `adminSignup` (original user with `isProfile: true`)
   - `CompleteProfile` (complete user profile)
   - `UserCredentials` (auto-generated login credentials)

✅ **Functionality:** 
   - Auto-generated User ID (format: OMM2025XXX)
   - Auto-generated secure password
   - Separate credential storage
   - Successful login with generated credentials
   - Complete profile data retrieval

🎊 **Your system is working perfectly if all tests pass!**