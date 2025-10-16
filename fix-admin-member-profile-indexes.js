const mongoose = require('mongoose');
const db = require('./config/db');

async function fixAdminMemberProfileIndexes() {
  try {
    console.log('🔧 Checking AdminMemberProfile indexes...');

    // Wait for database connection
    await db;
    console.log('🔗 Database connected successfully');

    // Get the collection
    const collection = mongoose.connection.db.collection('adminmemberprofiles');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', JSON.stringify(indexes, null, 2));

    // Check if there's a userId index that shouldn't exist
    const userIdIndex = indexes.find(index => {
      return index.key && index.key.userId !== undefined;
    });

    if (userIdIndex) {
      console.log('⚠️  Found userId index that should not exist:', userIdIndex);
      console.log('🗑️  Dropping userId index...');

      // Drop the index
      await collection.dropIndex(userIdIndex.name);
      console.log('✅ userId index dropped successfully');
    } else {
      console.log('✅ No problematic userId index found');
    }

    // Ensure proper indexes exist
    console.log('🔧 Ensuring proper indexes...');

    // Index for email (should be unique)
    try {
      await collection.createIndex({ email: 1 }, { unique: true });
      console.log('✅ Email index ensured');
    } catch (error) {
      console.log('ℹ️  Email index already exists or error:', error.message);
    }

    // Index for mobile (should be unique)
    try {
      await collection.createIndex({ mobile: 1 }, { unique: true });
      console.log('✅ Mobile index ensured');
    } catch (error) {
      console.log('ℹ️  Mobile index already exists or error:', error.message);
    }

    // Index for createdByAdminId
    try {
      await collection.createIndex({ createdByAdminId: 1 });
      console.log('✅ CreatedByAdminId index ensured');
    } catch (error) {
      console.log('ℹ️  CreatedByAdminId index already exists or error:', error.message);
    }

    // Compound index for active members
    try {
      await collection.createIndex({ isActive: 1, createdByAdminId: 1 });
      console.log('✅ Active members compound index ensured');
    } catch (error) {
      console.log('ℹ️  Active members compound index already exists or error:', error.message);
    }

    console.log('🎉 All indexes fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixAdminMemberProfileIndexes();