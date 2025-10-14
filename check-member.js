require('dotenv').config();
const AdminMemberCredentials = require('./models/auth.models/adminMemberCredentials');
require('./config/db');

async function checkMemberCredentials() {
  console.log('🔍 Checking member credentials...');

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check specific userId
    const credentials = await AdminMemberCredentials.findOne({ userId: '369852' });

    if (!credentials) {
      console.log('❌ Member with userId 369852 not found');
      return;
    }

    console.log('✅ Member found:');
    console.log('👤 User ID:', credentials.userId);
    console.log('📧 Email:', credentials.email);
    console.log('🔗 Member Profile ID:', credentials.memberProfileId);
    console.log('👥 Profile exists:', credentials.memberProfileId ? 'Yes' : 'No');
    console.log('🔓 Is Active:', credentials.isActive);
    console.log('👨‍💼 Created by Admin:', credentials.createdByAdminId);

    if (credentials.memberProfileId) {
      // Try to populate the profile
      const populatedCredentials = await AdminMemberCredentials.findOne({ userId: '369852' })
        .populate('memberProfileId');

      if (populatedCredentials && populatedCredentials.memberProfileId) {
        console.log('📋 Profile Details:');
        console.log('   🆔 ID:', populatedCredentials.memberProfileId._id);
        console.log('   👤 Name:', `${populatedCredentials.memberProfileId.firstName} ${populatedCredentials.memberProfileId.lastName}`);
        console.log('   📧 Email:', populatedCredentials.memberProfileId.email);
        console.log('   📱 Mobile:', populatedCredentials.memberProfileId.mobile);
      } else {
        console.log('❌ Profile population failed');
      }
    }

  } catch (error) {
    console.error('❌ Error checking member:', error.message);
  } finally {
    process.exit(0);
  }
}

checkMemberCredentials();