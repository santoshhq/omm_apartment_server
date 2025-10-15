# Member Forgot Password Testing Guide

## Overview
This guide provides step-by-step instructions for testing the member forgot password functionality using Postman.

## Prerequisites
1. Ensure your OMM Server is running on `http://localhost:8080`
2. Import the `Member_Forgot_Password_Postman_Collection.json` file into Postman
3. Make sure you have a member with email "john.doe@example.com" and password "MemberPass123" in your database

## Test Scenarios

### 1. Send OTP for Password Reset
**Endpoint:** `POST /api/admin-members/member-forgot-password`

**Request Body (Option 1 - Using Email):**
```json
{
  "emailId": "john.doe@example.com"
}
```

**Request Body (Option 2 - Using User ID):**
```json
{
  "userId": "123456"
}
```

**Note:** You can use either `emailId` or `userId` as the field name. Both options are supported.

**Expected Response:**
- Status: 200 OK
- Response contains OTP, userId, and email
- Check server logs for OTP email (currently logged to console)

### 2. Reset Password with OTP
**Endpoint:** `POST /api/admin-members/member-reset-password`
**Request Body (Option 1 - Using User ID):**
```json
{
  "userId": "123456",  // Use the userId from step 1 response
  "otp": "1234",       // Use the OTP from step 1
  "newPassword": "NewPassword123"
}
```

**Request Body (Option 2 - Using Email ID):**
```json
{
  "emailId": "john.doe@example.com",  // Use the email from step 1 response
  "otp": "1234",                      // Use the OTP from step 1
  "newPassword": "NewPassword123"
}
```

**Expected Response:**
- Status: 200 OK
- Password reset successful message

### 3. Verify New Password Works
**Endpoint:** `POST /api/admin-members/member-login`
**Request Body:**
```json
{
  "userId": "123456",
  "password": "NewPassword123"
}
```
**Expected Response:**
- Status: 200 OK
- JWT token returned
- Login successful

### 4. Verify Old Password No Longer Works
**Endpoint:** `POST /api/admin-members/member-login`
**Request Body:**
```json
{
  "userId": "123456",
  "password": "MemberPass123"
}
```
**Expected Response:**
- Status: 400 Bad Request
- Invalid password message

### 5. Test Error Cases
- **Invalid Email:** Use email "invalid@example.com" in forgot password request
- **Invalid OTP:** Use wrong OTP in reset password request

## Important Notes
- OTP expires after 10 minutes
- OTP is currently logged to console (not sent via email)
- Password must meet complexity requirements (8+ chars, uppercase, lowercase, number)
- All endpoints return consistent JSON response format with `success`, `message`, and `data` fields

## Collection Variables
- `base_url`: Server URL (default: http://localhost:8080)
- `member_email`: Test member email (default: john.doe@example.com)
- `member_user_id`: Test user ID (default: 123456)
- `member_password`: Original password (default: MemberPass123)
- `new_password`: New password for testing (default: NewPassword123)

## Running Tests
1. Import the collection into Postman
2. Run requests in order (1 → 2 → 3 → 4)
3. Use the OTP from request 1's response in request 2
4. All requests include automated tests to validate responses