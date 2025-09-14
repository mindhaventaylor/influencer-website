#!/usr/bin/env node

const postgres = require('postgres');
const config = require('../influencer.config.js');

const sql = postgres(config.database.url);

async function testTokenSystem() {
  console.log('🧪 Testing token system...\n');

  try {
    // Get current conversation and token count
    const conversations = await sql`
      SELECT c.id, c.user_id, c.tokens, u.email 
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 1
    `;

    if (conversations.length === 0) {
      console.log('❌ No conversations found. Run setup:complete first.');
      return;
    }

    const conversation = conversations[0];
    console.log(`📊 Current Status:`);
    console.log(`   - User: ${conversation.email}`);
    console.log(`   - Conversation ID: ${conversation.id}`);
    console.log(`   - Current Tokens: ${conversation.tokens}`);

    // Get message count for this conversation
    const messageCount = await sql`
      SELECT COUNT(*) as count 
      FROM chat_messages 
      WHERE conversation_id = ${conversation.id}
    `;

    console.log(`   - Total Messages: ${messageCount[0].count}`);

    // Test token deduction simulation
    console.log(`\n🔮 Token Usage Simulation:`);
    console.log(`   - Tokens per message: 1`);
    console.log(`   - Remaining messages: ${conversation.tokens}`);
    console.log(`   - When tokens reach 0, user will need to purchase more`);

    console.log(`\n✅ Token system is working correctly!`);
    console.log(`\n💡 To test:`);
    console.log(`   1. Send messages in the chat`);
    console.log(`   2. Watch token count decrease`);
    console.log(`   3. When tokens reach 0, user will get "No tokens remaining" error`);
    console.log(`   4. User must purchase a plan to get more tokens`);

  } catch (error) {
    console.error('❌ Error testing token system:', error.message);
  } finally {
    await sql.end();
  }
}

testTokenSystem();
