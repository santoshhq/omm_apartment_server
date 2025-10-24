const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;

// Financial Overview Schema
const financialOverviewSchema = new Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminMemberProfile', // Reference to adminMemberProfile collection
        required: true,
        index: true
    },
    transactionTitle: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be greater than 0'],
        validate: {
            validator: function(value) {
                return value > 0;
            },
            message: 'Amount must be a positive number'
        }
    },
    category: {
        type: String,
        enum: ['Income', 'Expense', 'Investment', 'Savings', 'Donation'],
        required: true,
        trim: true
    },
    transactionDate: {
        type: Date,
        required: true,
        default: Date.now,
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: 'Transaction date cannot be in the future'
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
financialOverviewSchema.index({ memberId: 1, transactionDate: -1 });
financialOverviewSchema.index({ category: 1 });
financialOverviewSchema.index({ memberId: 1, category: 1 });

// Pre-save middleware for logging
financialOverviewSchema.pre('save', function(next) {
    console.log(`[FinancialOverview] Saving transaction for member: ${this.memberId}, Amount: ${this.amount}, Category: ${this.category}`);
    next();
});

// Post-save middleware for logging
financialOverviewSchema.post('save', function(doc) {
    console.log(`[FinancialOverview] Successfully saved transaction with ID: ${doc._id}`);
});

// Static method to calculate financial summary
financialOverviewSchema.statics.calculateSummary = async function(memberId) {
    const transactions = await this.find({ memberId });

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

    // Correct balance calculation: Income - (Expense + Investment + Donation) + Savings
    const balance = income - (expense + investment + donation) + savings;

    return {
        income,
        expense,
        investment,
        donation,
        savings,
        balance,
        totalTransactions: transactions.length
    };
};

const FinancialOverview = db.model('FinancialOverview', financialOverviewSchema);

module.exports = FinancialOverview;