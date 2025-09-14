#!/usr/bin/env node

const postgres = require('postgres');
const config = require('../influencer.config.js');

const sql = postgres(config.database.url);

async function addTokensToUser() {
  console.log('💰 Adding tokens to user...\n');

  try {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (query) => {
      return new Promise(resolve => rl.question(query, ans => resolve(ans)));
    };

    // Get user email
    const email = await askQuestion('Enter user email (e.g., caiotagb@gmail.com): ');
    
    if (!email) {
      console.log('❌ Email is required');
      rl.close();
      return;
    }

    // Get tokens to add
    const tokensToAdd = await askQuestion('Enter number of tokens to add: ');
    
    if (!tokensToAdd || isNaN(tokensToAdd)) {
      console.log('❌ Valid number of tokens is required');
      rl.close();
      return;
    }

    rl.close();

    // Find user
    const users = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.email} (${user.id})`);

    // Find conversations for this user with influencer info
    const conversations = await sql`
      SELECT c.id, c.tokens, c.influencer_id, i.name as influencer_name 
      FROM conversations c 
      LEFT JOIN influencers i ON c.influencer_id = i.id 
      WHERE c.user_id = ${user.id}
    `;

    if (conversations.length === 0) {
      console.log(`❌ No conversations found for user ${email}`);
      return;
    }

    console.log(`📊 Current conversations:`);
    for (const conv of conversations) {
      console.log(`   - Conversation ${conv.id} (${conv.influencer_name || 'Unknown Influencer'}): ${conv.tokens} tokens`);
    }

    // Ask which influencer to add tokens to
    const influencerChoice = await askQuestion(`\nAdd tokens to:\n1. All influencers\n2. Current influencer only (${config.influencer.displayName})\nEnter choice (1 or 2): `);
    
    let targetConversations = conversations;
    if (influencerChoice === '2') {
      targetConversations = conversations.filter(conv => conv.influencer_id === config.influencer.id);
      if (targetConversations.length === 0) {
        console.log(`❌ No conversations found for user ${email} with current influencer (${config.influencer.displayName})`);
        rl.close();
        return;
      }
      console.log(`🎯 Adding tokens only to ${config.influencer.displayName} conversations`);
    } else {
      console.log(`🌐 Adding tokens to all influencer conversations`);
    }

    // Add tokens to selected conversations
    const tokensToAddNum = parseInt(tokensToAdd);
    
    for (const conv of targetConversations) {
      const newTokenCount = (conv.tokens || 0) + tokensToAddNum;
      
      await sql`
        UPDATE conversations 
        SET tokens = ${newTokenCount}
        WHERE id = ${conv.id}
      `;
      
      console.log(`✅ Updated conversation ${conv.id} (${conv.influencer_name || 'Unknown'}): ${conv.tokens} → ${newTokenCount} tokens`);
    }

    console.log(`\n🎉 Successfully added ${tokensToAddNum} tokens to ${targetConversations.length} conversation(s) for ${email}!`);

  } catch (error) {
    console.error('❌ Error adding tokens:', error.message);
  } finally {
    rl.close();
    await sql.end();
  }
}

addTokensToUser();

