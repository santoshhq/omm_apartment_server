const Donation = require('../../models/events.cards/donations');
const EventCard = require('../../models/events.cards');

class DonationService {
    static async createDonation({ eventId, userId, transactionId, amount, upiApp, adminId }) {
        try {
            console.log('\n=== 💰 CREATE DONATION SERVICE CALLED ===');
            console.log('🎉 Event ID:', eventId);
            console.log('👤 User ID:', userId);
            console.log('🔢 Transaction ID:', transactionId);
            console.log('💵 Amount:', amount);
            console.log('📱 UPI App:', upiApp);
            console.log('👨‍💼 Admin ID:', adminId);

            const newDonation = new Donation({
                eventId,
                userId,
                transactionId,
                amount,
                upiApp,
                adminId
            });
            await newDonation.save();

            // Populate user and event details for the response
            await newDonation.populate('userId', 'firstName lastName flatNo floor mobile');
            await newDonation.populate('eventId', 'name targetamount collectedamount');

            console.log('✅ Donation created successfully:', newDonation._id);
            return {
                status: true,
                message: 'Donation submitted successfully.',
                data: newDonation
            };
        } catch (error) {
            console.log('❌ Error creating donation:', error.message);
            return { status: false, message: 'Error creating donation', error: error.message };
        }
    }

    static async getAllDonations(adminId) {
        try {
            console.log('\n=== 💰 GET ALL DONATIONS SERVICE CALLED ===');
            console.log('👨‍💼 Admin ID:', adminId);
            console.log('🔍 Filters: {}');
            const donations = await Donation.find({ adminId })
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('eventId', 'name targetamount collectedamount');
            console.log('📊 Total donations found:', donations.length);
            return { status: true, data: donations };
        } catch (error) {
            console.log('❌ Error fetching donations:', error.message);
            return { status: false, message: 'Error fetching donations', error: error.message };
        }
    }

    static async getDonationsByEventId(eventId, adminId) {
        try {
            console.log('\n=== 💰 GET DONATIONS BY EVENT ID SERVICE CALLED ===');
            console.log('🎉 Event ID:', eventId);
            console.log('👨‍💼 Admin ID:', adminId);
            console.log('🔍 Filters: {}');
            const donations = await Donation.find({ eventId, adminId })
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('eventId', 'name targetamount collectedamount');
            console.log('📊 Total donations found for event:', donations.length);
            return { status: true, data: donations };
        } catch (error) {
            console.log('❌ Error fetching donations by event ID:', error.message);
            return { status: false, message: 'Error fetching donations', error: error.message };
        }
    }

    static async getDonationById(donationId, adminId) {
        try {
            console.log('\n=== 💰 GET DONATION BY ID SERVICE CALLED ===');
            console.log('🆔 Donation ID:', donationId);
            console.log('👨‍💼 Admin ID:', adminId);
            const donation = await Donation.findOne({ _id: donationId, adminId })
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('eventId', 'name targetamount collectedamount');
            if (!donation) {
                console.log('❌ Donation not found:', donationId);
                return { status: false, message: 'Donation not found' };
            }
            console.log('✅ Donation fetched successfully');
            return { status: true, data: donation };
        } catch (error) {
            console.log('❌ Error fetching donation:', error.message);
            return { status: false, message: 'Error fetching donation', error: error.message };
        }
    }

    static async updateDonation(donationId, updateData, adminId) {
        try {
            console.log('\n=== 💰 UPDATE DONATION SERVICE CALLED ===');
            console.log('🆔 Donation ID:', donationId);
            console.log('👨‍💼 Admin ID:', adminId);
            console.log('🔄 Update Data:', updateData);

            // Get the current donation to check status change
            const currentDonation = await Donation.findOne({ _id: donationId, adminId });
            const oldStatus = currentDonation?.status;

            const updatedDonation = await Donation
                .findOneAndUpdate({ _id: donationId, adminId }, updateData, { new: true })
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('eventId', 'name targetamount collectedamount');

            if (!updatedDonation) {
                console.log('❌ Donation not found for update:', donationId);
                return { status: false, message: 'Donation not found' };
            }

            // Handle status changes and collected amount updates
            if (updateData.status) {
                if (updateData.status === 'Accepted' && oldStatus !== 'Accepted') {
                    // Status changed to Accepted - increase collected amount
                    await EventCard.findByIdAndUpdate(updatedDonation.eventId, {
                        $inc: { collectedamount: updatedDonation.amount }
                    });
                    console.log('💰 Event collected amount increased');
                } else if (oldStatus === 'Accepted' && updateData.status !== 'Accepted') {
                    // Status changed from Accepted to something else - decrease collected amount
                    await EventCard.findByIdAndUpdate(updatedDonation.eventId, {
                        $inc: { collectedamount: -updatedDonation.amount }
                    });
                    console.log('💰 Event collected amount decreased');
                }
                
                // Recalculate total donors and average donation for any status change
                await DonationService.updateEventDonationStatistics(updatedDonation.eventId._id);
            }

            console.log('✅ Donation updated successfully');
            return { status: true, message: 'Donation updated successfully', data: updatedDonation };
        } catch (error) {
            console.log('❌ Error updating donation:', error.message);
            return { status: false, message: 'Error updating donation', error: error.message };
        }
    }

    static async deleteDonation(donationId, adminId) {
        try {
            console.log('\n=== 💰 DELETE DONATION SERVICE CALLED ===');
            console.log('🆔 Donation ID:', donationId);
            console.log('👨‍💼 Admin ID:', adminId);
            const deletedDonation = await Donation
                .findOneAndDelete({ _id: donationId, adminId })
                .populate('userId', 'firstName lastName flatNo floor mobile')
                .populate('eventId', 'name targetamount collectedamount');
            if (!deletedDonation) {
                console.log('❌ Donation not found for delete:', donationId);
                return { status: false, message: 'Donation not found' };
            }

            // If the deleted donation was accepted, decrease the collected amount and recalculate statistics
            if (deletedDonation.status === 'Accepted') {
                await EventCard.findByIdAndUpdate(deletedDonation.eventId, {
                    $inc: { collectedamount: -deletedDonation.amount }
                });
                console.log('💰 Event collected amount decreased due to deletion');
                
                // Recalculate total donors and average donation
                await DonationService.updateEventDonationStatistics(deletedDonation.eventId._id);
            }

            console.log('✅ Donation deleted successfully');
            return { status: true, message: 'Donation deleted successfully' };
        } catch (error) {
            console.log('❌ Error deleting donation:', error.message);
            return { status: false, message: 'Error deleting donation', error: error.message };
        }
    }

    static async updateEventDonationStatistics(eventId) {
        try {
            console.log('\n=== 📊 UPDATE EVENT DONATION STATISTICS ===');
            console.log('🎪 Event ID:', eventId);

            // Find all accepted donations for this event
            const acceptedDonations = await Donation.find({
                eventId: eventId,
                status: 'Accepted'
            });

            console.log('📊 Found accepted donations:', acceptedDonations.length);

            if (acceptedDonations.length === 0) {
                // No accepted donations, reset statistics
                await EventCard.findByIdAndUpdate(eventId, {
                    totalDonors: 0,
                    averageDonation: 0
                });
                console.log('📊 Statistics reset to 0');
                return { status: true, message: 'Statistics reset' };
            }

            // Calculate total unique donors
            const uniqueDonors = new Set(acceptedDonations.map(donation => donation.userId.toString()));
            const totalDonors = uniqueDonors.size;

            // Calculate average donation
            const totalAmount = acceptedDonations.reduce((sum, donation) => sum + donation.amount, 0);
            const averageDonation = totalAmount / acceptedDonations.length;

            // Update event with new statistics
            await EventCard.findByIdAndUpdate(eventId, {
                totalDonors: totalDonors,
                averageDonation: Math.round(averageDonation * 100) / 100 // Round to 2 decimal places
            });

            console.log('📊 Statistics updated:');
            console.log('👥 Total Donors:', totalDonors);
            console.log('💰 Average Donation:', averageDonation.toFixed(2));
            console.log('💵 Total Amount:', totalAmount);

            return {
                status: true,
                message: 'Event donation statistics updated',
                data: {
                    totalDonors,
                    averageDonation: Math.round(averageDonation * 100) / 100,
                    totalAmount
                }
            };

        } catch (error) {
            console.log('❌ Error updating event donation statistics:', error.message);
            return { status: false, message: 'Error updating statistics', error: error.message };
        }
    }
}

module.exports = DonationService;