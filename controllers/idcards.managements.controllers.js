const IdCardManagementService = require('../services/idcards.managements.services');

class IdCardManagementController {
    // Create ID Card
    static async createIdCard(req, res) {
        try {
            console.log('\n=== 🆔 CREATE ID CARD CONTROLLER CALLED ===');

            // Get memberId from authenticated user or from body
            let memberId;

            if (req.user && req.user._id) {
                // Use authenticated user's ID
                memberId = req.user._id;
                console.log('🔐 Using authenticated member ID:', memberId);
            } else {
                // Get from body (fallback)
                memberId = req.body.memberId;
                console.log('⚠️ Using member ID from request body:', memberId);
            }

            const { cardName, cardNumber, cardType, issueAuthority, issueDate, expiryDate } = req.body;

            console.log('📋 Card Details:');
            console.log('  - Name:', cardName);
            console.log('  - Number:', cardNumber);
            console.log('  - Type:', cardType);
            console.log('  - Authority:', issueAuthority);
            console.log('  - Issue Date:', issueDate);
            console.log('  - Expiry Date:', expiryDate);

            // Validate required fields
            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'Member ID is required'
                });
            }

            if (!cardName || !cardNumber || !cardType || !issueAuthority || !issueDate || !expiryDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: cardName, cardNumber, cardType, issueAuthority, issueDate, expiryDate'
                });
            }

            const result = await IdCardManagementService.createIdCard(
                memberId,
                cardName,
                cardNumber,
                cardType,
                issueAuthority,
                issueDate,
                expiryDate
            );

            console.log('✅ ID Card created successfully with ID:', result._id);
            return res.status(201).json({
                success: true,
                message: 'ID card created successfully',
                data: result
            });
        } catch (error) {
            console.error('❌ Error in createIdCard controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Get All ID Cards by Member ID
    static async getAllIdCardsByMember(req, res) {
        try {
            console.log('\n=== 📋 GET ALL ID CARDS BY MEMBER CONTROLLER CALLED ===');

            // Get memberId from authenticated user or from params
            let memberId;

            if (req.user && req.user._id) {
                // Use authenticated user's ID
                memberId = req.user._id;
                console.log('🔐 Using authenticated member ID:', memberId);
            } else {
                // Get from params (for admin access)
                memberId = req.params.memberId;
                console.log('👑 Using member ID from params (admin access):', memberId);
            }

            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'Member ID is required'
                });
            }

            const idCards = await IdCardManagementService.getAllIdCardById(memberId);

            console.log(`✅ Found ${idCards.length} ID cards for member: ${memberId}`);
            return res.status(200).json({
                success: true,
                message: 'ID cards retrieved successfully',
                data: idCards,
                count: idCards.length
            });
        } catch (error) {
            console.error('❌ Error in getAllIdCardsByMember controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Get ID Card by ID
    static async getIdCardById(req, res) {
        try {
            console.log('\n=== 🔍 GET ID CARD BY ID CONTROLLER CALLED ===');

            const { id } = req.params;
            console.log('🆔 ID Card ID:', id);

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID card ID is required'
                });
            }

            const idCard = await IdCardManagementService.getIdCardById(id);

            console.log('✅ ID Card retrieved successfully:', idCard._id);
            return res.status(200).json({
                success: true,
                message: 'ID card retrieved successfully',
                data: idCard
            });
        } catch (error) {
            console.error('❌ Error in getIdCardById controller:', error.message);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Update ID Card
    static async updateIdCard(req, res) {
        try {
            console.log('\n=== ✏️ UPDATE ID CARD CONTROLLER CALLED ===');

            const { id } = req.params;
            const updateData = req.body;

            console.log('🆔 ID Card ID:', id);
            console.log('📝 Update Data:', JSON.stringify(updateData, null, 2));

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID card ID is required'
                });
            }

            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Update data is required'
                });
            }

            const updatedCard = await IdCardManagementService.updateIdCard(id, updateData);

            console.log('✅ ID Card updated successfully:', updatedCard._id);
            return res.status(200).json({
                success: true,
                message: 'ID card updated successfully',
                data: updatedCard
            });
        } catch (error) {
            console.error('❌ Error in updateIdCard controller:', error.message);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Delete ID Card
    static async deleteIdCard(req, res) {
        try {
            console.log('\n=== 🗑️ DELETE ID CARD CONTROLLER CALLED ===');

            const { id } = req.params;
            console.log('🆔 ID Card ID:', id);

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID card ID is required'
                });
            }

            const result = await IdCardManagementService.deleteIdCard(id);

            console.log('✅ ID Card deleted successfully:', id);
            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('❌ Error in deleteIdCard controller:', error.message);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Get Expiring Cards
    static async getExpiringCards(req, res) {
        try {
            console.log('\n=== ⏰ GET EXPIRING CARDS CONTROLLER CALLED ===');

            const { days = 30 } = req.query;
            const daysAhead = parseInt(days);

            console.log('📅 Days ahead:', daysAhead);

            if (isNaN(daysAhead) || daysAhead < 1 || daysAhead > 365) {
                return res.status(400).json({
                    success: false,
                    message: 'Days ahead must be a number between 1 and 365'
                });
            }

            const expiringCards = await IdCardManagementService.getExpiringCards(daysAhead);

            console.log(`✅ Found ${expiringCards.length} expiring cards within ${daysAhead} days`);
            return res.status(200).json({
                success: true,
                message: 'Expiring cards retrieved successfully',
                data: expiringCards,
                count: expiringCards.length,
                daysAhead
            });
        } catch (error) {
            console.error('❌ Error in getExpiringCards controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
}

module.exports = IdCardManagementController;
