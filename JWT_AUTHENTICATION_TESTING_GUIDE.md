# JWT Authentication Testing Guide

## 📋 **Overview**
This guide provides step-by-step instructions for testing JWT authentication in your OMM Server application.

## 🚀 **Quick Start**

### **1. Import Postman Collection**
- Open Postman
- Click **Import** button
- Select **File**
- Choose `JWT_Authentication_Postman_Collection.json`
- Click **Import**

### **2. Set Environment Variables**
In Postman, create a new environment or update existing one with:
```
base_url: http://localhost:8080
jwt_token: (leave empty - will be set automatically)
admin_email: testadmin@example.com
admin_password: TestPassword123
```

## 📝 **Testing Flow**

### **Step 1: Admin Signup**
- **Endpoint**: `POST /api/auth/signup`
- **Body**:
```json
{
  "email": "testadmin@example.com",
  "password": "TestPassword123"
}
```
- **Expected Response**: OTP sent to email (check server logs for OTP)

### **Step 2: Verify OTP (Get JWT)**
- **Endpoint**: `POST /api/auth/verify-otp`
- **Body**:
```json
{
  "email": "testadmin@example.com",
  "otp": "1234"
}
```
- **Expected Response**: JWT token in response
- **Note**: Token is automatically stored in `jwt_token` variable

### **Step 3: Admin Login (Alternative JWT)**
- **Endpoint**: `POST /api/auth/login`
- **Body**:
```json
{
  "email": "testadmin@example.com",
  "password": "TestPassword123"
}
```
- **Expected Response**: JWT token in response
- **Note**: This also stores the token in `jwt_token` variable

### **Step 4: Test Protected Route**
- **Endpoint**: `GET /api/admin-profiles`
- **Headers**: `Authorization: Bearer {{jwt_token}}`
- **Expected Response**: Should work with valid token

### **Step 5: Test Invalid Token**
- **Endpoint**: `GET /api/admin-profiles`
- **Headers**: `Authorization: Bearer invalid.jwt.token`
- **Expected Response**: 403 Forbidden

### **Step 6: Test Missing Token**
- **Endpoint**: `GET /api/admin-profiles`
- **Headers**: (none)
- **Expected Response**: 401 Unauthorized

## 🔑 **JWT Token Details**

- **Secret Key**: `omm$8462@$`
- **Validity**: 365 days
- **Algorithm**: HS256

### **Token Payload Structure**
```json
{
  "id": "admin_mongodb_id",
  "email": "admin@example.com",
  "type": "admin",
  "iat": 1634234567,
  "exp": 1665770567
}
```

## 🧪 **Automated Tests Included**

Each request includes automated tests that verify:
- ✅ Correct HTTP status codes
- ✅ Response structure validation
- ✅ JWT token format validation
- ✅ Token storage for subsequent requests

## 📊 **Response Examples**

### **Signup Response**
```json
{
  "status": true,
  "message": "User registered successfully. OTP sent to your email...",
  "data": {
    "id": "...",
    "email": "testadmin@example.com",
    "otp": "1234",
    "expiresAt": "2025-10-14T..."
  }
}
```

### **OTP Verification Response**
```json
{
  "status": true,
  "message": "Email verified successfully. You can now login.",
  "data": {
    "id": "...",
    "email": "testadmin@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "verifiedAt": "2025-10-14T..."
  }
}
```

### **Login Response**
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "id": "...",
    "email": "testadmin@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "isVerified": true,
    "isProfile": false,
    "loginAt": "2025-10-14T..."
  }
}
```

## 🔒 **Security Notes**

- JWT tokens are valid for 365 days
- Tokens are stateless (no server-side storage required)
- Use HTTPS in production
- Store tokens securely in client applications
- Implement token refresh logic for long-lived sessions

## 🐛 **Troubleshooting**

### **OTP Not Working**
- Check server console logs for the actual OTP
- OTP expires in 10 minutes by default

### **Token Not Working**
- Verify token format starts with "eyJ"
- Check token expiration (365 days)
- Ensure correct Authorization header format: `Bearer <token>`

### **Server Connection Issues**
- Ensure server is running on `http://localhost:8080`
- Check for any CORS issues
- Verify API_PREFIX environment variable

## 📞 **Support**

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and connected
4. Test with the provided Postman collection