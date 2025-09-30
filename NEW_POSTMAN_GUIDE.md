# 🚀 POSTMAN TESTING GUIDE - Admin Member Management System

## 📋 Prerequisites
1. Make sure your server is running: `node index.js`
2. Server should be accessible at: `http://localhost:8080`
3. Open Postman application

---

## 🧪 STEP-BY-STEP TESTING FLOW

### **STEP 1: Test Server C### **AdminMemberCredentials Collection:**
   - Member login credentials (User ID + Password + Email)
   - Links to profile and admin
   - Email field for easier access and potential email-based loginection**
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
    "profileId": "66f...",
    "credentialsId": "66f..."
  }
}
```

---

### **STEP 6: Admin Views All Created Members**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/admin-member/admin-members/{ADMIN_ID}`  
**Headers:**
```
Content-Type: application/json
```

**📝 Replace `{ADMIN_ID}` with the actual admin ID from Step 3**

**Example URL:**
```
http://localhost:8080/api/admin-member/admin-members/66f1234567890abcdef12345
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin members retrieved successfully",
  "data": {
    "adminId": "66f1234567890abcdef12345",
    "totalMembers": 1,
    "members": [
      {
        "profile": {
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane.smith@example.com",
          "mobile": "9876543213",
          "flatDetails": "Floor III, Flat 301",
          "parkingDetails": "P2-P2-20"
        },
        "credentials": {
          "userId": "123456",
          "hasPassword": true
        },
        "createdAt": "2025-09-27T..."
      }
    ]
  }
}
```

---

## 🎯 Quick Test Summary

1. ✅ **Admin Signup** → Get OTP
2. ✅ **Verify OTP** → Get Admin ID  
3. ✅ **Admin Creates Member** → With 6-digit User ID
4. ✅ **Member Login** → Using admin-created credentials
5. ✅ **Admin Views Members** → See all created members

---

## 🚨 Common Errors & Solutions

### ❌ "User ID must be exactly 6 digits"
**Solution:** Ensure `adminSetUserId` is exactly 6 numeric digits
```json
✅ Correct: "adminSetUserId": "123456"
❌ Wrong: "adminSetUserId": "12345" (5 digits)
❌ Wrong: "adminSetUserId": "1234567" (7 digits)
❌ Wrong: "adminSetUserId": "12345a" (contains letter)
```

### ❌ "User ID already exists"
**Solution:** Use a different 6-digit number
```json
✅ Try: "adminSetUserId": "654321"
```

### ❌ "Email already exists"
**Solution:** Use a different email for each member
```json
✅ Try: "email": "member2@example.com"
```

### ❌ "Admin not found"
**Solution:** Verify the adminId from Step 3 response
```json
// Copy exactly from Step 3 response:
{
  "data": {
    "id": "66f1234567890abcdef12345"  // ← Use this as adminId
  }
}
```

---

## 📦 Postman Collection Setup

### Create New Collection:
1. Click "New" → "Collection"
2. Name: "Admin Member Management System"
3. Add all the above requests as separate items

### Variables Setup:
- `baseURL`: `http://localhost:8080/api`
- `adminId`: (will be filled from Step 3 response)
- `memberUserId`: `123456`

---

## 🔍 What Gets Created

When you run this test flow:

1. **AdminSignup Collection:**
   - Admin account with email/password
   - OTP verification status

2. **AdminMemberProfile Collection:**
   - Member profile with all details
   - Links to admin who created it

3. **AdminMemberCredentials Collection:**
   - Member login credentials (User ID + Password)
   - Links to profile and admin

---

## ✨ Key Features Tested

1. 🔐 Admin registration and verification
2. 👥 Admin creates member accounts
3. 🆔 Manual 6-digit User ID entry with validation
4. 🔑 Member login with admin-created credentials
5. 📋 Admin can view all created members
6. ✅ Complete separation from self-registration system

---

**🎉 Your Admin Member Management System is ready for testing!**