#!/usr/bin/env node

// Script to set up sample plans for influencers
require('dotenv').config({ path: '.env.local' });

console.log('🎯 **SETTING UP SAMPLE PLANS FOR INFLUENCERS**\n');

async function setupSamplePlans() {
  try {
    const postgres = require('postgres');
    const sql = postgres(process.env.DATABASE_URL);
    
    console.log('✅ Connected to database successfully!\n');
    
    // Get all active influencers
    const influencers = await sql`
      SELECT id, handle, display_name 
      FROM influencers 
      WHERE is_active = true AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${influencers.length} active influencers:\n`);
    influencers.forEach(influencer => {
      console.log(`   - ${influencer.display_name} (@${influencer.handle})`);
    });
    
    if (influencers.length === 0) {
      console.log('\n⚠️  No active influencers found. Please add some influencers first.');
      await sql.end();
      return;
    }
    
    console.log('\n🚀 **Creating sample plans for each influencer...**\n');
    
    for (const influencer of influencers) {
      console.log(`Creating plans for: ${influencer.display_name}`);
      
      // Check if plans already exist
      const existingPlans = await sql`
        SELECT name FROM plans 
        WHERE influencer_id = ${influencer.id} AND is_active = true
      `;
      
      if (existingPlans.length > 0) {
        console.log(`   ⚠️  Plans already exist for ${influencer.display_name}`);
        continue;
      }
      
      // Create sample plans
      const samplePlans = [
        {
          name: 'Basic Chat Access',
          description: `Basic access to chat with ${influencer.display_name}`,
          price_cents: 999, // $9.99
          currency: 'usd',
          interval: 'month',
          influencer_id: influencer.id,
          features: JSON.stringify([
            '5 messages per day',
            'Basic responses',
            'Standard response time',
            'Text messages only'
          ]),
          is_active: true
        },
        {
          name: 'Premium Chat Access',
          description: `Premium access to chat with ${influencer.display_name}`,
          price_cents: 1999, // $19.99
          currency: 'usd',
          interval: 'month',
          influencer_id: influencer.id,
          features: JSON.stringify([
            'Unlimited messages',
            'Priority responses',
            'Media message support',
            'Exclusive content access',
            'Faster response time'
          ]),
          is_active: true
        },
        {
          name: 'VIP Chat Access',
          description: `VIP access to chat with ${influencer.display_name}`,
          price_cents: 4999, // $49.99
          currency: 'usd',
          interval: 'month',
          influencer_id: influencer.id,
          features: JSON.stringify([
            'Unlimited messages',
            'Instant responses',
            'Media and voice messages',
            'Personalized content',
            'Exclusive updates',
            'Direct access',
            'Analytics dashboard'
          ]),
          is_active: true
        }
      ];
      
      for (const plan of samplePlans) {
        const result = await sql`
          INSERT INTO plans (
            name, description, price_cents, currency, interval,
            influencer_id, features, is_active, created_at, updated_at
          ) VALUES (
            ${plan.name}, ${plan.description}, ${plan.price_cents}, ${plan.currency},
            ${plan.interval}, ${plan.influencer_id}, ${plan.features}, ${plan.is_active},
            now(), now()
          ) RETURNING id, name
        `;
        
        console.log(`   ✅ Created plan: ${result[0].name} (${result[0].id})`);
      }
      
      console.log('');
    }
    
    await sql.end();
    
    console.log('🎉 **Sample plans setup complete!**\n');
    console.log('📋 **What was created:**');
    console.log('   - Basic Chat Access ($9.99/month)');
    console.log('   - Premium Chat Access ($19.99/month)');
    console.log('   - VIP Chat Access ($49.99/month)');
    console.log('\n💡 **Next steps:**');
    console.log('1. Create Stripe products and prices for these plans');
    console.log('2. Update the plans with Stripe price IDs');
    console.log('3. Test the subscription flow');
    console.log('\n🚀 **Your subscription system is ready!**');
    
  } catch (error) {
    console.error('❌ Error setting up sample plans:', error.message);
  }
}

setupSamplePlans();
