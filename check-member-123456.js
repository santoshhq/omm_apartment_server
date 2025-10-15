require('dotenv').config();
const mongoose = require('mongoose');

// Import models to register them
require('./models/auth.models/adminMemberCredentials');
require('./models/auth.models/adminMemberProfile');
require('./config/db');

const AdminMemberCredentials = require('./models/auth.models/adminMemberCredentials');

async function checkMember() {
  try {
    console.log('🔗 MongoDB connected successfully');
    console.log('📍 Database: mongodb://localhost:27017/omm_server');

    const member = await AdminMemberCredentials.findOne({
      userId: '123456',
      isActive: true
    }).populate('memberProfileId');

    if (member) {
      console.log('✅ Member found:');
      console.log('User ID:', member.userId);
      console.log('Email:', member.email);
      console.log('Is Active:', member.isActive);
      console.log('Profile exists:', !!member.memberProfileId);
      if (member.memberProfileId) {
        console.log('First Name:', member.memberProfileId.firstName);
        console.log('Last Name:', member.memberProfileId.lastName);
        console.log('Mobile:', member.memberProfileId.mobile);
        console.log('Floor:', member.memberProfileId.floor);
        console.log('Flat No:', member.memberProfileId.flatNo);
      }
    } else {
      console.log('❌ No member found with userId "123456"');
      console.log('💡 This explains the 404 error - member does not exist in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMember();