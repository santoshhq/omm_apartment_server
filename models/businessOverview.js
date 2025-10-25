const mongoose = require('mongoose');
const db = require('../config/db');

const { Schema } = mongoose;

// Business Overview Schema
const businessOverviewSchema = new Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminMemberProfile', // Reference to adminMemberProfile collection
        required: true,
        index: true
    },
    revenue: {
        type: Number,
        required: true,
        min: [0, 'Revenue cannot be negative'],
        validate: {
            validator: function(value) {
                return value >= 0;
            },
            message: 'Revenue must be a non-negative number'
        }
    },
    expenses: {
        type: Number,
        required: true,
        min: [0, 'Expenses cannot be negative'],
        validate: {
            validator: function(value) {
                return value >= 0;
            },
            message: 'Expenses must be a non-negative number'
        }
    },
    investments: {
        type: Number,
        required: true,
        min: [0, 'Investments cannot be negative'],
        validate: {
            validator: function(value) {
                return value >= 0;
            },
            message: 'Investments must be a non-negative number'
        }
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

// Virtual field for profit/loss calculation
businessOverviewSchema.virtual('profitLoss').get(function() {
    return this.revenue - this.expenses - this.investments;
});

// Virtual field to determine if it's profit or loss
businessOverviewSchema.virtual('isProfit').get(function() {
    return this.profitLoss >= 0;
});

// Virtual field for status
businessOverviewSchema.virtual('status').get(function() {
    const pl = this.profitLoss;
    if (pl > 0) return 'Profit';
    if (pl < 0) return 'Loss';
    return 'Break-even';
});

// Add indexes for better query performance
businessOverviewSchema.index({ memberId: 1, transactionDate: -1 });

// Pre-save middleware for logging
businessOverviewSchema.pre('save', function(next) {
    const profitLoss = this.revenue - this.expenses - this.investments;
    console.log(`[BusinessOverview] Saving business: ${this.businessName}, Revenue: ₹${this.revenue}, Expenses: ₹${this.expenses}, Investments: ₹${this.investments}, P&L: ₹${profitLoss}`);
    next();
});

// Post-save middleware for logging
businessOverviewSchema.post('save', function(doc) {
    console.log(`[BusinessOverview] Successfully saved business with ID: ${doc._id}`);
});

// Static method to calculate business summary for a member
businessOverviewSchema.statics.calculateBusinessSummary = async function(memberId) {
    const businesses = await this.find({ memberId });

    let totalRevenue = 0, totalExpenses = 0, totalInvestments = 0, totalProfitLoss = 0;
    let profitableBusinesses = 0, lossMakingBusinesses = 0;

    businesses.forEach((business) => {
        totalRevenue += business.revenue;
        totalExpenses += business.expenses;
        totalInvestments += business.investments;

        const pl = business.revenue - business.expenses - business.investments;
        totalProfitLoss += pl;

        if (pl > 0) profitableBusinesses++;
        else if (pl < 0) lossMakingBusinesses++;
    });

    return {
        totalBusinesses: businesses.length,
        totalRevenue,
        totalExpenses,
        totalInvestments,
        totalProfitLoss,
        profitableBusinesses,
        lossMakingBusinesses,
        breakEvenBusinesses: businesses.length - profitableBusinesses - lossMakingBusinesses,
        averageProfitLoss: businesses.length > 0 ? totalProfitLoss / businesses.length : 0
    };
};

// Ensure virtual fields are serialized
businessOverviewSchema.set('toJSON', { virtuals: true });
businessOverviewSchema.set('toObject', { virtuals: true });

const BusinessOverview = db.model('BusinessOverview', businessOverviewSchema);

module.exports = BusinessOverview;