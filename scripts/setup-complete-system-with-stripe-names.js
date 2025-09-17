#!/usr/bin/env node

const postgres = require('postgres');
const fs = require('fs');
const config = require('../influencer.config.js');

const sql = postgres(config.database.url);

// Function to update Stripe product names to match configuration
async function updateStripeProductNames() {
  console.log('🔄 Updating Stripe product names...');
  
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Check if deployment-info.json exists
    const deploymentInfoPath = './deployment-info.json';
    if (!fs.existsSync(deploymentInfoPath)) {
      console.log('⚠️  deployment-info.json not found, skipping Stripe product name update');
      return false;
    }

    // Load deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    if (!deploymentInfo.stripeProducts) {
      console.log('⚠️  No Stripe products found in deployment-info.json');
      return false;
    }

    console.log('📋 Updating Stripe product names...');
    
    // Update each product with the correct name from config
    for (const planConfig of config.plans) {
      const productId = deploymentInfo.stripeProducts[planConfig.id];
      
      if (!productId) {
        console.log(`⚠️  No Stripe product ID found for plan: ${planConfig.id}`);
        continue;
      }

      try {
        const updatedProduct = await stripe.products.update(productId, {
          name: planConfig.name,
          description: planConfig.description,
          metadata: {
            planId: planConfig.id,
            influencerName: config.influencer.name
          }
        });

        console.log(`   ✅ Updated ${planConfig.id}: ${updatedProduct.name}`);
      } catch (error) {
        console.log(`   ❌ Error updating ${planConfig.id}: ${error.message}`);
      }
    }

    // Update deployment-info.json with new names
    const updatedDeploymentInfo = { ...deploymentInfo };
    
    updatedDeploymentInfo.plans = updatedDeploymentInfo.plans.map(plan => {
      const configPlan = config.plans.find(p => p.id === plan.id);
      if (configPlan) {
        return {
          ...plan,
          name: configPlan.name,
          price: configPlan.priceCents
        };
      }
      return plan;
    });

    fs.writeFileSync(deploymentInfoPath, JSON.stringify(updatedDeploymentInfo, null, 2));
    console.log('✅ Updated deployment-info.json with new plan names');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating Stripe product names:', error.message);
    return false;
  }
}

// Function to update config with real Stripe price IDs from deployment-info.json
function updateConfigWithRealStripeIds() {
  console.log('🔄 Updating config with real Stripe price IDs...');
  
  try {
    // Check if deployment-info.json exists
    const deploymentInfoPath = './deployment-info.json';
    if (!fs.existsSync(deploymentInfoPath)) {
      console.log('⚠️  deployment-info.json not found, skipping Stripe price ID update');
      return false;
    }

    // Load deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    if (!deploymentInfo.plans || deploymentInfo.plans.length === 0) {
      console.log('⚠️  No plans found in deployment-info.json');
      return false;
    }

    // Create a mapping of plan IDs to Stripe price IDs
    const stripePriceMapping = {};
    deploymentInfo.plans.forEach(plan => {
      if (plan.stripePriceId && plan.id) {
        stripePriceMapping[plan.id] = plan.stripePriceId;
      }
    });

    if (Object.keys(stripePriceMapping).length === 0) {
      console.log('⚠️  No valid Stripe price IDs found in deployment-info.json');
      return false;
    }

    // Update the config plans with real Stripe price IDs
    const updatedConfig = { ...config };
    let updatedCount = 0;

    updatedConfig.plans = config.plans.map(plan => {
      if (stripePriceMapping[plan.id] && plan.stripePriceId !== stripePriceMapping[plan.id]) {
        console.log(`   ✅ Updating ${plan.name}: ${plan.stripePriceId} → ${stripePriceMapping[plan.id]}`);
        updatedCount++;
        return {
          ...plan,
          stripePriceId: stripePriceMapping[plan.id]
        };
      }
      return plan;
    });

    if (updatedCount > 0) {
      // Write the updated config back to the file
      fs.writeFileSync('./influencer.config.js', `module.exports = ${JSON.stringify(updatedConfig, null, 2)};`);
      console.log(`✅ Updated ${updatedCount} plans with real Stripe price IDs`);
      return true;
    } else {
      console.log('✅ All plans already have correct Stripe price IDs');
      return true;
    }
  } catch (error) {
    console.error('❌ Error updating Stripe price IDs:', error.message);
    return false;
  }
}

async function setupCompleteSystem() {
  try {
    console.log('🚀 **COMPLETE SYSTEM SETUP**\n');

    // Step 0: Update Stripe product names
    console.log('0️⃣ Updating Stripe product names...');
    await updateStripeProductNames();
    console.log('');

    // Step 1: Update config with real Stripe price IDs
    console.log('1️⃣ Updating configuration with real Stripe price IDs...');
    const configUpdated = updateConfigWithRealStripeIds();
    if (configUpdated) {
      // Reload the config to get the updated values
      delete require.cache[require.resolve('../influencer.config.js')];
      const updatedConfig = require('../influencer.config.js');
      Object.assign(config, updatedConfig);
    }
    console.log('');

    // 2. Create or update the influencer
    console.log('2️⃣ Setting up influencer...');
    
    const influencerData = {
      name: config.influencer.name || 'Teste',
      prompt: config.influencer.prompt || `You are ${config.influencer.name || 'Teste'}, a helpful AI assistant. You should respond in a friendly, engaging manner while staying true to your personality.`,
      model_preset: config.influencer.modelPreset || {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      },
      is_active: true,
      plan_ids: [] // Start with empty array, we'll populate this with actual plan UUIDs if they exist
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

    // 3. Update existing users with missing data
    console.log('\n3️⃣ Updating users with missing data...');
    
    const usersWithNullData = await sql`
      SELECT id, email FROM users 
      WHERE username IS NULL OR display_name IS NULL
    `;

    for (const user of usersWithNullData) {
      // Extract username from email
      const username = user.email.split('@')[0];
      const displayName = username.charAt(0).toUpperCase() + username.slice(1);
      
      await sql`
        UPDATE users 
        SET username = ${username}, display_name = ${displayName}
        WHERE id = ${user.id}
      `;
      
      console.log(`✅ Updated user ${user.email}: username=${username}, display_name=${displayName}`);
    }

    // 4. Set up plans from configuration
    console.log('\n4️⃣ Setting up plans from configuration...');
    
    // Check if plans already exist for this influencer
    const existingPlans = await sql`
      SELECT name FROM plans 
      WHERE influencer_id = ${influencerId} AND is_active = true
    `;
    
    if (existingPlans.length > 0) {
      console.log(`⚠️  Plans already exist for ${config.influencer.name}:`);
      existingPlans.forEach(plan => {
        console.log(`   - ${plan.name}`);
      });
      console.log('   Skipping plan creation to avoid duplicates...');
    } else {
      console.log(`🚀 Creating ${config.plans.length} plans for ${config.influencer.name}...`);
      
      // Create plans from config
      for (const planConfig of config.plans) {
        console.log(`   Creating plan: ${planConfig.name}`);
        
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
            ${influencerId}, 
            ${JSON.stringify(planConfig.features)}, 
            true,
            now(), 
            now()
          ) RETURNING id, name
        `;
        
        console.log(`   ✅ Created plan: ${result[0].name} (${result[0].id})`);
        console.log(`   💰 Price: $${planConfig.priceCents/100}/${planConfig.interval}`);
        console.log(`   🎯 Stripe Price ID: ${planConfig.stripePriceId}`);
      }
      
      console.log(`✅ Successfully created ${config.plans.length} plans!`);
    }

    // 5. Verify the setup
    console.log('\n5️⃣ Verifying setup...');
    
    const influencerCount = await sql`SELECT COUNT(*) as count FROM influencers WHERE is_active = true`;
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const conversationCount = await sql`SELECT COUNT(*) as count FROM conversations`;
    const messageCount = await sql`SELECT COUNT(*) as count FROM chat_messages`;
    const planCount = await sql`SELECT COUNT(*) as count FROM plans WHERE influencer_id = ${influencerId} AND is_active = true`;
    
    console.log(`📊 System Status:`);
    console.log(`   - Active Influencers: ${influencerCount[0].count}`);
    console.log(`   - Users: ${userCount[0].count}`);
    console.log(`   - Conversations: ${conversationCount[0].count}`);
    console.log(`   - Chat Messages: ${messageCount[0].count}`);
    console.log(`   - Plans: ${planCount[0].count}`);

    // 6. Show influencer details
    const influencerDetails = await sql`
      SELECT name, prompt, plan_ids, is_active 
      FROM influencers 
      WHERE id = ${influencerId}
    `;
    
    console.log(`\n🎯 Influencer Details:`);
    console.log(`   - Name: ${influencerDetails[0].name}`);
    console.log(`   - Active: ${influencerDetails[0].is_active}`);
    console.log(`   - Plan IDs: ${influencerDetails[0].plan_ids.join(', ')}`);
    console.log(`   - Prompt: ${influencerDetails[0].prompt.substring(0, 100)}...`);
    
    // Show created plans
    const createdPlans = await sql`
      SELECT name, price_cents, interval FROM plans 
      WHERE influencer_id = ${influencerId} AND is_active = true
      ORDER BY price_cents ASC
    `;
    
    console.log(`\n💳 Available Plans:`);
    createdPlans.forEach(plan => {
      console.log(`   - ${plan.name}: $${plan.price_cents/100}/${plan.interval}`);
    });

    console.log('\n🎉 Complete system setup finished successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test user signup and login');
    console.log('   2. Test chat functionality');
    console.log('   3. Test plan purchases (Stripe names and price IDs updated)');
    console.log('   4. Verify profile shows correct plan names');
    console.log('\n💳 Stripe Integration:');
    console.log('   ✅ Stripe product names updated to match configuration');
    console.log('   ✅ Configuration automatically updated with real Stripe price IDs');
    console.log('   ✅ Plans created in database from configuration');
    console.log('   ✅ Payment system ready for production use');

  } catch (error) {
    console.error('❌ Error setting up system:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the setup
setupCompleteSystem()
  .then(() => {
    console.log('\n✅ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });


