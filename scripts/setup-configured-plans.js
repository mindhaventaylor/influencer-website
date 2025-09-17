#!/usr/bin/env node

// Script to set up plans from influencer.config.js
require('dotenv').config({ path: '.env.local' });

console.log('🎯 **SETTING UP CONFIGURED PLANS FROM INFLUENCER.CONFIG.JS**\n');

async function setupConfiguredPlans() {
  try {
    const postgres = require('postgres');
    const sql = postgres(process.env.DATABASE_URL);
    
    console.log('✅ Connected to database successfully!\n');
    
    // Load config
    const config = require('../influencer.config.js');
    
    // Get the influencer from database
    const influencers = await sql`
      SELECT id, display_name 
      FROM influencers 
      WHERE name = ${config.influencer.name} AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (influencers.length === 0) {
      console.log('❌ No influencer found with name:', config.influencer.name);
      console.log('Available influencers:');
      const allInfluencers = await sql`SELECT name, display_name FROM influencers WHERE is_active = true`;
      allInfluencers.forEach(inf => {
        console.log(`   - ${inf.name} (${inf.display_name})`);
      });
      await sql.end();
      return;
    }
    
    const influencer = influencers[0];
    console.log(`✅ Found influencer: ${influencer.display_name} (${influencer.id})\n`);
    
    // Check if plans already exist
    const existingPlans = await sql`
      SELECT name FROM plans 
      WHERE influencer_id = ${influencer.id} AND is_active = true
    `;
    
    if (existingPlans.length > 0) {
      console.log('⚠️  Plans already exist for this influencer:');
      existingPlans.forEach(plan => {
        console.log(`   - ${plan.name}`);
      });
      console.log('\nDo you want to update them? (This will delete existing plans and create new ones)');
      console.log('For now, skipping to avoid data loss...\n');
      await sql.end();
      return;
    }
    
    console.log('🚀 **Creating configured plans...**\n');
    
    // Create plans from config
    for (const planConfig of config.plans) {
      console.log(`Creating plan: ${planConfig.name}`);
      
      const result = await sql`
        INSERT INTO plans (
          name, description, price_cents, currency, interval,
          influencer_id, features, is_active, created_at, updated_at
        ) VALUES (
          ${planConfig.name}, 
          ${planConfig.description}, 
          ${planConfig.priceCents}, 
          ${planConfig.currency},
          ${planConfig.interval}, 
          ${influencer.id}, 
          ${JSON.stringify(planConfig.features)}, 
          true,
          now(), 
          now()
        ) RETURNING id, name
      `;
      
      console.log(`   ✅ Created plan: ${result[0].name} (${result[0].id})`);
      console.log(`   💰 Price: $${planConfig.priceCents/100}/${planConfig.interval}`);
      console.log(`   🎯 Stripe Price ID: ${planConfig.stripePriceId}`);
      console.log('');
    }
    
    await sql.end();
    
    console.log('🎉 **Configured plans setup complete!**\n');
    console.log('📋 **What was created:**');
    config.plans.forEach(plan => {
      console.log(`   - ${plan.name} ($${plan.priceCents/100}/${plan.interval})`);
    });
    console.log('\n💡 **Next steps:**');
    console.log('1. Verify the plans are correctly created');
    console.log('2. Test the subscription flow');
    console.log('3. Check that profile shows correct plan names');
    console.log('\n🚀 **Your configured plans are now in the database!**');
    
  } catch (error) {
    console.error('❌ Error setting up configured plans:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

setupConfiguredPlans();
