#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });/usr/bin/env node

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

console.log('🗄️ **CREATING CONVERSATIONS TABLE**\n');

async function createConversationsTable() {
  try {
    // Load config to get database URL
    const { loadConfig } = require('./config-loader');
const { validateEnvironment } = require('./config-loader');

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const config = loadConfig();
    const sql = postgres(config.database.url);

    console.log('📝 Reading migration file...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../drizzle/0003_add_conversations_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Executing migration...');
    
    // Execute the migration using a transaction
    await sql.begin(async sql => {
      await sql.unsafe(migrationSQL);
    });

    console.log('✅ Conversations table created successfully!');
    
    // Verify the table was created
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations'
      );
    `;

    if (tableExists[0].exists) {
      console.log('✅ Verification: conversations table exists');
      
      // Check the structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'conversations'
        ORDER BY ordinal_position;
      `;

      console.log('\n📋 Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });

      // Check if conversation_id was added to chat_messages
      const chatMessagesColumns = await sql`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'conversation_id';
      `;

      if (chatMessagesColumns.length > 0) {
        console.log('✅ conversation_id column added to chat_messages table');
      } else {
        console.log('⚠️  conversation_id column not found in chat_messages table');
      }

    } else {
      console.log('❌ Verification failed: conversations table does not exist');
    }

    await sql.end();

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test user signup and login');
    console.log('   2. Test conversation creation');
    console.log('   3. Test chat functionality');
    
  } catch (error) {
    console.error('❌ Error creating conversations table:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the migration
createConversationsTable();
