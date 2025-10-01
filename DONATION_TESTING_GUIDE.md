# Event Card Donation Testing Guide with Postman

## 🎯 **Donation System Overview:**

### **How It Works:**
1. Users make donations to specific event cards
2. Each donation is recorded with userId, amount, and timestamp
3. The event's `collectedamount` is automatically updated
4. All donations are stored in the `donations` array

### **Current Implementation:**
- **Route:** `POST /api/events/:id/donate`
- **Controller:** `EventCardController.addDonation`
- **Service:** `EventCardService.addDonation`

## 🧪 **Complete Testing Process:**

### **Prerequisites:**
1. **Server Running:** Make sure your server is running on port 8080
2. **Event Card ID:** You need an existing event card ID
3. **User ID:** You need a valid user ID (from user signup)

### **Step 1: Start Your Server**
```bash
node index.js
```
Expected output:
```
🚀 Server is running on port 8080
🌍 Environment: development
📍 Server URL: http://localhost:8080
```

### **Step 2: Get Available Event Cards**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/events`  
**Purpose:** Get list of events to find an event ID for testing

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "67018c5e4b8f9a12345678ab",
      "name": "Festival Event",
      "targetamount": 10000,
      "collectedamount": 500,
      "donations": [
        {
          "userId": "user123",
          "amount": 500,
          "date": "2025-10-01T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

### **Step 3: Test Single Donation**

#### **Test Case 1: Valid Donation**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/events/YOUR_EVENT_ID/donate`  
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "userId": "670123456789abcdef123456",
  "amount": 1000
}
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Donation added successfully",
  "data": {
    "id": "67018c5e4b8f9a12345678ab",
    "name": "Festival Event",
    "targetamount": 10000,
    "collectedamount": 1500,
    "donations": [
      {
        "userId": "user123",
        "amount": 500,
        "date": "2025-10-01T10:30:00.000Z"
      },
      {
        "userId": "670123456789abcdef123456",
        "amount": 1000,
        "date": "2025-10-01T11:00:00.000Z"
      }
    ]
  }
}
```

#### **Test Case 2: Multiple Donations from Same User**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/events/YOUR_EVENT_ID/donate`  
**Body:**
```json
{
  "userId": "670123456789abcdef123456",
  "amount": 2500
}
```

#### **Test Case 3: Multiple Donations from Different Users**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/events/YOUR_EVENT_ID/donate`  
**Body:**
```json
{
  "userId": "670987654321fedcba987654",
  "amount": 750
}
```

### **Step 4: Test Error Cases**

#### **Test Case 4: Missing User ID**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/events/YOUR_EVENT_ID/donate`  
**Body:**
```json
{
  "amount": 1000
}
```
**Expected Error Response:**
```json
{
  "success": false,
  "message": "Error adding donation",
  "error": "userId is required"
}
```

#### **Test Case 5: Missing Amount**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/events/YOUR_EVENT_ID/donate`  
**Body:**
```json
{
  "userId": "670123456789abcdef123456"
}
```

#### **Test Case 6: Invalid Event ID**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/events/invalid_event_id/donate`  
**Body:**
```json
{
  "userId": "670123456789abcdef123456",
  "amount": 1000
}
```
**Expected Error Response:**
```json
{
  "success": false,
  "message": "Event card not found"
}
```

#### **Test Case 7: Negative Amount**
**Method:** `POST`  
**URL:** `http://localhost:8080/api/events/YOUR_EVENT_ID/donate`  
**Body:**
```json
{
  "userId": "670123456789abcdef123456",
  "amount": -500
}
```

### **Step 5: Verify Donation Updates**

#### **Check Updated Event Data**
**Method:** `GET`  
**URL:** `http://localhost:8080/api/events/YOUR_EVENT_ID`  

**Verify:**
- ✅ `collectedamount` increased by donation amount
- ✅ New donation added to `donations` array
- ✅ Donation has correct `userId`, `amount`, and `date`

## 📊 **Sample Testing Sequence:**

### **Complete Test Flow:**
```bash
# 1. Get all events
GET http://localhost:8080/api/events

# 2. Copy an event ID from response
# 3. Make first donation
POST http://localhost:8080/api/events/67018c5e4b8f9a12345678ab/donate
{
  "userId": "user001",
  "amount": 1000
}

# 4. Make second donation (same user)
POST http://localhost:8080/api/events/67018c5e4b8f9a12345678ab/donate
{
  "userId": "user001", 
  "amount": 500
}

# 5. Make third donation (different user)
POST http://localhost:8080/api/events/67018c5e4b8f9a12345678ab/donate
{
  "userId": "user002",
  "amount": 2000
}

# 6. Check final event state
GET http://localhost:8080/api/events/67018c5e4b8f9a12345678ab
```

## 🔍 **What to Verify:**

### **After Each Donation:**
1. **Response Status:** Should be `200 OK`
2. **Success Flag:** `"success": true`
3. **Message:** `"Donation added successfully"`
4. **Updated Amount:** `collectedamount` should increase
5. **Donation Array:** New donation should appear in array
6. **Timestamp:** Each donation should have automatic timestamp

### **Data Integrity Checks:**
- ✅ `collectedamount` = sum of all donation amounts
- ✅ Each donation has `userId`, `amount`, and `date`
- ✅ Donations are stored in chronological order
- ✅ Multiple donations from same user are allowed
- ✅ Event data persists after server restart

## 🚨 **Common Issues & Solutions:**

### **Issue 1: "Event card not found"**
- **Cause:** Invalid or non-existent event ID
- **Solution:** Use `GET /api/events` to get valid event IDs

### **Issue 2: Server Error 500**
- **Cause:** Missing required fields or database connection
- **Solution:** Check server logs and ensure all fields are provided

### **Issue 3: Donation not reflecting**
- **Cause:** Database not saving properly
- **Solution:** Check MongoDB connection and server logs

## 📝 **Testing Checklist:**

- [ ] ✅ **Basic donation works** (valid userId + amount)
- [ ] ✅ **Multiple donations work** (same user, multiple times)
- [ ] ✅ **Different users can donate** to same event
- [ ] ✅ **Collected amount updates** correctly
- [ ] ✅ **Donations array stores** all donations
- [ ] ✅ **Timestamps are automatic** and correct
- [ ] ❌ **Invalid event ID rejected**
- [ ] ❌ **Missing fields rejected**
- [ ] ❌ **Negative amounts handled** (if validation added)

## 🎯 **Ready to Test:**

### **Quick Start Commands:**
1. **Start server:** `node index.js`
2. **Get events:** `GET http://localhost:8080/api/events`
3. **Copy event ID** from response
4. **Make donation:** `POST http://localhost:8080/api/events/EVENT_ID/donate`

**You're all set to test the donation functionality!** 🚀

Let me know what results you get and if you encounter any issues!
