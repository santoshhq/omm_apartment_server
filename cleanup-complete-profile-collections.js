const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/omm_server');
    console.log('🔗 Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Drop CompleteProfile collection and UserCredentials collection
const dropCompleteProfileCollections = async () => {
  try {
    console.log('🗑️ DROPPING COMPLETE PROFILE COLLECTIONS...\n');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('📋 Available collections:', collectionNames);
    
    // Drop CompleteProfile collection if exists
    if (collectionNames.includes('completeprofiles')) {
      await db.collection('completeprofiles').drop();
      console.log('✅ Dropped CompleteProfile collection');
    } else {
      console.log('ℹ️ CompleteProfile collection not found');
    }
    
    // Drop UserCredentials collection if exists (was part of Complete Profile system)
    if (collectionNames.includes('usercredentials')) {
      await db.collection('usercredentials').drop();
      console.log('✅ Dropped UserCredentials collection (Complete Profile system)');
    } else {
      console.log('ℹ️ UserCredentials collection not found');
    }
    
    // Check what collections remain
    const remainingCollections = await db.listCollections().toArray();
    const remainingNames = remainingCollections.map(col => col.name);
    
    console.log('\n📋 Remaining collections:', remainingNames);
    console.log('\n🎉 Complete Profile collections cleanup completed!');
    
    console.log('\n✅ COLLECTIONS THAT REMAIN:');
    remainingNames.forEach(name => {
      console.log(`   - ${name}`);
    });
    
  } catch (error) {
    console.error('❌ Error dropping collections:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Main execution
const main = async () => {
  console.log('🗑️ COMPLETE PROFILE COLLECTION CLEANUP');
  console.log('=====================================\n');
  
  await connectDB();
  await dropCompleteProfileCollections();
};

main().catch(console.error);