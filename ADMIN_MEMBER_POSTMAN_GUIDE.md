# 👥 POSTMAN TESTING GUIDE - Admin Member System

## 📋 System Overview
This system allows **Admins** to create member accounts through their admin panel. The admin provides member details, system auto-generates User ID, admin sets password, and data is stored in separate collections with admin tracking.

---

## 🧪 STEP-BY-STEP TESTING FLOW

### **STEP 1: Setup Admin Account (if not already done)**

#### 1a. Admin Signup
**Method:** `POST`  
**URL:** `http://localhost:8080/api/auth/signup`  
**Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

#### 1b. Admin OTP Verification
**Method:** `POST`  
**URL:** `http://localhost:8080/api/auth/verify-otp`  
**Body:**
```json
{
  "email": "admin@example.com",
  "otp": "1234"
}
```
**📝 Copy the `id` from response - this is your `adminId`**

---

### **STEP 2: Admin Creates Member**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/admin-members/create`  
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "adminId": "66f1234567890abcdef12345",
  "password": "MemberPass123",
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
**📝 Replace `adminId` with actual admin ID from Step 1**

**Expected Response:**
```json
{
  "success": true,
  "message": "Member created successfully!",
  "data": {
    "member": {
      "id": "66f...",
      "userId": "MEM2025001",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "mobile": "9876543213",
      "flatDetails": "Floor III, Flat 301",
      "parkingDetails": "P2-P2-20",
      "createdBy": "Admin"
    },
    "credentials": {
      "userId": "MEM2025001",
      "password": "MemberPass123",
      "message": "Member can now login with these credentials"
    },
    "adminInfo": {
      "createdByAdminId": "66f...",
      "adminEmail": "admin@example.com",
      "createdAt": "2025-09-27T..."
    }
  }
}
```
**🎉 System auto-generated User ID: `MEM2025001`**  
**🔑 Copy the `userId` and `password` for member login test**

---

### **STEP 3: Get All Members Created by Admin**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/admin-members/admin/{ADMIN_ID}`  
**Replace `{ADMIN_ID}` with actual admin ID**

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "66f...",
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
      "govtIdImage": "https://example.com/jane-pan.jpg",
      "createdByAdminId": "66f...",
      "memberCredentialsId": {
        "_id": "66f...",
        "userId": "MEM2025001",
        "isActive": true,
        "lastLogin": null,
        "loginCount": 0,
        "passwordSetByAdmin": true
      },
      "isActive": true,
      "createdBy": "Admin",
      "createdAt": "2025-09-27T...",
      "updatedAt": "2025-09-27T..."
    }
  ]
}
```

---

### **STEP 4: Member Login with Admin-Created Credentials**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/admin-members/member-login`  
**Body:**
```json
{
  "userId": "MEM2025001",
  "password": "MemberPass123"
}
```
**📝 Use the credentials from Step 2 response**

**Expected Response:**
```json
{
  "success": true,
  "message": "Member login successful",
  "data": {
    "member": {
      "userId": "MEM2025001",
      "id": "66f...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "mobile": "9876543213",
      "flatDetails": "Floor III, Flat 301",
      "parkingDetails": "P2-P2-20",
      "memberType": "AdminCreated"
    },
    "loginInfo": {
      "userId": "MEM2025001",
      "lastLogin": "2025-09-27T...",
      "loginCount": 1,
      "accountStatus": "Active",
      "createdByAdmin": "admin@example.com"
    }
  }
}
```

---

### **STEP 5: Admin Updates Member**
**Method:** `PUT`  
**URL:** `http://localhost:8080/api/admin-members/admin/{ADMIN_ID}/member/{MEMBER_ID}`  
**Body (example - update first name):**
```json
{
  "firstName": "Janet"
}
```

---

### **STEP 6: Admin Deletes Member**
**Method:** `DELETE`  
**URL:** `http://localhost:8080/api/admin-members/admin/{ADMIN_ID}/member/{MEMBER_ID}`  
**No body required**

---

## 🎯 TESTING SCENARIOS

### **Scenario 1: Create Multiple Members**
Use Step 2 with different member data:
```json
{
  "adminId": "YOUR_ADMIN_ID",
  "password": "Member2Pass123",
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "9876543214",
  "email": "john.doe@example.com",
  "floor": "IV",
  "flatNo": "401",
  "paymentStatus": "Available",
  "parkingArea": "P1",
  "parkingSlot": "P1-30",
  "govtIdType": "AadharCard",
  "govtIdImage": "https://example.com/john-aadhar.jpg"
}
```

### **Scenario 2: Test Invalid Admin ID**
Try Step 2 with invalid `adminId`:
```json
{
  "adminId": "invalid-admin-id",
  "password": "MemberPass123",
  // ... other fields
}
```
**Expected:** `400 Bad Request` with "Invalid adminId format"

### **Scenario 3: Test Duplicate Member**
Try creating member with same email/mobile:
**Expected:** `400 Bad Request` with "Member with this email or mobile already exists"

---

## 📊 COLLECTIONS CREATED

### **AdminMemberProfile Collection:**
- Member profile details
- `createdByAdminId` field (tracks which admin created this member)
- Link to member credentials

### **AdminMemberCredentials Collection:**
- Auto-generated User ID (MEM2025XXX format)
- Admin-set password (plain + hashed)
- `createdByAdminId` field (tracks which admin created this member)
- Login tracking (count, last login)

---

## 🎉 SUCCESS INDICATORS

After completing all tests, you should see:

✅ **Terminal Logs:** Comprehensive logging for admin member operations  
✅ **Database:** Three collections with proper relationships:
   - `adminSignup` (admin account)
   - `AdminMemberProfile` (member profiles with admin tracking)
   - `AdminMemberCredentials` (member credentials with admin tracking)

✅ **Functionality:** 
   - Admin can create members with all profile details
   - System auto-generates member User ID (MEM2025XXX format)  
   - Admin sets member password
   - Members can login with admin-created credentials
   - Admin can view only their created members
   - Complete separation from self-registration system

✅ **Admin Dashboard Ready:**
   - Admin can see all members they created
   - Member login tracking visible to admin
   - Update/delete member functionality available

🎊 **Your Admin Member System is working perfectly!**

---

## 💻 POSTMAN COLLECTION IMPORT

You can create a Postman collection with these requests or run the automated test:

```bash
node test-admin-member-system.js
```

This will test the complete flow automatically and show you exactly how the system works!