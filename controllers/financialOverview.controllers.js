const FinancialOverviewService = require('../services/financialOverview.services');

class FinancialOverviewController {
    // Add a new transaction
    static async addTransaction(req, res) {
        try {
            console.log('\n=== 💰 ADD FINANCIAL TRANSACTION CONTROLLER CALLED ===');

            // Get memberId from request body (required)
            const { memberId, transactionTitle, amount, category, transactionDate, notes } = req.body;

            console.log('📊 Transaction Details:');
            console.log('  - Member ID:', memberId);
            console.log('  - Title:', transactionTitle);
            console.log('  - Amount:', amount);
            console.log('  - Category:', category);
            console.log('  - Date:', transactionDate);
            console.log('  - Notes:', notes);

            // Validate required fields
            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'memberId is required in request body'
                });
            }

            if (!transactionTitle || !amount || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'transactionTitle, amount, and category are required'
                });
            }

            // Validate amount
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be a positive number'
                });
            }

            const result = await FinancialOverviewService.addTransaction(
                memberId,
                transactionTitle,
                numAmount,
                category,
                transactionDate,
                notes
            );

            console.log('✅ Transaction added successfully with ID:', result.transaction._id);
            return res.status(201).json({
                success: true,
                message: result.message,
                data: result.transaction,
                summary: result.summary
            });
        } catch (error) {
            console.error('❌ Error in addTransaction controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Get financial summary for a member
    static async getFinancialSummary(req, res) {
        try {
            console.log('\n=== 📊 GET FINANCIAL SUMMARY CONTROLLER CALLED ===');

            // Get memberId from URL parameter
            const { memberId } = req.params;

            console.log('� Member ID:', memberId);

            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'memberId is required as URL parameter'
                });
            }

            const result = await FinancialOverviewService.getFinancialSummary(memberId);

            console.log(`✅ Retrieved ${result.transactions.length} transactions for member: ${memberId}`);
            return res.status(200).json({
                success: true,
                message: 'Financial summary retrieved successfully',
                data: result.transactions,
                summary: result.summary,
                count: result.transactions.length
            });
        } catch (error) {
            console.error('❌ Error in getFinancialSummary controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Get transactions by category
    static async getTransactionsByCategory(req, res) {
        try {
            console.log('\n=== 📂 GET TRANSACTIONS BY CATEGORY CONTROLLER CALLED ===');

            // Get memberId from query parameter
            const memberId = req.query.memberId;
            const { category } = req.params;

            console.log('� Member ID:', memberId);
            console.log('📂 Category:', category);

            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'memberId is required as query parameter'
                });
            }

            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Category is required'
                });
            }

            // Validate category
            const validCategories = ['Income', 'Expense', 'Investment', 'Savings', 'Donation'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
                });
            }

            const transactions = await FinancialOverviewService.getTransactionsByCategory(memberId, category);

            console.log(`✅ Retrieved ${transactions.length} ${category} transactions`);
            return res.status(200).json({
                success: true,
                message: `${category} transactions retrieved successfully`,
                data: transactions,
                count: transactions.length,
                category
            });
        } catch (error) {
            console.error('❌ Error in getTransactionsByCategory controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Get transactions by date range
    static async getTransactionsByDateRange(req, res) {
        try {
            console.log('\n=== 📅 GET TRANSACTIONS BY DATE RANGE CONTROLLER CALLED ===');

            // Get memberId from query parameter
            const memberId = req.query.memberId;
            const { startDate, endDate } = req.query;

            console.log('👤 Member ID:', memberId);
            console.log('� Date Range:', startDate, 'to', endDate);

            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: 'memberId is required as query parameter'
                });
            }

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate are required as query parameters'
                });
            }

            const transactions = await FinancialOverviewService.getTransactionsByDateRange(memberId, startDate, endDate);

            console.log(`✅ Retrieved ${transactions.length} transactions between ${startDate} and ${endDate}`);
            return res.status(200).json({
                success: true,
                message: 'Transactions retrieved successfully',
                data: transactions,
                count: transactions.length,
                dateRange: { startDate, endDate }
            });
        } catch (error) {
            console.error('❌ Error in getTransactionsByDateRange controller:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    // Update transaction
    static async updateTransaction(req, res) {
        try {
            console.log('\n=== ✏️ UPDATE TRANSACTION CONTROLLER CALLED ===');

            const { id } = req.params;
            const updateData = req.body;

            console.log('🆔 Transaction ID:', id);
            console.log('📝 Update Data:', JSON.stringify(updateData, null, 2));

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID is required'
                });
            }

            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Update data is required'
                });
            }

            const result = await FinancialOverviewService.updateTransaction(id, updateData);

            console.log('✅ Transaction updated successfully:', result.transaction._id);
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.transaction,
                summary: result.summary
            });
        } catch (error) {
            console.error('❌ Error in updateTransaction controller:', error.message);

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

    // Delete transaction
    static async deleteTransaction(req, res) {
        try {
            console.log('\n=== 🗑️ DELETE TRANSACTION CONTROLLER CALLED ===');

            const { id } = req.params;
            console.log('🆔 Transaction ID:', id);

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID is required'
                });
            }

            const result = await FinancialOverviewService.deleteTransaction(id);

            console.log('✅ Transaction deleted successfully:', id);
            return res.status(200).json({
                success: true,
                message: result.message,
                deletedTransaction: result.deletedTransaction,
                summary: result.summary
            });
        } catch (error) {
            console.error('❌ Error in deleteTransaction controller:', error.message);

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

module.exports = FinancialOverviewController;
