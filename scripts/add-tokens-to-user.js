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

    // Find conversations for this user
    const conversations = await sql`
      SELECT id, tokens FROM conversations WHERE user_id = ${user.id}
    `;

    if (conversations.length === 0) {
      console.log(`❌ No conversations found for user ${email}`);
      return;
    }

    console.log(`📊 Current conversations:`);
    for (const conv of conversations) {
      console.log(`   - Conversation ${conv.id}: ${conv.tokens} tokens`);
    }

    // Add tokens to all conversations
    const tokensToAddNum = parseInt(tokensToAdd);
    
    for (const conv of conversations) {
      const newTokenCount = (conv.tokens || 0) + tokensToAddNum;
      
      await sql`
        UPDATE conversations 
        SET tokens = ${newTokenCount}
        WHERE id = ${conv.id}
      `;
      
      console.log(`✅ Updated conversation ${conv.id}: ${conv.tokens} → ${newTokenCount} tokens`);
    }

    console.log(`\n🎉 Successfully added ${tokensToAddNum} tokens to all conversations for ${email}!`);

  } catch (error) {
    console.error('❌ Error adding tokens:', error.message);
  } finally {
    await sql.end();
  }
}

addTokensToUser();
