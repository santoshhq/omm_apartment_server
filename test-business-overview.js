// test-business-overview.js
// Comprehensive test file for Business Overview with profit/loss calculations
const mongoose = require('mongoose');
const BusinessOverview = require('./models/businessOverview');
require('dotenv').config();

// Test member ID
const TEST_MEMBER_ID = "68f0d4175d6d73b831d007c9";

// Generate realistic business data with profit/loss scenarios
const generateTestBusinessData = () => {
    const businesses = [
        // Profitable Businesses
        {
            businessName: "Tech Startup Solutions",
            businessType: "Technology",
            revenue: 250000,
            expenses: 180000,
            investments: 50000,
            notes: "Software development company - High growth potential"
        },
        {
            businessName: "Green Grocery Store",
            businessType: "Retail",
            revenue: 150000,
            expenses: 95000,
            investments: 25000,
            notes: "Organic food retail - Steady profits"
        },
        {
            businessName: "Digital Marketing Agency",
            businessType: "Services",
            revenue: 200000,
            expenses: 140000,
            investments: 30000,
            notes: "SEO and social media marketing services"
        },
        {
            businessName: "Manufacturing Unit Alpha",
            businessType: "Manufacturing",
            revenue: 300000,
            expenses: 220000,
            investments: 60000,
            notes: "Electronics manufacturing - Profitable operations"
        },
        {
            businessName: "Healthcare Clinic Plus",
            businessType: "Healthcare",
            revenue: 180000,
            expenses: 120000,
            investments: 40000,
            notes: "Medical clinic - Good profit margins"
        },

        // Loss Making Businesses
        {
            businessName: "New Restaurant Venture",
            businessType: "Services",
            revenue: 80000,
            expenses: 120000,
            investments: 45000,
            notes: "New restaurant - Initial losses expected"
        },
        {
            businessName: "E-commerce Startup",
            businessType: "Retail",
            revenue: 50000,
            expenses: 90000,
            investments: 35000,
            notes: "Online retail - Scaling phase losses"
        },
        {
            businessName: "R&D Division Beta",
            businessType: "Technology",
            revenue: 30000,
            expenses: 80000,
            investments: 55000,
            notes: "Research division - Expected losses during development"
        },

        // Break-even Businesses
        {
            businessName: "Consulting Services Pro",
            businessType: "Services",
            revenue: 120000,
            expenses: 90000,
            investments: 30000,
            notes: "Management consulting - Break-even point"
        },
        {
            businessName: "Educational Center",
            businessType: "Education",
            revenue: 100000,
            expenses: 75000,
            investments: 25000,
            notes: "Training center - At break-even"
        },

        // Mixed Performance
        {
            businessName: "Real Estate Development",
            businessType: "Other",
            revenue: 500000,
            expenses: 350000,
            investments: 120000,
            notes: "Property development - High profit potential"
        },
        {
            businessName: "Food Processing Unit",
            businessType: "Manufacturing",
            revenue: 280000,
            expenses: 250000,
            investments: 40000,
            notes: "Food processing - Moderate profits"
        },
        {
            businessName: "Mobile Repair Service",
            businessType: "Services",
            revenue: 90000,
            expenses: 110000,
            investments: 15000,
            notes: "Mobile repair shop - Operational losses"
        },
        {
            businessName: "Bookstore Chain",
            businessType: "Retail",
            revenue: 160000,
            expenses: 130000,
            investments: 35000,
            notes: "Book retail - Steady profits"
        },
        {
            businessName: "Fitness Center",
            businessType: "Healthcare",
            revenue: 140000,
            expenses: 125000,
            investments: 20000,
            notes: "Gym and fitness center - Small profits"
        }
    ];

    // Add memberId and creation dates
    return businesses.map((business, index) => ({
        ...business,
        memberId: TEST_MEMBER_ID,
        // Spread creation dates over the last 6 months
        createdAt: new Date(Date.now() - (index * 15 * 24 * 60 * 60 * 1000)) // 15 days apart
    }));
};

// Main test function
async function runBusinessOverviewTest() {
    try {
        console.log('🚀 Starting Business Overview Comprehensive Test...\n');

        // Connect to database
        const db = require('./config/db');
        console.log('📊 Connected to database');

        // Clear existing test data for this member
        console.log('🧹 Clearing existing test data...');
        await BusinessOverview.deleteMany({ memberId: TEST_MEMBER_ID });
        console.log('✅ Cleared existing data\n');

        // Generate and insert test data
        console.log('📝 Generating business test data...');
        const testBusinesses = generateTestBusinessData();
        console.log(`📊 Generated ${testBusinesses.length} business entries\n`);

        // Insert businesses
        console.log('💾 Inserting business entries into database...');
        const insertedBusinesses = await BusinessOverview.insertMany(testBusinesses);
        console.log(`✅ Successfully inserted ${insertedBusinesses.length} business entries\n`);

        // Calculate and display comprehensive summary
        console.log('📈 Calculating business performance summary...');
        const allBusinesses = await BusinessOverview.find({ memberId: TEST_MEMBER_ID });

        let totalRevenue = 0, totalExpenses = 0, totalInvestments = 0, totalProfitLoss = 0;
        let profitableBusinesses = 0, lossMakingBusinesses = 0, breakEvenBusinesses = 0;

        const businessAnalysis = allBusinesses.map(business => {
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
                name: business.businessName,
                type: business.businessType,
                revenue: business.revenue,
                expenses: business.expenses,
                investments: business.investments,
                profitLoss,
                status
            };
        });

        console.log('🏢 BUSINESS PERFORMANCE SUMMARY:');
        console.log('=====================================');
        console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString()}`);
        console.log(`💸 Total Expenses: ₹${totalExpenses.toLocaleString()}`);
        console.log(`📈 Total Investments: ₹${totalInvestments.toLocaleString()}`);
        console.log(`⚖️  Total Profit/Loss: ₹${totalProfitLoss.toLocaleString()}`);
        console.log(`📊 Total Businesses: ${allBusinesses.length}`);
        console.log('=====================================\n');

        console.log('📊 BUSINESS STATUS BREAKDOWN:');
        console.log('==============================');
        console.log(`✅ Profitable Businesses: ${profitableBusinesses}`);
        console.log(`❌ Loss Making Businesses: ${lossMakingBusinesses}`);
        console.log(`⚖️  Break-even Businesses: ${breakEvenBusinesses}`);
        console.log('==============================\n');

        // Top 5 performing businesses
        console.log('🏆 TOP 5 PERFORMING BUSINESSES:');
        console.log('================================');

        const sortedByProfit = businessAnalysis.sort((a, b) => b.profitLoss - a.profitLoss);
        sortedByProfit.slice(0, 5).forEach((business, index) => {
            console.log(`${index + 1}. ${business.name}`);
            console.log(`   Type: ${business.type} | P&L: ₹${business.profitLoss.toLocaleString()} (${business.status})`);
        });

        console.log('\n📊 BUSINESS TYPE ANALYSIS:');
        console.log('===========================');

        const typeAnalysis = {};
        businessAnalysis.forEach(business => {
            if (!typeAnalysis[business.type]) {
                typeAnalysis[business.type] = { count: 0, totalPL: 0 };
            }
            typeAnalysis[business.type].count++;
            typeAnalysis[business.type].totalPL += business.profitLoss;
        });

        Object.keys(typeAnalysis).forEach(type => {
            const analysis = typeAnalysis[type];
            console.log(`${type}: ${analysis.count} businesses | Total P&L: ₹${analysis.totalPL.toLocaleString()}`);
        });

        console.log('\n✅ Test completed successfully!');
        console.log('🎯 You can now test the API endpoints with memberId: ' + TEST_MEMBER_ID);
        console.log('\n📋 API Test URLs:');
        console.log(`   GET Summary: http://localhost:8080/api/business/?memberId=${TEST_MEMBER_ID}`);
        console.log(`   GET by Type: http://localhost:8080/api/business/type/Technology?memberId=${TEST_MEMBER_ID}`);
        console.log(`   GET by Status: http://localhost:8080/api/business/status/Profit?memberId=${TEST_MEMBER_ID}`);
        console.log(`   GET Top Performing: http://localhost:8080/api/business/top-performing?memberId=${TEST_MEMBER_ID}&limit=3`);
        console.log(`   POST Business: http://localhost:8080/api/business/`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    runBusinessOverviewTest();
}

module.exports = { runBusinessOverviewTest, TEST_MEMBER_ID };