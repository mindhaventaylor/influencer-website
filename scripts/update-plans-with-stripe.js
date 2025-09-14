#!/usr/bin/env node

// Script to update existing plans with Stripe product/price IDs
const postgres = require('postgres');

async function updatePlansWithStripe() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl || databaseUrl.includes('[password]')) {
      console.log('❌ Please set DATABASE_URL environment variable with your database credentials');
      console.log('   Example: DATABASE_URL="postgresql://postgres:your_password@db.qroflmfvlhbvhtpzoqbu.supabase.co:5432/postgres"');
      process.exit(1);
    }

    const sql = postgres(databaseUrl);

    console.log('🔧 Updating plans with Stripe IDs...\n');

    // Get all plans without Stripe IDs
    const plansWithoutStripe = await sql`
      SELECT p.*, i.handle, i.display_name
      FROM plans p
      JOIN influencers i ON p.influencer_id = i.id
      WHERE p.is_active = true
      AND (p.stripe_price_id IS NULL OR p.stripe_price_id = '' OR p.stripe_price_id LIKE 'price_%_template')
    `;

    if (plansWithoutStripe.length === 0) {
      console.log('✅ All plans already have Stripe IDs');
      await sql.end();
      return;
    }

    console.log(`Found ${plansWithoutStripe.length} plans without Stripe IDs:`);
    plansWithoutStripe.forEach(plan => {
      console.log(`- ${plan.name} (${plan.handle}): $${(plan.price_cents / 100).toFixed(2)}/${plan.interval}`);
    });

    console.log('\n⚠️  These plans need Stripe IDs to work with payments.');
    console.log('Please run the create-influencer-template script to generate Stripe products and prices.');
    console.log('\nExample commands:');
    console.log('1. node scripts/fix-existing-plans.js  (to fix plan data)');
    console.log('2. node scripts/create-influencer-template.js  (to create Stripe products)');

    await sql.end();

  } catch (error) {
    console.error('❌ Error updating plans with Stripe IDs:', error);
    process.exit(1);
  }
}

updatePlansWithStripe();
