const BusinessOverviewService = require('../services/businessOverview.services');

class BusinessOverviewController {
    // 🏢 Add Business Entry
    static async addBusiness(req, res) {
        try {
            console.log('\n=== 🏢 ADD BUSINESS ENTRY CONTROLLER CALLED ===');

            // Get memberId from request body (required)
            const { memberId, revenue, expenses, investments, transactionDate, notes } = req.body;

            console.log('📊 Business Details:');
            console.log('  - Member ID:', memberId);
            console.log('  - Revenue:', revenue);
            console.log('  - Expenses:', expenses);
            console.log('  - Investments:', investments);
            console.log('  - Transaction Date:', transactionDate);
            console.log('  - Notes:', notes);

            // Validate required fields
            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'memberId is required in request body'
                });
            }

            if (revenue === undefined || expenses === undefined || investments === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'revenue, expenses, and investments are required'
                });
            }

            // Validate numeric fields
            const numRevenue = parseFloat(revenue);
            const numExpenses = parseFloat(expenses);
            const numInvestments = parseFloat(investments);

            if (isNaN(numRevenue) || numRevenue < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Revenue must be a non-negative number'
                });
            }

            if (isNaN(numExpenses) || numExpenses < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Expenses must be a non-negative number'
                });
            }

            if (isNaN(numInvestments) || numInvestments < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Investments must be a non-negative number'
                });
            }

            const result = await BusinessOverviewService.addBusiness({
                memberId,
                revenue: numRevenue,
                expenses: numExpenses,
                investments: numInvestments,
                transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
                notes: notes || ''
            });

            console.log('✅ Business entry added successfully with ID:', result.business._id);
            console.log('💰 Profit/Loss:', result.profitLoss, 'Status:', result.status);

            return res.status(201).json({
                success: true,
                message: result.message,
                data: result.business,
                profitLoss: result.profitLoss,
                status: result.status,
                summary: result.summary
            });
        } catch (error) {
            console.error('❌ Error in addBusiness controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // 📊 Get Business Summary
    static async getBusinessSummary(req, res) {
        try {
            console.log('\n=== 📊 GET BUSINESS SUMMARY CONTROLLER CALLED ===');

            // Get memberId from query parameter
            const memberId = req.query.memberId;

            console.log('👤 Member ID:', memberId);

            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'memberId is required as query parameter'
                });
            }

            const result = await BusinessOverviewService.getBusinessSummary(memberId);

            console.log(`✅ Retrieved ${result.businesses.length} business entries for member: ${memberId}`);
            console.log('💰 Total P&L:', result.summary.totalProfitLoss, 'Status:', result.summary.overallStatus);

            return res.status(200).json({
                success: true,
                message: 'Business summary retrieved successfully',
                data: result.businesses,
                summary: result.summary,
                count: result.businesses.length
            });
        } catch (error) {
            console.error('❌ Error in getBusinessSummary controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    //  Get Businesses by Status (Profit/Loss/Break-even)
    static async getBusinessesByStatus(req, res) {
        try {
            console.log('\n=== 💰 GET BUSINESSES BY STATUS CONTROLLER CALLED ===');

            // Get memberId from query parameter
            const memberId = req.query.memberId;
            const { status } = req.params;

            console.log('👤 Member ID:', memberId);
            console.log('📊 Status:', status);

            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'memberId is required as query parameter'
                });
            }

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            // Validate status
            const validStatuses = ['Profit', 'Loss', 'Break-even'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
                });
            }

            const businesses = await BusinessOverviewService.getBusinessesByStatus(memberId, status);

            console.log(`✅ Retrieved ${businesses.length} businesses with ${status} status`);
            return res.status(200).json({
                success: true,
                message: `Businesses with ${status} status retrieved successfully`,
                data: businesses,
                count: businesses.length,
                status
            });
        } catch (error) {
            console.error('❌ Error in getBusinessesByStatus controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // 📈 Get Top Performing Businesses
    static async getTopPerformingBusinesses(req, res) {
        try {
            console.log('\n=== 📈 GET TOP PERFORMING BUSINESSES CONTROLLER CALLED ===');

            // Get memberId from query parameter
            const memberId = req.query.memberId;
            const limit = parseInt(req.query.limit) || 5;

            console.log('👤 Member ID:', memberId);
            console.log('🔝 Limit:', limit);

            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'memberId is required as query parameter'
                });
            }

            const businesses = await BusinessOverviewService.getTopPerformingBusinesses(memberId, limit);

            console.log(`✅ Retrieved top ${businesses.length} performing businesses`);
            return res.status(200).json({
                success: true,
                message: `Top ${businesses.length} performing businesses retrieved successfully`,
                data: businesses,
                count: businesses.length,
                limit
            });
        } catch (error) {
            console.error('❌ Error in getTopPerformingBusinesses controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // ✏️ Update Business Entry
    static async updateBusiness(req, res) {
        try {
            console.log('\n=== ✏️ UPDATE BUSINESS ENTRY CONTROLLER CALLED ===');

            const { id } = req.params;
            const updateData = req.body;

            console.log('🆔 Business ID:', id);
            console.log('📝 Update Data:', JSON.stringify(updateData, null, 2));

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Business ID is required'
                });
            }

            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Update data is required'
                });
            }

            const result = await BusinessOverviewService.updateBusiness(id, updateData);

            console.log('✅ Business entry updated successfully:', result.business._id);
            console.log('💰 Updated P&L:', result.profitLoss, 'Status:', result.status);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.business,
                profitLoss: result.profitLoss,
                status: result.status,
                summary: result.summary
            });
        } catch (error) {
            console.error('❌ Error in updateBusiness controller:', error.message);

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

    // 🗑️ Delete Business Entry
    static async deleteBusiness(req, res) {
        try {
            console.log('\n=== 🗑️ DELETE BUSINESS ENTRY CONTROLLER CALLED ===');

            const { id } = req.params;
            console.log('🆔 Business ID:', id);

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Business ID is required'
                });
            }

            const result = await BusinessOverviewService.deleteBusiness(id);

            console.log('✅ Business entry deleted successfully:', id);
            console.log('💰 Final P&L:', result.profitLoss, 'Status:', result.status);

            return res.status(200).json({
                success: true,
                message: result.message,
                deletedBusiness: result.deletedBusiness,
                profitLoss: result.profitLoss,
                status: result.status
            });
        } catch (error) {
            console.error('❌ Error in deleteBusiness controller:', error.message);

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
}

module.exports = BusinessOverviewController;
