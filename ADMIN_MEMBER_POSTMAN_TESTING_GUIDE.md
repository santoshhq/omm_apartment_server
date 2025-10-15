# Admin Member Credentials Testing Guide

## 📋 **Overview**
This guide provides step-by-step instructions for testing the complete admin member management system using Postman, including JWT authentication.

## 🚀 **Quick Start**

### **1. Import Postman Collection**
- Open Postman
- Click **Import** button
- Select **File**
- Choose `Admin_Member_Postman_Collection.json`
- Click **Import**

### **2. Set Environment Variables**
Create environment variables in Postman:
```
base_url: http://localhost:8080
admin_jwt_token: (leave empty - will be set automatically)
member_jwt_token: (leave empty - will be set automatically)
admin_id: (leave empty - will be set automatically)
member_id: (leave empty - will be set automatically)
member_user_id: (leave empty - will be set automatically)
```

## 📝 **Complete Testing Flow**

### **Step 1: Admin Signup & Login**
**Endpoint**: `POST /api/auth/signup`
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```
- **Expected**: OTP in server logs
- **Note**: Check server console for OTP

**Endpoint**: `POST /api/auth/verify-otp`
```json
{
  "email": "admin@example.com",
  "otp": "1234"
}
```
- **Expected**: JWT token in response
- **Note**: Token stored in `admin_jwt_token`

### **Step 2: Create Member (Admin Action)**
**Endpoint**: `POST /api/admin-members/create`
**Headers**:
```
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json
```
**Body**:
```json
{
  "adminId": "{{admin_id}}",
  "userId": "123456",
  "password": "MemberPass123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobile": "9876543210",
  "floor": 5,
  "flatNo": "501",
  "parkingArea": "P1",
  "parkingSlot": "S5",
  "govtIdType": "Aadhaar",
  "govtIdImage": "base64_image_data_here"
}
```
- **Expected**: Member created successfully
- **Note**: `userId` and `member_id` stored automatically

### **Step 3: Member Login**
**Endpoint**: `POST /api/admin-members/member-login`
**Body**:
```json
{
  "userId": "{{member_user_id}}",
  "password": "MemberPass123"
}
```
- **Expected**: JWT token in response
- **Note**: Token stored in `member_jwt_token`

### **Step 4: Get Members (Admin Action)**
**Endpoint**: `GET /api/admin-members/admin/{{admin_id}}`
**Headers**:
```
Authorization: Bearer {{admin_jwt_token}}
```
- **Expected**: List of members created by admin

### **Step 5: Update Member (Admin Action)**
**Endpoint**: `PUT /api/admin-members/admin/{{admin_id}}/member/{{member_id}}`
**Headers**:
```
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json
```
**Body**:
```json
{
  "firstName": "John Updated",
  "mobile": "9999999999"
}
```
- **Expected**: Member updated successfully

### **Step 6: Delete Member (Admin Action)**
**Endpoint**: `DELETE /api/admin-members/admin/{{admin_id}}/member/{{member_id}}`
**Headers**:
```
Authorization: Bearer {{admin_jwt_token}}
```
- **Expected**: Member deleted successfully

## 🔑 **JWT Token Details**

- **Admin Token**: Used for admin operations (create, update, delete members)
- **Member Token**: Used for member-specific operations
- **Validity**: 365 days
- **Secret**: `omm$8462@$`

## 📊 **Expected Responses**

### **Create Member Success**
```json
{
  "success": true,
  "message": "Member created successfully!",
  "data": {
    "member": {
      "id": "...",
      "userId": "123456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "flatDetails": "Floor 5, Flat 501"
    }
  }
}
```

### **Member Login Success**
```json
{
  "success": true,
  "message": "Member login successful",
  "data": {
    "member": {
      "userId": "123456",
      "firstName": "John",
      "lastName": "Doe",
      "flatDetails": "Floor 5, Flat 501"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "loginInfo": {
      "loginCount": 1
    }
  }
}
```

## 🧪 **Automated Tests Included**

Each request includes automated tests that verify:
- ✅ HTTP status codes
- ✅ Response structure validation
- ✅ JWT token format validation
- ✅ Variable storage for subsequent requests

## 🔒 **Security Features**

- JWT authentication required for admin operations
- Admin ID validation for member management
- Password hashing with bcrypt
- Unique user ID generation
- Email uniqueness validation

## 📞 **Troubleshooting**

### **"Admin not found or not verified"**
- Ensure admin is registered and OTP verified
- Check `admin_id` variable is set correctly

### **"User ID already exists"**
- Use a different 6-digit user ID
- User IDs must be unique across all members

### **"Invalid password" (Member Login)**
- Use the password set during member creation
- Passwords are case-sensitive

### **"Member profile not found"**
- Run the member credentials fix script
- Check database for corrupted records

### **JWT Token Issues**
- Ensure tokens are not expired (365 days)
- Check Authorization header format: `Bearer <token>`

## 🛠️ **Fix Corrupted Data**

If you encounter "Member profile not found" errors, run:
```bash
node fix-member-credentials.js
```

## 📱 **API Endpoints Summary**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Admin signup | No |
| POST | `/api/auth/verify-otp` | Verify admin OTP | No |
| POST | `/api/admin-members/create` | Create member | Admin JWT |
| GET | `/api/admin-members/admin/:adminId` | Get members | Admin JWT |
| POST | `/api/admin-members/member-login` | Member login | No |
| PUT | `/api/admin-members/admin/:adminId/member/:memberId` | Update member | Admin JWT |
| DELETE | `/api/admin-members/admin/:adminId/member/:memberId` | Delete member | Admin JWT |

## 🎯 **Testing Checklist**

- [ ] Admin signup and OTP verification
- [ ] Admin JWT token generation
- [ ] Member creation with admin token
- [ ] Member login and JWT token generation
- [ ] Get members list (admin only)
- [ ] Update member details (admin only)
- [ ] Delete member (admin only)
- [ ] Error handling for invalid tokens
- [ ] Error handling for unauthorized access

Your admin member management system is now ready for comprehensive testing! 🎉