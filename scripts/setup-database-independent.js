#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });/usr/bin/env node

const postgres = require('postgres');
const { loadConfig } = require('./config-loader');
const { validateEnvironment } = require('./config-loader');

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const config = loadConfig();

const sql = postgres(config.database.url);

async function setupDatabaseIndependent() {
  console.log('🗄️ Setting up database for independent influencer operation...\n');

  try {
    // 1. Create or update the influencer
    console.log('1️⃣ Setting up influencer...');
    
    const influencerData = {
      name: config.influencer.name,
      prompt: config.ai.personalityPrompt,
      model_preset: {
        temperature: config.ai.temperature || 0.3,
        max_tokens: config.ai.maxTokens || 3000,
        top_p: 0.9
      },
      is_active: true,
      plan_ids: [] // Will be populated with actual plan UUIDs
    };

    // Check if influencer exists
    const existingInfluencer = await sql`
      SELECT id FROM influencers WHERE name = ${influencerData.name}
    `;

    let influencerId;
    if (existingInfluencer.length > 0) {
      influencerId = existingInfluencer[0].id;
      console.log(`✅ Updated existing influencer: ${influencerData.name} (${influencerId})`);
      
      await sql`
        UPDATE influencers 
        SET prompt = ${influencerData.prompt},
            model_preset = ${JSON.stringify(influencerData.model_preset)},
            plan_ids = ${influencerData.plan_ids}
        WHERE id = ${influencerId}
      `;
    } else {
      const [newInfluencer] = await sql`
        INSERT INTO influencers (name, prompt, model_preset, is_active, plan_ids)
        VALUES (${influencerData.name}, ${influencerData.prompt}, ${JSON.stringify(influencerData.model_preset)}, ${influencerData.is_active}, ${influencerData.plan_ids})
        RETURNING id
      `;
      influencerId = newInfluencer.id;
      console.log(`✅ Created new influencer: ${influencerData.name} (${influencerId})`);
    }

    // 2. Create subscription plans for this influencer
    console.log('\n2️⃣ Creating subscription plans...');
    const planIds = [];

    for (const plan of config.plans) {
      // Check if plan already exists for this influencer
      const existingPlan = await sql`
        SELECT id FROM plans 
        WHERE influencer_id = ${influencerId} AND name = ${plan.name}
      `;

      let planId;
      if (existingPlan.length > 0) {
        planId = existingPlan[0].id;
        console.log(`✅ Updated existing plan: ${plan.name} (${planId})`);
        
        await sql`
          UPDATE plans 
          SET description = ${plan.description},
              price_cents = ${plan.priceCents},
              currency = ${plan.currency},
              interval = ${plan.interval},
              stripe_price_id = ${plan.stripePriceId},
              features = ${JSON.stringify(plan.features)},
              access_level = ${plan.accessLevel},
              is_popular = ${plan.isPopular}
          WHERE id = ${planId}
        `;
      } else {
        const [newPlan] = await sql`
          INSERT INTO plans (influencer_id, name, description, price_cents, currency, interval, stripe_price_id, features, access_level, is_popular)
          VALUES (${influencerId}, ${plan.name}, ${plan.description}, ${plan.priceCents}, ${plan.currency}, ${plan.interval}, ${plan.stripePriceId}, ${JSON.stringify(plan.features)}, ${plan.accessLevel}, ${plan.isPopular})
          RETURNING id
        `;
        planId = newPlan.id;
        console.log(`✅ Created new plan: ${plan.name} (${planId})`);
      }
      
      planIds.push(planId);
    }

    // Update influencer with plan IDs
    await sql`
      UPDATE influencers 
      SET plan_ids = ${planIds}
      WHERE id = ${influencerId}
    `;

    // 3. Verify setup
    console.log('\n3️⃣ Verifying setup...');
    
    const influencerCheck = await sql`
      SELECT id, name, is_active FROM influencers WHERE id = ${influencerId}
    `;
    
    const plansCheck = await sql`
      SELECT id, name, price_cents, stripe_price_id FROM plans WHERE influencer_id = ${influencerId}
    `;

    console.log('\n📊 Setup Summary:');
    console.log('─'.repeat(50));
    console.log(`🎭 Influencer: ${influencerCheck[0].name} (${influencerCheck[0].id})`);
    console.log(`📦 Plans: ${plansCheck.length} plans created`);
    
    plansCheck.forEach(plan => {
      console.log(`   ${plan.name}: $${plan.price_cents / 100}/month (${plan.stripe_price_id})`);
    });

    console.log('\n✅ Database setup complete!');
    console.log('🎉 Your influencer is ready for independent operation!');
    console.log('\n📋 What this means:');
    console.log('• Users can sign up directly on your site');
    console.log('• Conversations are created automatically when users start chatting');
    console.log('• Each influencer has separate subscription plans');
    console.log('• No shared data between different influencer sites');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await sql.end();
  }
}

setupDatabaseIndependent();
