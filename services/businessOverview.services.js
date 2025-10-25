// businessOverview.services.js
const BusinessOverview = require('../models/businessOverview');

class BusinessOverviewService {
    // 🏢 Add Business Entry + Auto P&L Calculation
    static async addBusiness(data) {
        try {
            const business = new BusinessOverview(data);
            await business.save();

            // Calculate profit/loss
            const profitLoss = business.revenue - business.expenses - business.investments;
            const status = profitLoss > 0 ? 'Profit' : profitLoss < 0 ? 'Loss' : 'Break-even';

            return {
                message: 'Business entry added successfully',
                business,
                profitLoss,
                status,
                summary: {
                    revenue: business.revenue,
                    expenses: business.expenses,
                    investments: business.investments,
                    profitLoss,
                    status
                }
            };
        } catch (error) {
            throw new Error(`Failed to add business entry: ${error.message}`);
        }
    }

    // 📊 Get Business Summary for Member
    static async getBusinessSummary(memberId) {
        try {
            const businesses = await BusinessOverview.find({ memberId }).sort({ createdAt: -1 });

            // Calculate totals and statistics
            let totalRevenue = 0, totalExpenses = 0, totalInvestments = 0, totalProfitLoss = 0;
            let profitableBusinesses = 0, lossMakingBusinesses = 0, breakEvenBusinesses = 0;

            const businessDetails = businesses.map(business => {
                const profitLoss = business.revenue - business.expenses - business.investments;
                const status = profitLoss > 0 ? 'Profit' : profitLoss < 0 ? 'Loss' : 'Break-even';

                totalRevenue += business.revenue;
                totalExpenses += business.expenses;
                totalInvestments += business.investments;
                totalProfitLoss += profitLoss;

                if (profitLoss > 0) profitableBusinesses++;
                else if (profitLoss < 0) lossMakingBusinesses++;
                else breakEvenBusinesses++;

                return {
                    _id: business._id,
                    businessName: business.businessName,
                    businessType: business.businessType,
                    revenue: business.revenue,
                    expenses: business.expenses,
                    investments: business.investments,
                    profitLoss,
                    status,
                    notes: business.notes,
                    createdAt: business.createdAt
                };
            });

            return {
                businesses: businessDetails,
                summary: {
                    totalBusinesses: businesses.length,
                    totalRevenue,
                    totalExpenses,
                    totalInvestments,
                    totalProfitLoss,
                    profitableBusinesses,
                    lossMakingBusinesses,
                    breakEvenBusinesses,
                    averageProfitLoss: businesses.length > 0 ? totalProfitLoss / businesses.length : 0,
                    overallStatus: totalProfitLoss > 0 ? 'Overall Profit' : totalProfitLoss < 0 ? 'Overall Loss' : 'Overall Break-even'
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch business summary: ${error.message}`);
        }
    }

    // 📂 Get Businesses by Type
    static async getBusinessesByType(memberId, businessType) {
        try {
            const businesses = await BusinessOverview.find({
                memberId,
                businessType
            }).sort({ createdAt: -1 });

            const businessDetails = businesses.map(business => {
                const profitLoss = business.revenue - business.expenses - business.investments;
                const status = profitLoss > 0 ? 'Profit' : profitLoss < 0 ? 'Loss' : 'Break-even';

                return {
                    _id: business._id,
                    businessName: business.businessName,
                    businessType: business.businessType,
                    revenue: business.revenue,
                    expenses: business.expenses,
                    investments: business.investments,
                    profitLoss,
                    status,
                    notes: business.notes,
                    createdAt: business.createdAt
                };
            });

            return businessDetails;
        } catch (error) {
            throw new Error(`Failed to fetch businesses by type: ${error.message}`);
        }
    }

    // 💰 Get Businesses by Profit/Loss Status
    static async getBusinessesByStatus(memberId, status) {
        try {
            const businesses = await BusinessOverview.find({ memberId }).sort({ createdAt: -1 });

            const filteredBusinesses = businesses.filter(business => {
                const profitLoss = business.revenue - business.expenses - business.investments;
                const businessStatus = profitLoss > 0 ? 'Profit' : profitLoss < 0 ? 'Loss' : 'Break-even';
                return businessStatus === status;
            });

            const businessDetails = filteredBusinesses.map(business => {
                const profitLoss = business.revenue - business.expenses - business.investments;
                const businessStatus = profitLoss > 0 ? 'Profit' : profitLoss < 0 ? 'Loss' : 'Break-even';

                return {
                    _id: business._id,
                    businessName: business.businessName,
                    businessType: business.businessType,
                    revenue: business.revenue,
                    expenses: business.expenses,
                    investments: business.investments,
                    profitLoss,
                    status: businessStatus,
                    notes: business.notes,
                    createdAt: business.createdAt
                };
            });

            return businessDetails;
        } catch (error) {
            throw new Error(`Failed to fetch businesses by status: ${error.message}`);
        }
    }

    // ✏️ Update Business Entry
    static async updateBusiness(id, updateData) {
        try {
            const business = await BusinessOverview.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!business) {
                throw new Error('Business entry not found');
            }

            // Recalculate profit/loss after update
            const profitLoss = business.revenue - business.expenses - business.investments;
            const status = profitLoss > 0 ? 'Profit' : profitLoss < 0 ? 'Loss' : 'Break-even';

            return {
                message: 'Business entry updated successfully',
                business,
                profitLoss,
                status,
                summary: {
                    revenue: business.revenue,
                    expenses: business.expenses,
                    investments: business.investments,
                    profitLoss,
                    status
                }
            };
        } catch (error) {
            throw new Error(`Failed to update business entry: ${error.message}`);
        }
    }

    // 🗑️ Delete Business Entry
    static async deleteBusiness(id) {
        try {
            const business = await BusinessOverview.findByIdAndDelete(id);

            if (!business) {
                throw new Error('Business entry not found');
            }

            // Calculate final profit/loss for deleted business
            const profitLoss = business.revenue - business.expenses - business.investments;
            const status = profitLoss > 0 ? 'Profit' : profitLoss < 0 ? 'Loss' : 'Break-even';

            return {
                message: 'Business entry deleted successfully',
                deletedBusiness: business,
                profitLoss,
                status
            };
        } catch (error) {
            throw new Error(`Failed to delete business entry: ${error.message}`);
        }
    }

    // 📈 Get Top Performing Businesses
    static async getTopPerformingBusinesses(memberId, limit = 5) {
        try {
            const businesses = await BusinessOverview.find({ memberId });

            const businessesWithPL = businesses.map(business => {
                const profitLoss = business.revenue - business.expenses - business.investments;
                return {
                    ...business.toObject(),
                    profitLoss,
                    status: profitLoss > 0 ? 'Profit' : profitLoss < 0 ? 'Loss' : 'Break-even'
                };
            });

            // Sort by profit/loss descending (highest profit first)
            businessesWithPL.sort((a, b) => b.profitLoss - a.profitLoss);

            return businessesWithPL.slice(0, limit);
        } catch (error) {
            throw new Error(`Failed to fetch top performing businesses: ${error.message}`);
        }
    }
}

module.exports = BusinessOverviewService;
