// test-business-10months.js
// Inserts businessOverview test data spread across 10 months for a single member
const BusinessOverview = require('./models/businessOverview');
require('dotenv').config();

const TEST_MEMBER_ID = '68f0d4175d6d73b831d007c9';

function buildMonthlyEntries(monthIndex, baseDate) {
  // For variety, we'll create 2 businesses per month with different P/L profiles
  const monthDate = new Date(baseDate);
  monthDate.setMonth(baseDate.getMonth() + monthIndex);

  const businesses = [];

  // Profitable business
  businesses.push({
    memberId: TEST_MEMBER_ID,
    businessName: `Monthly Trade A - ${monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
    revenue: Math.round(120000 + monthIndex * 5000 + Math.random() * 20000),
    expenses: Math.round(70000 + monthIndex * 2000 + Math.random() * 15000),
    investments: Math.round(10000 + Math.random() * 20000),
    transactionDate: new Date(monthDate),
    notes: 'Auto-generated profitable business',
    createdAt: new Date(monthDate)
  });

  // Loss-making business
  businesses.push({
    memberId: TEST_MEMBER_ID,
    businessName: `Monthly Trade B - ${monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
    revenue: Math.round(50000 + Math.random() * 30000),
    expenses: Math.round(80000 + Math.random() * 40000),
    investments: Math.round(20000 + Math.random() * 30000),
    transactionDate: new Date(monthDate),
    notes: 'Auto-generated loss-making business',
    createdAt: new Date(monthDate)
  });

  // Occasionally add a break-even smaller business
  if (monthIndex % 3 === 0) {
    businesses.push({
      memberId: TEST_MEMBER_ID,
      businessName: `Monthly Micro - ${monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
      revenue: 90000,
      expenses: 60000,
      investments: 30000,
      transactionDate: new Date(monthDate),
      notes: 'Auto-generated break-even business',
      createdAt: new Date(monthDate)
    });
  }

  return businesses;
}

async function run() {
  try {
    console.log('🚀 Starting 10-month BusinessOverview test data insertion...');

    // Connect to DB (module handles connection)
    const db = require('./config/db');
    console.log('📍 Using DB from ./config/db');

    console.log('🧹 Clearing existing BusinessOverview data for member:', TEST_MEMBER_ID);
    await BusinessOverview.deleteMany({ memberId: TEST_MEMBER_ID });
    console.log('✅ Cleared existing entries');

    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - 9); // start 9 months ago (total 10 months including current)

    let toInsert = [];
    for (let i = 0; i < 10; i++) {
      const entries = buildMonthlyEntries(i, baseDate);
      toInsert = toInsert.concat(entries);
    }

    console.log(`💾 Inserting ${toInsert.length} business entries (10 months)`);
    const inserted = await BusinessOverview.insertMany(toInsert);
    console.log(`✅ Inserted ${inserted.length} entries`);

    // Compute summary
    const all = await BusinessOverview.find({ memberId: TEST_MEMBER_ID });
    let totalRevenue = 0, totalExpenses = 0, totalInvestments = 0, totalPL = 0;
    all.forEach(b => {
      totalRevenue += b.revenue;
      totalExpenses += b.expenses;
      totalInvestments += b.investments;
      totalPL += (b.revenue - b.expenses - b.investments);
    });

    console.log('\n📈 Summary for inserted test data:');
    console.log('Total entries:', all.length);
    console.log('Total Revenue:', totalRevenue);
    console.log('Total Expenses:', totalExpenses);
    console.log('Total Investments:', totalInvestments);
    console.log('Total Profit/Loss:', totalPL);

    console.log('\n📋 API endpoints to verify:');
    console.log(`GET http://localhost:8080/api/business/?memberId=${TEST_MEMBER_ID}`);
    console.log(`GET http://localhost:8080/api/business/top-performing?memberId=${TEST_MEMBER_ID}&limit=5`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) run();

module.exports = { run };
