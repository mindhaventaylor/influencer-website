#!/usr/bin/env node

const postgres = require('postgres');
const config = require('../influencer.config.js');

const sql = postgres(config.database.url);

async function setupCompleteSystem() {
  console.log('🚀 Setting up complete influencer system...\n');

  try {
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
  

    // 5. Verify the setup
    console.log('\n5️⃣ Verifying setup...');
    
    const influencerCount = await sql`SELECT COUNT(*) as count FROM influencers WHERE is_active = true`;
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const conversationCount = await sql`SELECT COUNT(*) as count FROM conversations`;
    const messageCount = await sql`SELECT COUNT(*) as count FROM chat_messages`;
    
    console.log(`📊 System Status:`);
    console.log(`   - Active Influencers: ${influencerCount[0].count}`);
    console.log(`   - Users: ${userCount[0].count}`);
    console.log(`   - Conversations: ${conversationCount[0].count}`);
    console.log(`   - Chat Messages: ${messageCount[0].count}`);

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

    console.log('\n🎉 Complete system setup finished successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test user signup and login');
    console.log('   2. Test chat functionality');
    console.log('   3. Test plan purchases');

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