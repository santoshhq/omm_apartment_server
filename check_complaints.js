const mongoose = require('mongoose');
const Complaints = require('./models/complaintssection/complaints');
// Register the required models
require('./models/auth.models/signup');
require('./models/auth.models/adminMemberProfile');
require('./models/adminProfiles');

async function checkComplaints() {
  try {
    await mongoose.connect('mongodb://localhost:27017/omm_server');
    console.log('Connected to MongoDB');

    // Check admin data
    const AdminSignup = require('./models/auth.models/signup');
    const AdminProfiles = require('./models/adminProfiles');

    console.log('\n=== ADMIN DATA CHECK ===');
    const admins = await AdminSignup.find({});
    console.log('Total adminSignup records:', admins.length);
    admins.forEach((admin, i) => {
      console.log(`Admin ${i+1}: ID=${admin._id}, Email=${admin.email}`);
    });

    const profiles = await AdminProfiles.adminuser.find({});
    console.log('Total AdminProfiles records:', profiles.length);
    profiles.forEach((profile, i) => {
      console.log(`Profile ${i+1}: userId=${profile.userId}, Name=${profile.firstName} ${profile.lastName}, Email=${profile.email}`);
    });

    console.log('\n=== COMPLAINTS DATA CHECK ===');
    const complaints = await Complaints.find({}).populate('userId', 'firstName lastName email');

    console.log('Total complaints found:', complaints.length);
    complaints.forEach((c, i) => {
      console.log(`Complaint ${i+1}:`);
      console.log('  ID:', c._id);
      console.log('  Title:', c.title);
      console.log('  assignedToAdmin ID:', c.assignedToAdmin);
      console.log('  userId:', c.userId ? `${c.userId.firstName} ${c.userId.lastName}` : 'NULL');
      console.log('  Status:', c.status);
      console.log('---');
    });

    // Test the specific admin ID query
    const testAdminId = '68ee106222db0dbd475297a4';
    console.log(`\n=== TESTING QUERY FOR ADMIN ID: ${testAdminId} ===`);
    const adminComplaints = await Complaints.find({ assignedToAdmin: testAdminId });
    console.log('Complaints found for this admin:', adminComplaints.length);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkComplaints();