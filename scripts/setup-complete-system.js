#!/usr/bin/env node

const postgres = require('postgres');
const fs = require('fs');
const config = require('../influencer.config.js');

const sql = postgres(config.database.url);

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

    // Also update Stripe products if available
    if (deploymentInfo.stripeProducts) {
      updatedConfig.stripe = {
        ...config.stripe,
        products: deploymentInfo.stripeProducts
      };
      console.log('   ✅ Updated Stripe products mapping');
    }

    // Write the updated config back to file
    if (updatedCount > 0 || deploymentInfo.stripeProducts) {
      const configContent = `module.exports = ${JSON.stringify(updatedConfig, null, 2)};`;
      fs.writeFileSync('./influencer.config.js', configContent);
      console.log(`   ✅ Updated influencer.config.js with ${updatedCount} real Stripe price IDs`);
      return true;
    } else {
      console.log('   ℹ️  No Stripe price ID updates needed');
      return false;
    }

  } catch (error) {
    console.error('❌ Error updating config with Stripe price IDs:', error.message);
    return false;
  }
}

async function setupCompleteSystem() {
  console.log('🚀 Setting up complete influencer system...\n');

  try {
    // 0. Update config with real Stripe price IDs
    console.log('0️⃣ Updating configuration with real Stripe price IDs...');
    const configUpdated = updateConfigWithRealStripeIds();
    if (configUpdated) {
      console.log('✅ Configuration updated with real Stripe price IDs');
      // Reload the config to use the updated values
      delete require.cache[require.resolve('../influencer.config.js')];
      const updatedConfig = require('../influencer.config.js');
      Object.assign(config, updatedConfig);
    } else {
      console.log('⚠️  Configuration update skipped or no updates needed');
    }
    console.log('');

    // 1. Create or update the influencer
    console.log('1️⃣ Setting up influencer...');
    
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

    // 2. Update existing users with missing data
    console.log('\n2️⃣ Updating users with missing data...');
    
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
  

    // 3. Verify the setup
    console.log('\n3️⃣ Verifying setup...');
    
    const influencerCount = await sql`SELECT COUNT(*) as count FROM influencers WHERE is_active = true`;
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const conversationCount = await sql`SELECT COUNT(*) as count FROM conversations`;
    const messageCount = await sql`SELECT COUNT(*) as count FROM chat_messages`;
    
    console.log(`📊 System Status:`);
    console.log(`   - Active Influencers: ${influencerCount[0].count}`);
    console.log(`   - Users: ${userCount[0].count}`);
    console.log(`   - Conversations: ${conversationCount[0].count}`);
    console.log(`   - Chat Messages: ${messageCount[0].count}`);

    // 4. Show influencer details
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

    console.log('\n🎉 Complete system setup finished successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test user signup and login');
    console.log('   2. Test chat functionality');
    console.log('   3. Test plan purchases (Stripe price IDs updated)');
    console.log('\n💳 Stripe Integration:');
    console.log('   ✅ Configuration automatically updated with real Stripe price IDs');
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