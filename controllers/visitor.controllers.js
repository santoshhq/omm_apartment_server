const VisitorService = require('../services/visitor.services');
const { SecurityGuardService } = require('../services/securityguards.services');
const SecurityGuard = require('../models/securityguards');

class VisitorController {
    // 🏠 Create Visitor Pre-Approval (Member)
    static async createVisitor(req, res) {
        try {
            console.log('\n=== 🏠 CREATE VISITOR PRE-APPROVAL ===');

            const { memberUid, flatId, guestName, guestPhone, preApprovalType, gateId, expiryHours, adminId, inviteType, totalCount, vehicleNumber, cabCompanyName, deliveryCompanyName, serviceName, servicePersonName, servicePersonPhone } = req.body;

            console.log('� Visitor Details:');
            console.log('  - Member UID:', memberUid);
            console.log('  - Flat ID:', flatId);
            console.log('  - Guest Name:', guestName);
            console.log('  - Guest Phone:', guestPhone);
            console.log('  - Type:', preApprovalType);
            console.log('  - Invite Type:', inviteType);
            console.log('  - Total Count:', totalCount);
            console.log('  - Vehicle Number:', vehicleNumber);
            console.log('  - Cab Company:', cabCompanyName);
            console.log('  - Delivery Company:', deliveryCompanyName);
            console.log('  - Service Name:', serviceName);
            console.log('  - Service Person:', servicePersonName);
            console.log('  - Service Phone:', servicePersonPhone);
            console.log('  - Gate:', Array.isArray(gateId) ? gateId.join(', ') : gateId);
            console.log('  - Expiry Hours:', expiryHours);
            console.log('  - Admin ID:', adminId);

            // Validate required fields
            if (!memberUid || !gateId || !Array.isArray(gateId) || gateId.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'memberUid and gateId (as array) are required'
                });
            }

            // Validate gateId array
            const validGates = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
            const invalidGates = gateId.filter(gate => !validGates.includes(gate));
            if (invalidGates.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid gate IDs: ${invalidGates.join(', ')}. Valid gates are: ${validGates.join(', ')}`
                });
            }

            // Validate based on preApprovalType
            if (preApprovalType === 'guest') {
                if (!inviteType || !['single', 'group'].includes(inviteType)) {
                    return res.status(400).json({
                        success: false,
                        message: 'For guest type, inviteType must be "single" or "group"'
                    });
                }

                if (inviteType === 'single') {
                    if (!guestName || !guestPhone) {
                        return res.status(400).json({
                            success: false,
                            message: 'For single guest invite, guestName and guestPhone are required'
                        });
                    }
                } else if (inviteType === 'group') {
                    if (!totalCount || totalCount < 2 || totalCount > 50) {
                        return res.status(400).json({
                            success: false,
                            message: 'For group invite, totalCount must be between 2 and 50'
                        });
                    }
                }
            } else if (preApprovalType === 'cab') {
                if (!vehicleNumber || !cabCompanyName) {
                    return res.status(400).json({
                        success: false,
                        message: 'For cab type, vehicleNumber and cabCompanyName are required'
                    });
                }
            } else if (preApprovalType === 'delivery') {
                if (!deliveryCompanyName) {
                    return res.status(400).json({
                        success: false,
                        message: 'For delivery type, deliveryCompanyName is required'
                    });
                }
            } else if (preApprovalType === 'tools') {
                if (!serviceName || !servicePersonName || !servicePersonPhone) {
                    return res.status(400).json({
                        success: false,
                        message: 'For tools type, serviceName, servicePersonName, and servicePersonPhone are required'
                    });
                }
            }

            // Validate expiry hours (1-8)
            const hours = parseInt(expiryHours) || 1;
            if (hours < 1 || hours > 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Expiry hours must be between 1 and 8'
                });
            }

            const result = await VisitorService.createVisitor({
                memberUid,
                adminId,
                flatId,
                guestName,
                guestPhone,
                preApprovalType,
                inviteType,
                totalCount,
                vehicleNumber,
                cabCompanyName,
                deliveryCompanyName,
                serviceName,
                servicePersonName,
                servicePersonPhone,
                gateId,
                expiryHours: hours
            });

            console.log('✅ Visitor pre-approval created with OTP:', result.visitor.otpCode);

            return res.status(201).json({
                success: true,
                message: result.message,
                data: result.visitor
            });
        } catch (error) {
            console.error('❌ Error in createVisitor:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // 📋 Get Visitors for Guard
    static async getVisitorsForGuard(req, res) {
        try {
            console.log('\n=== 📋 GET VISITORS FOR GUARD ===');

            const { mobilenumber, password } = req.body;

            if (!mobilenumber || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Mobile number and password are required'
                });
            }

            // Login guard
            const loginResult = await SecurityGuardService.guardLogin(mobilenumber, password);
            if (!loginResult.status) {
                return res.status(401).json({
                    success: false,
                    message: loginResult.message
                });
            }

            const guard = loginResult.data;
            const { adminId, assigngates: gateId } = guard;

            console.log('👮 Guard Info:', guard.firstname, guard.lastname, 'Gate:', gateId);

            const visitors = await VisitorService.getVisitorsForGuard(adminId, gateId);

            console.log(`✅ Retrieved ${visitors.length} pending visitors for gate ${gateId}`);

            // Log visitor assignments for debugging
            visitors.forEach((visitor, index) => {
                console.log(`   ${index + 1}. ${visitor.preApprovalType}: Gates [${visitor.gateId.join(', ')}]`);
            });

            // Add progress and display information for different types
            const visitorsWithProgress = visitors.map(visitor => {
                let displayName = '';
                let progress = '';

                if (visitor.preApprovalType === 'guest') {
                    if (visitor.inviteType === 'single') {
                        displayName = visitor.guestName;
                        progress = `${visitor.approvedCount}/${visitor.totalCount}`;
                    } else {
                        displayName = `Group (${visitor.approvedCount}/${visitor.totalCount})`;
                        progress = `${visitor.approvedCount}/${visitor.totalCount}`;
                    }
                } else if (visitor.preApprovalType === 'cab') {
                    displayName = `Cab: ${visitor.vehicleNumber} (${visitor.cabCompanyName})`;
                } else if (visitor.preApprovalType === 'delivery') {
                    displayName = `Delivery: ${visitor.deliveryCompanyName}`;
                } else if (visitor.preApprovalType === 'tools') {
                    displayName = `Service: ${visitor.serviceName} (${visitor.servicePersonName})`;
                } else {
                    displayName = `Other: ${visitor.preApprovalType}`;
                }

                return {
                    ...visitor.toObject(),
                    displayName,
                    progress,
                    type: visitor.preApprovalType,
                    assignedGates: visitor.gateId // Include all assigned gates
                };
            });

            return res.status(200).json({
                success: true,
                message: 'Visitors retrieved successfully',
                data: visitorsWithProgress,
                count: visitors.length,
                guard: { id: guard._id, name: `${guard.firstname} ${guard.lastname}`, gate: gateId }
            });
        } catch (error) {
            console.error('❌ Error in getVisitorsForGuard:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // ✅ Approve Visitor by ID and OTP (Security Guard)
    static async approveVisitor(req, res) {
        try {
            console.log('\n=== ✅ APPROVE VISITOR ===');

            const { visitorId, otpCode, mobilenumber, password } = req.body;

            if (!visitorId || !otpCode || !mobilenumber || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Visitor ID, OTP code, mobile number, and password are required'
                });
            }

            // Login guard
            const loginResult = await SecurityGuardService.guardLogin(mobilenumber, password);
            if (!loginResult.status) {
                return res.status(401).json({
                    success: false,
                    message: loginResult.message
                });
            }

            const result = await VisitorService.approveVisitor(visitorId, otpCode);

            // Create appropriate display message
            let displayMessage = '';
            if (result.visitor.preApprovalType === 'guest') {
                if (result.visitor.inviteType === 'single') {
                    displayMessage = result.visitor.guestName;
                } else {
                    displayMessage = `Group (${result.progress})`;
                }
            } else if (result.visitor.preApprovalType === 'cab') {
                displayMessage = `Cab: ${result.visitor.vehicleNumber}`;
            } else if (result.visitor.preApprovalType === 'delivery') {
                displayMessage = `Delivery: ${result.visitor.deliveryCompanyName}`;
            } else if (result.visitor.preApprovalType === 'tools') {
                displayMessage = `Service: ${result.visitor.serviceName}`;
            }

            console.log('✅ Visitor approved:', displayMessage, 'for gates:', result.visitor.gateId.join(', '));

            // Emit socket event for real-time update to all assigned gates
            if (req.io && result.visitor.gateId && Array.isArray(result.visitor.gateId)) {
                console.log('📡 Broadcasting approval to gates:', result.visitor.gateId.join(', '));
                result.visitor.gateId.forEach(gate => {
                    console.log(`📡 → Notifying gate-${gate}`);
                    req.io.to(`gate-${gate}`).emit('visitorApproved', {
                        ...result.visitor.toObject(),
                        progress: result.progress,
                        isFullyApproved: result.isFullyApproved,
                        displayName: displayMessage
                    });
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    ...result.visitor.toObject(),
                    progress: result.progress,
                    isFullyApproved: result.isFullyApproved,
                    displayName: displayMessage
                }
            });
        } catch (error) {
            console.error('❌ Error in approveVisitor:', error.message);
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    //  Get All Visitors for Admin
    static async getVisitorsForAdmin(req, res) {
        try {
            console.log('\n=== 👑 GET VISITORS FOR ADMIN ===');

            const adminId = req.adminId; // From auth

            console.log('👑 Admin ID:', adminId);

            const visitors = await VisitorService.getVisitorsForAdmin(adminId);

            console.log(`✅ Retrieved ${visitors.length} visitors for admin`);

            return res.status(200).json({
                success: true,
                message: 'Visitors retrieved successfully',
                data: visitors,
                count: visitors.length
            });
        } catch (error) {
            console.error('❌ Error in getVisitorsForAdmin:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // 🔄 Approve Visitor Status (Admin)
    static async updateVisitorStatus(req, res) {
        try {
            console.log('\n=== 🔄 APPROVE VISITOR STATUS ===');

            const { visitorId } = req.params;
            const { status } = req.body;

            console.log('🆔 Visitor ID:', visitorId, 'Status:', status);

            if (!visitorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Visitor ID is required'
                });
            }

            // Only allow approving pending requests
            if (status !== 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Only approval of pending requests is allowed'
                });
            }

            const result = await VisitorService.updateVisitorStatus(visitorId, status);

            console.log('✅ Visitor approved by admin');

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.visitor
            });
        } catch (error) {
            console.error('❌ Error in updateVisitorStatus:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // 🗑️ Delete Visitor (Admin)
    static async deleteVisitor(req, res) {
        try {
            console.log('\n=== 🗑️ DELETE VISITOR ===');

            const { visitorId } = req.params;

            console.log('🆔 Visitor ID:', visitorId);

            if (!visitorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Visitor ID is required'
                });
            }

            const result = await VisitorService.deleteVisitor(visitorId);

            console.log('✅ Visitor deleted');

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.visitor
            });
        } catch (error) {
            console.error('❌ Error in deleteVisitor:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
}

module.exports = VisitorController;