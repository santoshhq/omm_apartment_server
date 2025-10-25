// test-financial-overview.js
// Comprehensive test file for Financial Overview with 10 months of data
const mongoose = require('mongoose');
const FinancialOverview = require('./models/financialOverview');
require('dotenv').config();

// Test member ID
const TEST_MEMBER_ID = "68f0d4175d6d73b831d007c9";

// Generate realistic financial data for 10 months
const generateTestData = () => {
    const transactions = [];
    const startDate = new Date('2024-01-01');

    // Monthly data patterns (realistic amounts)
    const monthlyData = [
        // January 2024
        {
            income: 45000, expense: 28000, investment: 5000, donation: 1000, savings: 11000,
            transactions: [
                { title: "January Salary", category: "Income", amount: 45000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Grocery Shopping", category: "Expense", amount: 8000 },
                { title: "Electricity Bill", category: "Expense", amount: 3000 },
                { title: "Internet Bill", category: "Expense", amount: 2000 },
                { title: "Mutual Fund Investment", category: "Investment", amount: 5000 },
                { title: "Charity Donation", category: "Donation", amount: 1000 },
                { title: "Emergency Fund", category: "Savings", amount: 11000 }
            ]
        },
        // February 2024
        {
            income: 45000, expense: 25000, investment: 8000, donation: 1500, savings: 10500,
            transactions: [
                { title: "February Salary", category: "Income", amount: 45000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Grocery Shopping", category: "Expense", amount: 7000 },
                { title: "Water Bill", category: "Expense", amount: 1500 },
                { title: "Gas Bill", category: "Expense", amount: 2500 },
                { title: "Stock Investment", category: "Investment", amount: 8000 },
                { title: "Temple Donation", category: "Donation", amount: 1500 },
                { title: "Monthly Savings", category: "Savings", amount: 10500 }
            ]
        },
        // March 2024
        {
            income: 48000, expense: 32000, investment: 6000, donation: 2000, savings: 8000,
            transactions: [
                { title: "March Salary + Bonus", category: "Income", amount: 48000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Grocery Shopping", category: "Expense", amount: 9000 },
                { title: "Car Maintenance", category: "Expense", amount: 5000 },
                { title: "Phone Bill", category: "Expense", amount: 2000 },
                { title: "FD Investment", category: "Investment", amount: 6000 },
                { title: "NGO Donation", category: "Donation", amount: 2000 },
                { title: "Vacation Fund", category: "Savings", amount: 8000 }
            ]
        },
        // April 2024
        {
            income: 45000, expense: 27000, investment: 7000, donation: 1200, savings: 9800,
            transactions: [
                { title: "April Salary", category: "Income", amount: 45000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Grocery Shopping", category: "Expense", amount: 7500 },
                { title: "Medical Expenses", category: "Expense", amount: 4000 },
                { title: "Entertainment", category: "Expense", amount: 2500 },
                { title: "Gold Investment", category: "Investment", amount: 7000 },
                { title: "Religious Donation", category: "Donation", amount: 1200 },
                { title: "Education Fund", category: "Savings", amount: 9800 }
            ]
        },
        // May 2024
        {
            income: 47000, expense: 29000, investment: 5500, donation: 1800, savings: 10700,
            transactions: [
                { title: "May Salary", category: "Income", amount: 47000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Grocery Shopping", category: "Expense", amount: 8200 },
                { title: "Home Insurance", category: "Expense", amount: 3000 },
                { title: "Dining Out", category: "Expense", amount: 2800 },
                { title: "Crypto Investment", category: "Investment", amount: 5500 },
                { title: "Animal Shelter Donation", category: "Donation", amount: 1800 },
                { title: "Retirement Savings", category: "Savings", amount: 10700 }
            ]
        },
        // June 2024
        {
            income: 46000, expense: 31000, investment: 4000, donation: 1600, savings: 9400,
            transactions: [
                { title: "June Salary", category: "Income", amount: 46000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Summer Grocery", category: "Expense", amount: 9500 },
                { title: "AC Repair", category: "Expense", amount: 4000 },
                { title: "Vacation Expenses", category: "Expense", amount: 2500 },
                { title: "Bond Investment", category: "Investment", amount: 4000 },
                { title: "Education Donation", category: "Donation", amount: 1600 },
                { title: "Wedding Fund", category: "Savings", amount: 9400 }
            ]
        },
        // July 2024
        {
            income: 49000, expense: 33000, investment: 9000, donation: 2100, savings: 4900,
            transactions: [
                { title: "July Salary + Overtime", category: "Income", amount: 49000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Grocery Shopping", category: "Expense", amount: 10000 },
                { title: "Car Fuel", category: "Expense", amount: 5000 },
                { title: "Summer Vacation", category: "Expense", amount: 3000 },
                { title: "Real Estate Investment", category: "Investment", amount: 9000 },
                { title: "Flood Relief Donation", category: "Donation", amount: 2100 },
                { title: "House Down Payment", category: "Savings", amount: 4900 }
            ]
        },
        // August 2024
        {
            income: 45000, expense: 26000, investment: 6500, donation: 1400, savings: 11100,
            transactions: [
                { title: "August Salary", category: "Income", amount: 45000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Back to School Shopping", category: "Expense", amount: 8000 },
                { title: "School Fees", category: "Expense", amount: 3000 },
                { title: "Books & Supplies", category: "Expense", amount: 2000 },
                { title: "ETF Investment", category: "Investment", amount: 6500 },
                { title: "School Donation", category: "Donation", amount: 1400 },
                { title: "Children's Education Fund", category: "Savings", amount: 11100 }
            ]
        },
        // September 2024
        {
            income: 47500, expense: 29500, investment: 7500, donation: 1900, savings: 8600,
            transactions: [
                { title: "September Salary", category: "Income", amount: 47500 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Grocery Shopping", category: "Expense", amount: 8500 },
                { title: "Health Insurance", category: "Expense", amount: 4000 },
                { title: "Doctor Visit", category: "Expense", amount: 2000 },
                { title: "P2P Investment", category: "Investment", amount: 7500 },
                { title: "Medical Camp Donation", category: "Donation", amount: 1900 },
                { title: "Health Emergency Fund", category: "Savings", amount: 8600 }
            ]
        },
        // October 2024
        {
            income: 50000, expense: 28000, investment: 10000, donation: 2200, savings: 9800,
            transactions: [
                { title: "October Salary", category: "Income", amount: 50000 },
                { title: "Rent Payment", category: "Expense", amount: 12000 },
                { title: "Festival Shopping", category: "Expense", amount: 9000 },
                { title: "Festival Celebration", category: "Expense", amount: 3000 },
                { title: "Gift Purchases", category: "Expense", amount: 2000 },
                { title: "Portfolio Diversification", category: "Investment", amount: 10000 },
                { title: "Festival Donation", category: "Donation", amount: 2200 },
                { title: "Festival Savings", category: "Savings", amount: 9800 }
            ]
        }
    ];

    // Generate transactions for each month
    monthlyData.forEach((monthData, monthIndex) => {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthIndex);

        monthData.transactions.forEach((transaction, index) => {
            const transactionDate = new Date(monthDate);
            transactionDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day in month

            transactions.push({
                memberId: TEST_MEMBER_ID,
                transactionTitle: transaction.title,
                amount: transaction.amount,
                category: transaction.category,
                transactionDate: transactionDate,
                notes: `Auto-generated test transaction for ${monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
            });
        });
    });

    return transactions;
};

// Main test function
async function runFinancialOverviewTest() {
    try {
        console.log('🚀 Starting Financial Overview Comprehensive Test...\n');

        // Connect to database
        const db = require('./config/db');
        console.log('📊 Connected to database');

        // Clear existing test data for this member
        console.log('🧹 Clearing existing test data...');
        await FinancialOverview.deleteMany({ memberId: TEST_MEMBER_ID });
        console.log('✅ Cleared existing data\n');

        // Generate and insert test data
        console.log('📝 Generating 10 months of test data...');
        const testTransactions = generateTestData();
        console.log(`📊 Generated ${testTransactions.length} transactions\n`);

        // Insert transactions
        console.log('💾 Inserting transactions into database...');
        const insertedTransactions = await FinancialOverview.insertMany(testTransactions);
        console.log(`✅ Successfully inserted ${insertedTransactions.length} transactions\n`);

        // Calculate and display summary
        console.log('📈 Calculating financial summary...');
        const allTransactions = await FinancialOverview.find({ memberId: TEST_MEMBER_ID });

        let totalIncome = 0, totalExpense = 0, totalInvestment = 0, totalDonation = 0, totalSavings = 0;

        allTransactions.forEach((t) => {
            switch (t.category) {
                case 'Income':
                    totalIncome += t.amount;
                    break;
                case 'Expense':
                    totalExpense += t.amount;
                    break;
                case 'Investment':
                    totalInvestment += t.amount;
                    break;
                case 'Donation':
                    totalDonation += t.amount;
                    break;
                case 'Savings':
                    totalSavings += t.amount;
                    break;
            }
        });

        const finalBalance = totalIncome - (totalExpense + totalInvestment + totalDonation) + totalSavings;

        console.log('🎯 FINANCIAL SUMMARY (10 Months):');
        console.log('=====================================');
        console.log(`💰 Total Income: ₹${totalIncome.toLocaleString()}`);
        console.log(`💸 Total Expenses: ₹${totalExpense.toLocaleString()}`);
        console.log(`📈 Total Investments: ₹${totalInvestment.toLocaleString()}`);
        console.log(`🙏 Total Donations: ₹${totalDonation.toLocaleString()}`);
        console.log(`💾 Total Savings: ₹${totalSavings.toLocaleString()}`);
        console.log(`⚖️  Final Balance: ₹${finalBalance.toLocaleString()}`);
        console.log(`📊 Total Transactions: ${allTransactions.length}`);
        console.log('=====================================\n');

        // Monthly breakdown
        console.log('📅 MONTHLY BREAKDOWN:');
        console.log('===================');

        const monthlyStats = {};
        allTransactions.forEach((t) => {
            const monthKey = t.transactionDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { income: 0, expense: 0, investment: 0, donation: 0, savings: 0 };
            }
            monthlyStats[monthKey][t.category.toLowerCase()] += t.amount;
        });

        Object.keys(monthlyStats).forEach(month => {
            const stats = monthlyStats[month];
            const balance = stats.income - (stats.expense + stats.investment + stats.donation) + stats.savings;
            console.log(`${month}:`);
            console.log(`  Income: ₹${stats.income.toLocaleString()} | Expenses: ₹${stats.expense.toLocaleString()} | Balance: ₹${balance.toLocaleString()}`);
        });

        console.log('\n✅ Test completed successfully!');
        console.log('🎯 You can now test the API endpoints with memberId: ' + TEST_MEMBER_ID);
        console.log('\n📋 API Test URLs:');
        console.log(`   GET Summary: http://localhost:8080/api/financial/?memberId=${TEST_MEMBER_ID}`);
        console.log(`   GET by Category: http://localhost:8080/api/financial/category/Income?memberId=${TEST_MEMBER_ID}`);
        console.log(`   POST Transaction: http://localhost:8080/api/financial/`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    runFinancialOverviewTest();
}

module.exports = { runFinancialOverviewTest, TEST_MEMBER_ID };