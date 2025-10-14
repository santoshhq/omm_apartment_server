require('dotenv').config();
const mongoose = require('mongoose');
const AdminMemberCredentials = require('./models/auth.models/adminMemberCredentials');
const AdminMemberProfile = require('./models/auth.models/adminMemberProfile');
// Connect to database (this will establish connection when required)
require('./config/db');

async function fixCorruptedMemberCredentials() {
  console.log('🔧 Starting member credentials fix...');

  try {
    // Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('📍 Connected to database');

    // Find all credentials with null memberProfileId
    const corruptedCredentials = await AdminMemberCredentials.find({
      memberProfileId: null
    });

    console.log(`🔍 Found ${corruptedCredentials.length} corrupted credentials`);

    if (corruptedCredentials.length === 0) {
      console.log('✅ No corrupted credentials found');
      return;
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const credentials of corruptedCredentials) {
      try {
        console.log(`\n🔧 Fixing credentials for userId: ${credentials.userId}`);

        // Try to find existing profile by email
        let profile = await AdminMemberProfile.findOne({
          email: credentials.email
        });

        if (profile) {
          console.log('✅ Found existing profile, linking...');
          // Link existing profile
          credentials.memberProfileId = profile._id;
          await credentials.save();

          // Also link credentials to profile if not already linked
          if (!profile.memberCredentialsId) {
            profile.memberCredentialsId = credentials._id;
            await profile.save();
          }

          fixedCount++;
          console.log('✅ Successfully linked existing profile');
        } else {
          console.log('⚠️ No existing profile found, creating new profile...');

          // Create new profile with basic info from credentials
          const newProfile = new AdminMemberProfile({
            firstName: 'Member', // Default values
            lastName: credentials.userId,
            email: credentials.email,
            mobile: '0000000000', // Default mobile
            floor: 1, // Default floor
            flatNo: '001', // Default flat
            paymentStatus: 'Available',
            govtIdType: 'Aadhaar',
            govtIdImage: 'default.jpg',
            createdByAdminId: credentials.createdByAdminId,
            createdBy: 'Admin',
            memberCredentialsId: credentials._id
          });

          const savedProfile = await newProfile.save();
          console.log('💾 Created new profile:', savedProfile._id);

          // Link credentials to new profile
          credentials.memberProfileId = savedProfile._id;
          await credentials.save();

          fixedCount++;
          console.log('✅ Successfully created and linked new profile');
        }

      } catch (error) {
        console.error(`❌ Error fixing credentials for userId ${credentials.userId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Fix Summary:`);
    console.log(`✅ Fixed: ${fixedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📋 Total processed: ${corruptedCredentials.length}`);

    if (fixedCount > 0) {
      console.log('\n🎉 Member credentials fix completed!');
      console.log('💡 Members can now login successfully.');
    }

  } catch (error) {
    console.error('❌ Error during fix process:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixCorruptedMemberCredentials().catch(console.error);