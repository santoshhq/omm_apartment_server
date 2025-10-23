const IdCardManagement = require('../models/idcards.managements');
const mongoose = require('mongoose');

class IdCardManagementService {
    static async createIdCard(memberId, cardName, cardNumber, cardType, issueAuthority, issueDate, expiryDate) {
        try {
            console.log(`[IdCardManagementService] Creating ID card for member: ${memberId}, Card: ${cardName}`);

            // Validate required fields
            if (!memberId || !cardName || !cardNumber || !cardType || !issueAuthority || !issueDate || !expiryDate) {
                throw new Error('All fields are required');
            }

            // Convert memberId to ObjectId if it's a string
            const memberObjectId = mongoose.Types.ObjectId.isValid(memberId)
                ? new mongoose.Types.ObjectId(memberId)
                : memberId;

            const newIdCard = new IdCardManagement({
                memberId: memberObjectId,
                cardName: cardName.trim(),
                cardNumber: cardNumber.trim(),
                cardType,
                issueAuthority: issueAuthority.trim(),
                issueDate: new Date(issueDate),
                expiryDate: new Date(expiryDate)
            });

            const savedCard = await newIdCard.save();
            console.log(`[IdCardManagementService] Successfully created ID card with ID: ${savedCard._id}`);
            return savedCard;
        } catch (error) {
            console.error(`[IdCardManagementService] Error creating ID card: ${error.message}`);
            throw new Error('Error creating ID card: ' + error.message);
        }
    }

    static async getAllIdCardById(memberId) {
        try {
            console.log(`[IdCardManagementService] Fetching ID cards for member: ${memberId}`);

            // Convert memberId to ObjectId if it's a string
            const memberObjectId = mongoose.Types.ObjectId.isValid(memberId)
                ? new mongoose.Types.ObjectId(memberId)
                : memberId;

            const idCards = await IdCardManagement.find({ memberId: memberObjectId })
                .populate('memberId', 'name email') // Populate member details
                .sort({ createdAt: -1 }); // Sort by creation date, newest first

            console.log(`[IdCardManagementService] Found ${idCards.length} ID cards for member: ${memberId}`);
            return idCards;
        } catch (error) {
            console.error(`[IdCardManagementService] Error fetching ID cards: ${error.message}`);
            throw new Error('Error fetching ID cards: ' + error.message);
        }
    }

    static async updateIdCard(idCardId, updateData) {
        try {
            console.log(`[IdCardManagementService] Updating ID card: ${idCardId}`);

            // Validate idCardId
            if (!mongoose.Types.ObjectId.isValid(idCardId)) {
                throw new Error('Invalid ID card ID');
            }

            // Validate updateData
            if (!updateData || Object.keys(updateData).length === 0) {
                throw new Error('Update data is required');
            }

            // Filter out fields that shouldn't be updated
            const allowedFields = ['cardName', 'cardNumber', 'cardType', 'issueAuthority', 'issueDate', 'expiryDate'];
            const filteredUpdateData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredUpdateData[field] = updateData[field];
                }
            }

            console.log(`[IdCardManagementService] Filtered update data:`, JSON.stringify(filteredUpdateData, null, 2));

            // Trim string fields if present
            if (filteredUpdateData.cardName) filteredUpdateData.cardName = filteredUpdateData.cardName.trim();
            if (filteredUpdateData.cardNumber) filteredUpdateData.cardNumber = filteredUpdateData.cardNumber.trim();
            if (filteredUpdateData.issueAuthority) filteredUpdateData.issueAuthority = filteredUpdateData.issueAuthority.trim();

            // Convert date fields if they are strings
            if (filteredUpdateData.issueDate) filteredUpdateData.issueDate = new Date(filteredUpdateData.issueDate);
            if (filteredUpdateData.expiryDate) filteredUpdateData.expiryDate = new Date(filteredUpdateData.expiryDate);

            // Validate dates if both are present
            if (updateData.issueDate && updateData.expiryDate) {
                console.log(`[IdCardManagementService] Validating dates:`);
                console.log(`  - Raw issueDate: ${updateData.issueDate} (type: ${typeof updateData.issueDate})`);
                console.log(`  - Raw expiryDate: ${updateData.expiryDate} (type: ${typeof updateData.expiryDate})`);
                console.log(`  - Parsed issueDate: ${new Date(updateData.issueDate)}`);
                console.log(`  - Parsed expiryDate: ${new Date(updateData.expiryDate)}`);
                console.log(`  - Comparison: ${new Date(updateData.expiryDate)} > ${new Date(updateData.issueDate)} = ${new Date(updateData.expiryDate) > new Date(updateData.issueDate)}`);
                
                if (updateData.expiryDate <= updateData.issueDate) {
                    console.log(`[IdCardManagementService] Date validation FAILED: expiry must be after issue date`);
                    throw new Error('Expiry date must be after issue date');
                }
                console.log(`[IdCardManagementService] Date validation PASSED`);
            }

            const updatedIdCard = await IdCardManagement.findByIdAndUpdate(
                idCardId,
                updateData,
                { new: true, runValidators: false } // Disable mongoose validators since we validate manually
            ).populate('memberId', 'name email');

            if (!updatedIdCard) {
                throw new Error('ID card not found');
            }

            console.log(`[IdCardManagementService] Successfully updated ID card: ${idCardId}`);
            return updatedIdCard;
        } catch (error) {
            console.error(`[IdCardManagementService] Error updating ID card: ${error.message}`);
            throw new Error('Error updating ID card: ' + error.message);
        }
    }

    static async deleteIdCard(idCardId) {
        try {
            console.log(`[IdCardManagementService] Deleting ID card: ${idCardId}`);

            // Validate idCardId
            if (!mongoose.Types.ObjectId.isValid(idCardId)) {
                throw new Error('Invalid ID card ID');
            }

            const deletedCard = await IdCardManagement.findByIdAndDelete(idCardId);

            if (!deletedCard) {
                throw new Error('ID card not found');
            }

            console.log(`[IdCardManagementService] Successfully deleted ID card: ${idCardId}`);
            return { status: true, message: 'ID card deleted successfully' };
        } catch (error) {
            console.error(`[IdCardManagementService] Error deleting ID card: ${error.message}`);
            throw new Error('Error deleting ID card: ' + error.message);
        }
    }

    // Additional utility methods
    static async getIdCardById(idCardId) {
        try {
            console.log(`[IdCardManagementService] Fetching ID card by ID: ${idCardId}`);

            if (!mongoose.Types.ObjectId.isValid(idCardId)) {
                throw new Error('Invalid ID card ID');
            }

            const idCard = await IdCardManagement.findById(idCardId)
                .populate('memberId', 'name email');

            if (!idCard) {
                throw new Error('ID card not found');
            }

            console.log(`[IdCardManagementService] Found ID card: ${idCardId}`);
            return idCard;
        } catch (error) {
            console.error(`[IdCardManagementService] Error fetching ID card: ${error.message}`);
            throw new Error('Error fetching ID card: ' + error.message);
        }
    }

    static async getExpiringCards(daysAhead = 30) {
        try {
            console.log(`[IdCardManagementService] Fetching cards expiring in ${daysAhead} days`);

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + daysAhead);

            const expiringCards = await IdCardManagement.find({
                expiryDate: { $lte: futureDate, $gt: new Date() }
            }).populate('memberId', 'name email')
              .sort({ expiryDate: 1 });

            console.log(`[IdCardManagementService] Found ${expiringCards.length} expiring cards`);
            return expiringCards;
        } catch (error) {
            console.error(`[IdCardManagementService] Error fetching expiring cards: ${error.message}`);
            throw new Error('Error fetching expiring cards: ' + error.message);
        }
    }
}

module.exports = IdCardManagementService;


