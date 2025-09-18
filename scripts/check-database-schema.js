#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 **CHECKING DATABASE SCHEMA**\n');

async function checkDatabaseSchema() {
  try {
    // Load config
    const { loadConfig } = require('./config-loader');
const { validateEnvironment } = require('./config-loader');

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const config = loadConfig();
    
    // Initialize Supabase client
    const supabaseUrl = config.database.supabase.url;
    const supabaseServiceKey = config.database.supabase.serviceRoleKey;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Checking users table schema...');

    // Check if we can query the users table
    console.log('\n🔍 Testing users table query...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Error querying users table:', usersError);
    } else {
      console.log('✅ Users table is accessible');
      if (users && users.length > 0) {
        console.log('\n📋 Sample user data:');
        const user = users[0];
        Object.keys(user).forEach(key => {
          console.log(`   • ${key}: ${user[key]}`);
        });
      } else {
        console.log('ℹ️  No users found in table');
      }
    }

    console.log('\n🎉 Database schema check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the check
checkDatabaseSchema();
