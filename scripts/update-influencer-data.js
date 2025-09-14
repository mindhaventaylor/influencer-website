#!/usr/bin/env node

const postgres = require('postgres');
const config = require('../influencer.config.js');

console.log('🔄 **UPDATING INFLUENCER DATA**\n');

async function updateInfluencerData() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log(`📝 Updating influencer: ${config.influencer.displayName}`);
    
    // 1. Update influencer data
    console.log('1️⃣ Updating influencer data...');
    
    const influencerResult = await sql`
      UPDATE influencers 
      SET 
        name = ${config.influencer.name},
        display_name = ${config.influencer.displayName},
        bio = ${config.influencer.bio},
        avatar_url = ${config.influencer.avatarUrl},
        updated_at = NOW()
      WHERE handle = ${config.influencer.handle}
      RETURNING *
    `;
    
    if (influencerResult.length === 0) {
      console.log('   ⚠️ No influencer found with handle:', config.influencer.handle);
      
      // Create new influencer
      const newInfluencer = await sql`
        INSERT INTO influencers (
          id, handle, name, display_name, bio, avatar_url, 
          is_active, price_cents, plan_ids,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${config.influencer.handle}, ${config.influencer.name},
          ${config.influencer.displayName}, ${config.influencer.bio}, ${config.influencer.avatarUrl},
          true, 0, '{}', NOW(), NOW()
        )
        RETURNING *
      `;
      
      console.log('✅ New influencer created:', newInfluencer[0].display_name);
    } else {
      console.log('✅ Influencer updated:', influencerResult[0].display_name);
    }

    // 2. Get influencer ID
    const [influencer] = await sql`
      SELECT id FROM influencers WHERE handle = ${config.influencer.handle}
    `;
    
    if (!influencer) {
      throw new Error('Influencer not found after update');
    }

    console.log('2️⃣ Updating plans data...');
    
    // 3. Delete existing plans for this influencer
    await sql`DELETE FROM plans WHERE influencer_id = ${influencer.id}`;
    console.log('   🗑️ Deleted existing plans');

    // 4. Insert new plans
    for (const plan of config.plans) {
      console.log(`   📦 Creating plan: ${plan.name}`);
      
      const newPlan = await sql`
        INSERT INTO plans (
          id, influencer_id, name, description, price_cents, currency, interval,
          features, access_level, is_active, is_popular, stripe_price_id, stripe_product_id,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${influencer.id}, ${plan.name}, ${plan.description},
          ${plan.priceCents}, ${plan.currency}, ${plan.interval},
          ${JSON.stringify(plan.features)}, ${plan.accessLevel}, true, ${plan.isPopular || false},
          ${plan.stripePriceId}, ${config.stripe.products[plan.id] || null},
          NOW(), NOW()
        )
        RETURNING *
      `;
      
      console.log(`   ✅ Plan created: ${newPlan[0].name} - $${(newPlan[0].price_cents / 100).toFixed(2)}/${newPlan[0].interval}`);
    }

    await sql.end();
    console.log('\n🎉 **Influencer data updated successfully!**');
    console.log(`   Influencer: ${config.influencer.displayName}`);
    console.log(`   Plans: ${config.plans.length} plans created`);
    
  } catch (error) {
    console.error('❌ Error updating influencer data:', error.message);
    await sql.end();
    process.exit(1);
  }
}

updateInfluencerData();
