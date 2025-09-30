const express = require('express');
const router = express.Router();

const {
  adminCreateMember,
  getAdminMembers,
  memberLogin,
  adminUpdateMember,
  adminDeleteMember
} = require('../../controllers/auth.controllers/adminMember.controllers');

// 👥 Admin Creates Member (Auto-generates User ID, Admin sets Password)
// POST: /api/admin-members/create
router.post('/create', adminCreateMember);

// 📋 Get All Members Created by Admin
// GET: /api/admin-members/admin/:adminId
router.get('/admin/:adminId', getAdminMembers);

// 🔐 Member Login with Admin-Created Credentials
// POST: /api/admin-members/member-login
router.post('/member-login', memberLogin);

// ✏️ Admin Updates Member (All fields except userId and password)
// PUT: /api/admin-members/admin/:adminId/member/:memberId
router.put('/admin/:adminId/member/:memberId', adminUpdateMember);

// 🗑️ Admin Deletes Member
// DELETE: /api/admin-members/admin/:adminId/member/:memberId
router.delete('/admin/:adminId/member/:memberId', adminDeleteMember);

module.exports = router;