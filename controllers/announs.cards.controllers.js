const AnnounCardService = require('../services/announs.cards.services');

class AnnounCardController {

    // Create new announcement card
    static async createAnnounCard(req, res) {
        try {
            console.log('\n=== 🎯 CREATE ANNOUNCEMENT CONTROLLER CALLED ===');
            console.log('📝 Request Body:', req.body);

            const { title, description, priority, adminId } = req.body;

            // Enhanced validation
            if (!title || !description || !adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: title, description, adminId'
                });
            }

            const result = await AnnounCardService.createAnnounCard(
                title,
                description,
                priority,
                adminId
            );

            const statusCode = result.success ? 201 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in createAnnounCard controller:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error', 
                error: error.message 
            });
        }
    }

    // Get all announcement cards (Admin-Specific)
    static async getAllAnnounCards(req, res) {  
        try {
            console.log('\n=== 📋 GET ALL ANNOUNCEMENTS CONTROLLER CALLED ===');
            
            // Get adminId from params (for new admin-specific routes) or query (for legacy)
            const adminIdFromParams = req.params.adminId;
            const { activeOnly, adminId: adminIdFromQuery, priority } = req.query;
            
            // Use adminId from params if available, otherwise from query (backward compatibility)
            const adminId = adminIdFromParams || adminIdFromQuery;
            
            console.log('🔑 Admin ID (from params):', adminIdFromParams);
            console.log('🔑 Admin ID (from query):', adminIdFromQuery);
            console.log('🔑 Final Admin ID used:', adminId);

            if (adminIdFromParams && !adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID is required'
                });
            }
            
            const result = await AnnounCardService.getAllAnnounCards({
                isActive: activeOnly === 'true' ? true : undefined,
                adminId,
                priority
            });

            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getAllAnnounCards controller:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error', 
                error: error.message 
            });
        }
    }

    // Get all announcement cards (Legacy - shows all announcements)
    static async getAllAnnounCardsLegacy(req, res) {  
        try {
            console.log('\n⚠️ LEGACY GET ALL ANNOUNCEMENTS - SHOWING ALL ANNOUNCEMENTS FROM ALL ADMINS');
            
            const { activeOnly, priority } = req.query;
            
            const result = await AnnounCardService.getAllAnnounCards({
                isActive: activeOnly === 'true' ? true : undefined,
                // No adminId filter - shows all announcements
                priority
            });

            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getAllAnnounCardsLegacy controller:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error', 
                error: error.message 
            });
        }
    }

    // Get single announcement card by ID
    static async getAnnounCardById(req, res) {
        try {
            console.log('\n=== 🔍 GET ANNOUNCEMENT BY ID CONTROLLER CALLED ===');
            console.log('🆔 ID:', req.params.id);

            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Announcement ID is required'
                });
            }

            const result = await AnnounCardService.getAnnounCardById(id);   
            
            const statusCode = result.success ? 200 : 404;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getAnnounCardById controller:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error', 
                error: error.message 
            });
        }
    }

    // Update announcement card
    static async updateAnnounCard(req, res) {
        try {
            console.log('\n=== ✏️ UPDATE ANNOUNCEMENT CONTROLLER CALLED ===');
            console.log('🆔 ID:', req.params.id);
            console.log('📝 Update Data:', req.body);

            const { id } = req.params;
            const { adminId, ...updateData } = req.body;    
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Announcement ID is required'
                });
            }

            if (!adminId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Admin ID is required for update authorization' 
                });
            }

            const result = await AnnounCardService.updateAnnounCard(adminId, id, updateData);
            
            const statusCode = result.success ? 200 : (result.message.includes('not found') ? 404 : 400);
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in updateAnnounCard controller:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error', 
                error: error.message 
            });
        }
    }

    // Delete announcement card
    static async deleteAnnounCard(req, res) {
        try {
            console.log('\n=== 🗑️ DELETE ANNOUNCEMENT CONTROLLER CALLED ===');
            console.log('🆔 ID:', req.params.id);

            const { id } = req.params;
            const { adminId } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Announcement ID is required'
                });
            }

            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID is required for delete authorization'
                });
            }

            const result = await AnnounCardService.deleteAnnounCard(adminId, id);
            
            const statusCode = result.success ? 200 : (result.message.includes('not found') ? 404 : 400);
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in deleteAnnounCard controller:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error', 
                error: error.message 
            });
        }
    }

    // Toggle announcement status
    static async toggleAnnounStatus(req, res) {
        try {
            console.log('\n=== 🔄 TOGGLE ANNOUNCEMENT STATUS CONTROLLER CALLED ===');
            console.log('🆔 ID:', req.params.id);

            const { id } = req.params;
            const { adminId } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Announcement ID is required'
                });
            }

            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID is required for status toggle authorization'
                });
            }

            const result = await AnnounCardService.toggleAnnounStatus(adminId, id);  
            
            const statusCode = result.success ? 200 : (result.message.includes('not found') ? 404 : 400);
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in toggleAnnounStatus controller:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error', 
                error: error.message 
            });
        }
    }

    // Get announcements by priority
    static async getAnnouncementsByPriority(req, res) {
        try {
            console.log('\n=== 🏷️ GET ANNOUNCEMENTS BY PRIORITY CONTROLLER CALLED ===');
            console.log('⚡ Priority:', req.params.priority);

            const { priority } = req.params;

            if (!priority) {
                return res.status(400).json({
                    success: false,
                    message: 'Priority parameter is required'
                });
            }

            const result = await AnnounCardService.getAnnouncementsByPriority(priority);
            
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);

        } catch (error) {
            console.log('❌ ERROR in getAnnouncementsByPriority controller:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error', 
                error: error.message 
            });
        }
    }
}
module.exports = AnnounCardController;