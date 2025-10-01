const AnnounCard = require('../models/announs.cards');

class AnnounCardService {

    // Create a new announcement card
    static async createAnnounCard(title, description, priority, adminId) {
        try {
            console.log('\n=== 📢 CREATE ANNOUNCEMENT SERVICE CALLED ===');
            console.log('📝 Title:', title);
            console.log('🔤 Description:', description?.substring(0, 50) + '...');
            console.log('⚡ Priority:', priority);
            console.log('🔑 Admin ID:', adminId);

            // Validate required fields
            if (!title || !description || !adminId) {
                return { 
                    success: false, 
                    message: 'Title, description, and adminId are required' 
                };
            }

            // Validate priority
            if (priority && !['High', 'Medium', 'Low'].includes(priority)) {
                return {
                    success: false,
                    message: 'Priority must be High, Medium, or Low'
                };
            }

            // Check for duplicate title by same admin
            const existingCard = await AnnounCard.findOne({
                adminId: adminId,
                title: { $regex: new RegExp(`^${title}$`, 'i') }
            });

            if (existingCard) {
                return { 
                    success: false, 
                    message: 'An announcement with this title already exists' 
                };
            }

            const cardData = { 
                title: title.trim(), 
                description: description.trim(), 
                priority: priority || 'Medium', 
                adminId,
                isActive: true // Default to active
            };

            const newCard = new AnnounCard(cardData);
            const savedCard = await newCard.save();
            
            console.log('✅ Announcement created successfully');
            
            return { 
                success: true, 
                message: 'Announcement card created successfully', 
                data: {
                    id: savedCard._id,
                    title: savedCard.title,
                    description: savedCard.description,
                    priority: savedCard.priority,
                    status: savedCard.isActive ? 'active' : 'inactive',
                    adminId: savedCard.adminId,
                    createdDate: savedCard.createdAt,
                    updatedDate: savedCard.updatedAt
                }
            };
        } catch (error) {
            console.log('❌ ERROR in createAnnounCard:', error.message);
            return { 
                success: false, 
                message: 'Error creating announcement card', 
                error: error.message 
            };
        }
    }

    // Get all announcement cards with populated admin info
    static async getAllAnnounCards(filters = {}) {
        try {
            console.log('\n=== 📋 GET ALL ANNOUNCEMENTS SERVICE CALLED ===');
            
            let query = {};
            
            // Apply filters
            if (filters.isActive !== undefined) {
                query.isActive = filters.isActive;
            }
            
            if (filters.priority) {
                query.priority = filters.priority;
            }
            
            if (filters.adminId) {
                query.adminId = filters.adminId;
            }

            const cards = await AnnounCard.find(query)
                .populate('adminId', 'firstName lastName email')
                .sort({ priority: 1, createdAt: -1 }); // High priority first, then latest

            const formattedCards = cards.map(card => ({
                id: card._id,
                title: card.title,
                description: card.description,
                priority: card.priority,
                status: card.isActive ? 'active' : 'inactive',
                adminId: card.adminId,
                createdDate: card.createdAt,
                updatedDate: card.updatedAt
            }));

            console.log('✅ Found', cards.length, 'announcements');
            
            return { 
                success: true, 
                message: `Found ${cards.length} announcement cards`,
                data: formattedCards 
            };
        } catch (error) {
            console.log('❌ ERROR in getAllAnnounCards:', error.message);
            return { 
                success: false, 
                message: 'Error fetching announcement cards', 
                error: error.message 
            };
        }
    }

    // Get a card by ID
    static async getAnnounCardById(cardId) {
        try {
            console.log('\n=== 🔍 GET ANNOUNCEMENT BY ID SERVICE CALLED ===');
            console.log('📢 Card ID:', cardId);

            const card = await AnnounCard.findById(cardId)
                .populate('adminId', 'firstName lastName email');
            
            if (!card) {
                return { 
                    success: false, 
                    message: 'Announcement card not found' 
                };
            }

            const formattedCard = {
                id: card._id,
                title: card.title,
                description: card.description,
                priority: card.priority,
                status: card.isActive ? 'active' : 'inactive',
                adminId: card.adminId,
                createdDate: card.createdAt,
                updatedDate: card.updatedAt
            };

            console.log('✅ Announcement found successfully');

            return { 
                success: true, 
                message: 'Announcement card found',
                data: formattedCard 
            };
        } catch (error) {
            console.log('❌ ERROR in getAnnounCardById:', error.message);
            return { 
                success: false, 
                message: 'Error fetching announcement card', 
                error: error.message 
            };
        }
    }

    // Update a card
    static async updateAnnounCard(adminId, cardId, updateData) {
        try {
            console.log('\n=== ✏️ UPDATE ANNOUNCEMENT SERVICE CALLED ===');
            console.log('🔑 Admin ID:', adminId);
            console.log('📢 Card ID:', cardId);
            console.log('📝 Update data:', Object.keys(updateData));

            // Find card and verify ownership
            const existingCard = await AnnounCard.findOne({
                _id: cardId,
                adminId: adminId
            });

            if (!existingCard) {
                return { 
                    success: false, 
                    message: 'Announcement card not found or access denied' 
                };
            }

            // Check for duplicate title if title is being updated
            if (updateData.title && updateData.title !== existingCard.title) {
                const duplicateCard = await AnnounCard.findOne({
                    adminId: adminId,
                    title: { $regex: new RegExp(`^${updateData.title}$`, 'i') },
                    _id: { $ne: cardId }
                });

                if (duplicateCard) {
                    return { 
                        success: false, 
                        message: 'An announcement with this title already exists' 
                    };
                }
            }

            // Prepare update object
            const updateObject = {};
            const allowedFields = ['title', 'description', 'priority', 'isActive'];
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    if (field === 'title' || field === 'description') {
                        updateObject[field] = updateData[field].trim();
                    } else if (field === 'priority') {
                        // Validate priority values
                        if (!['High', 'Medium', 'Low'].includes(updateData[field])) {
                            return {
                                success: false,
                                message: 'Priority must be High, Medium, or Low'
                            };
                        }
                        updateObject[field] = updateData[field];
                    } else {
                        updateObject[field] = updateData[field];
                    }
                }
            }

            // Track changes for logging
            const oldValues = {};
            const newValues = {};
            for (const field of Object.keys(updateObject)) {
                oldValues[field] = existingCard[field];
                newValues[field] = updateObject[field];
            }

            const updatedCard = await AnnounCard.findOneAndUpdate(
                { _id: cardId, adminId: adminId },
                updateObject,
                { new: true, runValidators: true }
            );

            console.log('✅ ANNOUNCEMENT UPDATED SUCCESSFULLY');

            return { 
                success: true, 
                message: 'Announcement card updated successfully', 
                data: {
                    id: updatedCard._id,
                    title: updatedCard.title,
                    description: updatedCard.description,
                    priority: updatedCard.priority,
                    status: updatedCard.isActive ? 'active' : 'inactive',
                    adminId: updatedCard.adminId,
                    createdDate: updatedCard.createdAt,
                    updatedDate: updatedCard.updatedAt
                }
            };
        } catch (error) {
            console.log('❌ ERROR in updateAnnounCard:', error.message);
            return { 
                success: false, 
                message: 'Error updating announcement card', 
                error: error.message 
            };
        }
    }

    // Delete a card
    static async deleteAnnounCard(adminId, cardId) {
        try {
            console.log('\n=== 🗑️ DELETE ANNOUNCEMENT SERVICE CALLED ===');
            console.log('🔑 Admin ID:', adminId);
            console.log('📢 Card ID:', cardId);

            const deletedCard = await AnnounCard.findOneAndDelete({
                _id: cardId,
                adminId: adminId
            });

            if (!deletedCard) {
                return { 
                    success: false, 
                    message: 'Announcement card not found or access denied' 
                };
            }

            console.log('✅ ANNOUNCEMENT DELETED SUCCESSFULLY');
            
            return { 
                success: true, 
                message: 'Announcement card deleted successfully', 
                data: {
                    deletedId: cardId,
                    deletedTitle: deletedCard.title
                }
            };
        } catch (error) {
            console.log('❌ ERROR in deleteAnnounCard:', error.message);
            return { 
                success: false, 
                message: 'Error deleting announcement card', 
                error: error.message 
            };
        }
    }

    // Toggle card active/inactive status
    static async toggleAnnounStatus(adminId, cardId) {
        try {
            console.log('\n=== 🔄 TOGGLE ANNOUNCEMENT STATUS SERVICE CALLED ===');
            console.log('🔑 Admin ID:', adminId);
            console.log('📢 Card ID:', cardId);

            const card = await AnnounCard.findOne({
                _id: cardId,
                adminId: adminId
            });

            if (!card) {
                return { 
                    success: false, 
                    message: 'Announcement card not found or access denied' 
                };
            }

            card.isActive = !card.isActive;
            await card.save();

            console.log('✅ ANNOUNCEMENT STATUS TOGGLED');
            console.log('🔄 New Status:', card.isActive ? 'Active' : 'Inactive');

            return {
                success: true,
                message: `Announcement card is now ${card.isActive ? 'active' : 'inactive'}`,
                data: {
                    id: card._id,
                    title: card.title,
                    status: card.isActive ? 'active' : 'inactive'
                }
            };
        } catch (error) {
            console.log('❌ ERROR in toggleAnnounStatus:', error.message);
            return { 
                success: false, 
                message: 'Error toggling announcement card status', 
                error: error.message 
            };
        }
    }

    // Get announcements by priority
    static async getAnnouncementsByPriority(priority) {
        try {
            console.log('\n=== 🏷️ GET ANNOUNCEMENTS BY PRIORITY SERVICE CALLED ===');
            console.log('⚡ Priority:', priority);

            if (!['High', 'Medium', 'Low'].includes(priority)) {
                return {
                    success: false,
                    message: 'Priority must be High, Medium, or Low'
                };
            }

            const announcements = await AnnounCard.find({ 
                priority: priority,
                isActive: true
            })
                .populate('adminId', 'firstName lastName email')
                .sort({ createdAt: -1 });

            const formattedAnnouncements = announcements.map(announcement => ({
                id: announcement._id,
                title: announcement.title,
                description: announcement.description,
                priority: announcement.priority,
                status: announcement.isActive ? 'active' : 'inactive',
                adminId: announcement.adminId,
                createdDate: announcement.createdAt,
                updatedDate: announcement.updatedAt
            }));

            console.log('✅ Found', announcements.length, priority, 'priority announcements');

            return {
                success: true,
                message: `Found ${announcements.length} ${priority} priority announcements`,
                data: formattedAnnouncements
            };

        } catch (error) {
            console.log('❌ ERROR in getAnnouncementsByPriority:', error.message);
            return {
                success: false,
                message: 'Error fetching announcements by priority',
                error: error.message
            };
        }
    }

}

module.exports = AnnounCardService;
