# Next Operations for Event Cards System

## 1. 🔍 Get Events by Admin ID
**Purpose:** Get all events created by a specific admin

### Service Function
Add this to `services/events.cards.services.js`:

```javascript
// Get Events by Admin ID
static async getEventsByAdminId(adminId) {
  try {
    console.log('\n=== 📋 GET EVENTS BY ADMIN SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);

    const events = await eventCard.find({ adminId: adminId })
      .sort({ createdAt: -1 })
      .populate('adminId', 'firstName lastName email');

    console.log('✅ Found', events.length, 'events');

    return {
      success: true,
      message: `Found ${events.length} events`,
      data: {
        events: events.map(event => ({
          id: event._id,
          name: event.name,
          description: event.description,
          image: event.image,
          startdate: event.startdate,
          enddate: event.enddate,
          targetamount: event.targetamount,
          collectedamount: event.collectedamount || 0,
          eventdetails: event.eventdetails,
          status: event.status,
          donations: event.donations,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt
        })),
        totalEvents: events.length
      }
    };

  } catch (error) {
    console.log('❌ ERROR in getEventsByAdminId:', error.message);
    return {
      success: false,
      message: 'Error fetching events by admin',
      error: error.message
    };
  }
}
```

### Controller Method
Add this to `controllers/events.cards.controllers.js`:

```javascript
// Get Events by Admin ID
static async getEventsByAdminId(req, res) {
  try {
    const { adminId } = req.params;
    const result = await EventCardService.getEventsByAdminId(adminId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}
```

### Router Route
Add this to `routers/events.cards.routers.js`:

```javascript
// Get events by admin ID
router.get("/admin/:adminId", EventCardController.getEventsByAdminId);
```

**Postman Test:**
- **Method:** GET
- **URL:** `http://localhost:3000/api/events/admin/68d664d7d84448fff5dc3a8b`

---

## 2. 🏆 Get Top Performing Events
**Purpose:** Get events with highest donation amounts

### Service Function
```javascript
// Get Top Performing Events
static async getTopPerformingEvents(limit = 5) {
  try {
    console.log('\n=== 🏆 GET TOP PERFORMING EVENTS SERVICE CALLED ===');
    console.log('📊 Limit:', limit);

    const events = await eventCard.find({ status: true })
      .sort({ collectedamount: -1 })
      .limit(parseInt(limit))
      .populate('adminId', 'firstName lastName email');

    console.log('✅ Found', events.length, 'top events');

    return {
      success: true,
      message: `Top ${events.length} performing events`,
      data: {
        events: events.map(event => ({
          id: event._id,
          name: event.name,
          image: event.image,
          targetamount: event.targetamount,
          collectedamount: event.collectedamount || 0,
          progressPercentage: Math.round(((event.collectedamount || 0) / event.targetamount) * 100),
          totalDonations: event.donations?.length || 0,
          status: event.status,
          adminId: event.adminId
        }))
      }
    };

  } catch (error) {
    console.log('❌ ERROR in getTopPerformingEvents:', error.message);
    return {
      success: false,
      message: 'Error fetching top performing events',
      error: error.message
    };
  }
}
```

### Controller Method
```javascript
// Get Top Performing Events
static async getTopPerformingEvents(req, res) {
  try {
    const { limit } = req.query;
    const result = await EventCardService.getTopPerformingEvents(limit);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}
```

### Router Route
```javascript
// Get top performing events
router.get("/top-performing", EventCardController.getTopPerformingEvents);
```

**Postman Test:**
- **Method:** GET
- **URL:** `http://localhost:3000/api/events/top-performing?limit=3`

---

## 3. 📊 Get Event Statistics
**Purpose:** Get detailed statistics for an event

### Service Function
```javascript
// Get Event Statistics
static async getEventStatistics(eventId) {
  try {
    console.log('\n=== 📊 GET EVENT STATISTICS SERVICE CALLED ===');
    console.log('🎪 Event ID:', eventId);

    const event = await eventCard.findById(eventId).populate('adminId', 'firstName lastName');
    
    if (!event) {
      console.log('❌ EVENT NOT FOUND');
      return {
        success: false,
        message: 'Event not found'
      };
    }

    const totalDonations = event.donations?.length || 0;
    const collectedAmount = event.collectedamount || 0;
    const targetAmount = event.targetamount;
    const progressPercentage = Math.round((collectedAmount / targetAmount) * 100);
    const remainingAmount = targetAmount - collectedAmount;
    
    // Calculate average donation
    const averageDonation = totalDonations > 0 ? Math.round(collectedAmount / totalDonations) : 0;
    
    // Get donation history (last 5 donations)
    const recentDonations = event.donations?.slice(-5).reverse() || [];

    console.log('✅ Statistics calculated for:', event.name);

    return {
      success: true,
      message: 'Event statistics retrieved successfully',
      data: {
        eventInfo: {
          id: event._id,
          name: event.name,
          description: event.description,
          image: event.image,
          status: event.status,
          createdBy: event.adminId
        },
        financialStats: {
          targetAmount: targetAmount,
          collectedAmount: collectedAmount,
          remainingAmount: remainingAmount,
          progressPercentage: progressPercentage,
          averageDonation: averageDonation
        },
        donationStats: {
          totalDonations: totalDonations,
          recentDonations: recentDonations
        },
        eventDuration: {
          startDate: event.startdate,
          endDate: event.enddate,
          isActive: event.status && new Date() >= new Date(event.startdate) && new Date() <= new Date(event.enddate)
        }
      }
    };

  } catch (error) {
    console.log('❌ ERROR in getEventStatistics:', error.message);
    return {
      success: false,
      message: 'Error fetching event statistics',
      error: error.message
    };
  }
}
```

### Controller Method
```javascript
// Get Event Statistics
static async getEventStatistics(req, res) {
  try {
    const { id } = req.params;
    const result = await EventCardService.getEventStatistics(id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}
```

### Router Route
```javascript
// Get event statistics
router.get("/:id/statistics", EventCardController.getEventStatistics);
```

**Postman Test:**
- **Method:** GET
- **URL:** `http://localhost:3000/api/events/68dbb049e72b2b5f3241e57a/statistics`

---

## 4. 🔍 Search Events
**Purpose:** Search events by name, description, or other criteria

### Service Function
```javascript
// Search Events
static async searchEvents(searchQuery, filters = {}) {
  try {
    console.log('\n=== 🔍 SEARCH EVENTS SERVICE CALLED ===');
    console.log('🔎 Search Query:', searchQuery);
    console.log('🔧 Filters:', filters);

    let query = {};

    // Text search
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Status filter
    if (filters.status !== undefined) {
      query.status = filters.status;
    }

    // Date range filter
    if (filters.startDate) {
      query.startdate = { $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      query.enddate = { $lte: new Date(filters.endDate) };
    }

    // Amount range filter
    if (filters.minAmount) {
      query.targetamount = { ...query.targetamount, $gte: parseInt(filters.minAmount) };
    }
    if (filters.maxAmount) {
      query.targetamount = { ...query.targetamount, $lte: parseInt(filters.maxAmount) };
    }

    const events = await eventCard.find(query)
      .sort({ createdAt: -1 })
      .populate('adminId', 'firstName lastName email');

    console.log('✅ Found', events.length, 'matching events');

    return {
      success: true,
      message: `Found ${events.length} matching events`,
      data: {
        events: events.map(event => ({
          id: event._id,
          name: event.name,
          description: event.description,
          image: event.image,
          startdate: event.startdate,
          enddate: event.enddate,
          targetamount: event.targetamount,
          collectedamount: event.collectedamount || 0,
          progressPercentage: Math.round(((event.collectedamount || 0) / event.targetamount) * 100),
          status: event.status,
          totalDonations: event.donations?.length || 0,
          createdAt: event.createdAt
        })),
        searchQuery: searchQuery,
        filters: filters,
        totalResults: events.length
      }
    };

  } catch (error) {
    console.log('❌ ERROR in searchEvents:', error.message);
    return {
      success: false,
      message: 'Error searching events',
      error: error.message
    };
  }
}
```

### Controller Method
```javascript
// Search Events
static async searchEvents(req, res) {
  try {
    const { q, status, startDate, endDate, minAmount, maxAmount } = req.query;
    const filters = { status, startDate, endDate, minAmount, maxAmount };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    const result = await EventCardService.searchEvents(q, filters);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}
```

### Router Route
```javascript
// Search events
router.get("/search", EventCardController.searchEvents);
```

**Postman Test:**
- **Method:** GET
- **URL:** `http://localhost:3000/api/events/search?q=festival&status=true&minAmount=5000`

---

## 5. 📈 Bulk Update Events Status
**Purpose:** Update status of multiple events at once

### Service Function
```javascript
// Bulk Update Events Status
static async bulkUpdateStatus(adminId, eventIds, status) {
  try {
    console.log('\n=== 📈 BULK UPDATE EVENTS STATUS SERVICE CALLED ===');
    console.log('🔑 Admin ID:', adminId);
    console.log('🎪 Event IDs:', eventIds);
    console.log('🔄 New Status:', status);

    const result = await eventCard.updateMany(
      { 
        _id: { $in: eventIds },
        adminId: adminId 
      },
      { 
        status: status,
        updatedAt: new Date()
      }
    );

    console.log('✅ Updated', result.modifiedCount, 'events');

    return {
      success: true,
      message: `Successfully updated ${result.modifiedCount} events`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        newStatus: status
      }
    };

  } catch (error) {
    console.log('❌ ERROR in bulkUpdateStatus:', error.message);
    return {
      success: false,
      message: 'Error bulk updating events status',
      error: error.message
    };
  }
}
```

### Controller Method
```javascript
// Bulk Update Events Status
static async bulkUpdateStatus(req, res) {
  try {
    const { adminId, eventIds, status } = req.body;
    
    if (!adminId || !eventIds || !Array.isArray(eventIds) || status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'adminId, eventIds array, and status are required'
      });
    }
    
    const result = await EventCardService.bulkUpdateStatus(adminId, eventIds, status);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}
```

### Router Route
```javascript
// Bulk update events status
router.put("/bulk-status", EventCardController.bulkUpdateStatus);
```

**Postman Test:**
- **Method:** PUT
- **URL:** `http://localhost:3000/api/events/bulk-status`
- **Body:**
```json
{
  "adminId": "68d664d7d84448fff5dc3a8b",
  "eventIds": ["68dbb049e72b2b5f3241e57a", "68dbb049e72b2b5f3241e57b"],
  "status": false
}
```

---

## Which Operation Would You Like to Implement First?

1. **🔍 Get Events by Admin ID** - Most useful for admin dashboard
2. **🏆 Get Top Performing Events** - Great for homepage/analytics
3. **📊 Get Event Statistics** - Detailed analytics for single event
4. **🔍 Search Events** - Search and filter functionality
5. **📈 Bulk Update Status** - Admin bulk operations

Let me know which one you'd like me to help you implement first! 🚀