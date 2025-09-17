#!/usr/bin/env node

// Script to fix existing plans in the database to match the influencer template
const postgres = require('postgres');

async function fixExistingPlans() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl || databaseUrl.includes('[password]')) {
      console.log('❌ Please set DATABASE_URL environment variable with your database credentials');
      console.log('   Example: DATABASE_URL="postgresql://postgres:your_password@db.qroflmfvlhbvhtpzoqbu.supabase.co:5432/postgres"');
      process.exit(1);
    }

    const sql = postgres(databaseUrl);

    console.log('🔧 Fixing existing plans in database...\n');

    // Get all existing plans
    const existingPlans = await sql`
      SELECT p.*, i.handle, i.display_name
      FROM plans p
      JOIN influencers i ON p.influencer_id = i.id
      WHERE p.is_active = true
    `;

    console.log(`Found ${existingPlans.length} existing plans:`);
    existingPlans.forEach(plan => {
      console.log(`- ${plan.name} (${plan.handle}): $${(plan.price_cents / 100).toFixed(2)}/${plan.interval}`);
    });

    // Get all influencers
    const influencers = await sql`
      SELECT id, handle, display_name
      FROM influencers
      WHERE is_active = true
    `;

    console.log(`\nFound ${influencers.length} influencers:`);
    influencers.forEach(inf => {
      console.log(`- ${inf.display_name} (${inf.handle})`);
    });

    // For each influencer, create/update plans based on template
    for (const influencer of influencers) {
      console.log(`\n🔄 Processing plans for ${influencer.display_name}...`);

      const templatePlans = [
        {
          id: 'basic',
          name: 'Basic Chat Access',
          description: `Basic access to chat with ${influencer.display_name}`,
          priceCents: 999, // $9.99
          currency: 'usd',
          interval: 'month',
          features: [
            '5 messages per day',
            'Basic responses',
            'Standard response time',
            'Text messages only'
          ],
          accessLevel: 'basic',
          isPopular: false
        },
        {
          id: 'premium',
          name: 'Premium Chat Access',
          description: `Premium access to chat with ${influencer.display_name}`,
          priceCents: 1999, // $19.99
          currency: 'usd',
          interval: 'month',
          features: [
            'Unlimited messages',
            'Priority responses',
            'Media message support',
            'Exclusive content access',
            'Faster response time'
          ],
          accessLevel: 'premium',
          isPopular: true
        },
        {
          id: 'vip',
          name: 'VIP Chat Access',
          description: `VIP access to chat with ${influencer.display_name}`,
          priceCents: 4999, // $49.99
          currency: 'usd',
          interval: 'month',
          features: [
            'Unlimited messages',
            'Instant responses',
            'Media and voice messages',
            'Personalized content',
            'Exclusive updates',
            'Direct access',
            'Analytics dashboard'
          ],
          accessLevel: 'vip',
          isPopular: false
        }
      ];

      for (const templatePlan of templatePlans) {
        // Check if plan already exists for this influencer
        const [existingPlan] = await sql`
          SELECT id, stripe_price_id, stripe_product_id
          FROM plans
          WHERE influencer_id = ${influencer.id}
          AND name = ${templatePlan.name}
        `;

        if (existingPlan) {
          // Update existing plan with template data
          await sql`
            UPDATE plans
            SET 
              description = ${templatePlan.description},
              price_cents = ${templatePlan.priceCents},
              features = ${JSON.stringify(templatePlan.features)},
              access_level = ${templatePlan.accessLevel},
              updated_at = now()
            WHERE id = ${existingPlan.id}
          `;
          console.log(`✅ Updated plan: ${templatePlan.name}`);
        } else {
          // Create new plan
          const [newPlan] = await sql`
            INSERT INTO plans (
              id, name, description, price_cents, currency, interval, influencer_id,
              features, is_active, access_level, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), ${templatePlan.name}, ${templatePlan.description}, 
              ${templatePlan.priceCents}, ${templatePlan.currency}, ${templatePlan.interval}, 
              ${influencer.id}, ${JSON.stringify(templatePlan.features)}, true, 
              ${templatePlan.accessLevel}, now(), now()
            )
            RETURNING id
          `;
          console.log(`✅ Created plan: ${templatePlan.name} (${newPlan.id})`);
        }
      }
    }

    // Show final results
    const finalPlans = await sql`
      SELECT p.*, i.handle, i.display_name
      FROM plans p
      JOIN influencers i ON p.influencer_id = i.id
      WHERE p.is_active = true
      ORDER BY i.display_name, p.price_cents
    `;

    console.log('\n🎉 Final plans in database:');
    let currentInfluencer = '';
    finalPlans.forEach(plan => {
      if (plan.display_name !== currentInfluencer) {
        currentInfluencer = plan.display_name;
        console.log(`\n📱 ${plan.display_name} (${plan.handle}):`);
      }
      console.log(`  - ${plan.name}: $${(plan.price_cents / 100).toFixed(2)}/${plan.interval} (${plan.access_level})`);
    });

    await sql.end();

    console.log('\n✅ All plans have been updated to match the template!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run: node scripts/create-influencer-template.js');
    console.log('2. This will create Stripe products/prices for the updated plans');
    console.log('3. The Stripe IDs will be updated in the database');

  } catch (error) {
    console.error('❌ Error fixing existing plans:', error);
    process.exit(1);
  }
}

fixExistingPlans();
