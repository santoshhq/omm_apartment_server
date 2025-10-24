// financialOverview.services.js
const FinancialOverview = require('../models/financialOverview');

class FinancialOverviewService {
  // 🧮 Add Transaction + Auto Balance Update
  static async addTransaction(memberId, transactionTitle, amount, category, transactionDate, notes) {
    try {
      const data = {
        memberId,
        transactionTitle,
        amount,
        category,
        transactionDate: transactionDate || new Date(),
        notes: notes || ''
      };

      const transaction = new FinancialOverview(data);
      await transaction.save();

      // Fetch all transactions for that member
      const allTransactions = await FinancialOverview.find({ memberId });

      // Group totals by category
      let income = 0, expense = 0, investment = 0, donation = 0, savings = 0;

      allTransactions.forEach((t) => {
        switch (t.category) {
          case 'Income':
            income += t.amount;
            break;
          case 'Expense':
            expense += t.amount;
            break;
          case 'Investment':
            investment += t.amount;
            break;
          case 'Donation':
            donation += t.amount;
            break;
          case 'Savings':
            savings += t.amount;
            break;
        }
      });

      // 🧮 Final balance formula (Fixed: Savings should be added, not subtracted)
      const balance = income - (expense + investment + donation) + savings;

      return {
        message: 'Transaction added successfully',
        transaction,
        summary: {
          income,
          expense,
          investment,
          donation,
          savings,
          balance
        }
      };
    } catch (error) {
      throw new Error(`Failed to add transaction: ${error.message}`);
    }
  }

  // 🧾 Get All Transactions + Summary
  static async getFinancialSummary(memberId) {
    try {
      const transactions = await FinancialOverview.find({ memberId });

      let income = 0, expense = 0, investment = 0, donation = 0, savings = 0;

      transactions.forEach((t) => {
        switch (t.category) {
          case 'Income':
            income += t.amount;
            break;
          case 'Expense':
            expense += t.amount;
            break;
          case 'Investment':
            investment += t.amount;
            break;
          case 'Donation':
            donation += t.amount;
            break;
          case 'Savings':
            savings += t.amount;
            break;
        }
      });

      // Fixed balance calculation
      const balance = income - (expense + investment + donation) + savings;

      return {
        transactions,
        summary: {
          income,
          expense,
          investment,
          donation,
          savings,
          balance
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch summary: ${error.message}`);
    }
  }

  // 📂 Get Transactions by Category
  static async getTransactionsByCategory(memberId, category) {
    try {
      const transactions = await FinancialOverview.find({
        memberId,
        category
      }).sort({ transactionDate: -1 });

      return transactions;
    } catch (error) {
      throw new Error(`Failed to fetch transactions by category: ${error.message}`);
    }
  }

  // 📅 Get Transactions by Date Range
  static async getTransactionsByDateRange(memberId, startDate, endDate) {
    try {
      const transactions = await FinancialOverview.find({
        memberId,
        transactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).sort({ transactionDate: -1 });

      return transactions;
    } catch (error) {
      throw new Error(`Failed to fetch transactions by date range: ${error.message}`);
    }
  }

  // ✏️ Update Transaction
  static async updateTransaction(id, updateData) {
    try {
      const transaction = await FinancialOverview.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Recalculate summary after update
      const summary = await FinancialOverviewService.getFinancialSummary(transaction.memberId);

      return {
        message: 'Transaction updated successfully',
        transaction,
        summary: summary.summary
      };
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  // 🗑️ Delete Transaction
  static async deleteTransaction(id) {
    try {
      const transaction = await FinancialOverview.findByIdAndDelete(id);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Recalculate summary after deletion
      const summary = await FinancialOverviewService.getFinancialSummary(transaction.memberId);

      return {
        message: 'Transaction deleted successfully',
        deletedTransaction: transaction,
        summary: summary.summary
      };
    } catch (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }
}

module.exports = FinancialOverviewService;