#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const postgres = require('postgres');
const { createClient } = require('@supabase/supabase-js');

console.log('👥 **FIXING MISSING USERS**\n');

async function fixMissingUsers() {
  try {
    // Load config
    const { loadConfig } = require('./config-loader');
const { validateEnvironment } = require('./config-loader');

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const config = loadConfig();
    const sql = postgres(config.database.url);
    
    // Initialize Supabase client
    const supabaseUrl = config.database.supabase.url;
    const supabaseServiceKey = config.database.supabase.serviceRoleKey;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Checking for missing users...');

    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log(`📊 Found ${authUsers.users.length} users in Supabase Auth`);

    // Get all users from the database
    const dbUsers = await sql`SELECT id FROM users`;
    const dbUserIds = new Set(dbUsers.map(u => u.id));
    
    console.log(`📊 Found ${dbUsers.length} users in database`);

    // Find missing users
    const missingUsers = authUsers.users.filter(authUser => !dbUserIds.has(authUser.id));
    
    if (missingUsers.length === 0) {
      console.log('✅ All auth users exist in database - no fixes needed!');
      await sql.end();
      return;
    }

    console.log(`🔧 Found ${missingUsers.length} missing users, fixing...`);

    // Create missing users
    for (const authUser of missingUsers) {
      try {
        console.log(`   📝 Creating user: ${authUser.email} (${authUser.id})`);
        
        await sql`
          INSERT INTO users (id, email, username, display_name, created_at, updated_at)
          VALUES (
            ${authUser.id},
            ${authUser.email},
            ${authUser.email?.split('@')[0] || null},
            ${authUser.email?.split('@')[0] || null},
            now(),
            now()
          )
        `;
        
        console.log(`   ✅ Created user: ${authUser.email}`);
      } catch (error) {
        console.error(`   ❌ Error creating user ${authUser.email}:`, error.message);
      }
    }

    // Verify the fix
    const finalDbUsers = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`\n📊 Final count: ${finalDbUsers[0].count} users in database`);

    await sql.end();

    console.log('\n🎉 User fix completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test user signup and login');
    console.log('   2. Test conversation creation');
    console.log('   3. Test chat functionality');
    
  } catch (error) {
    console.error('❌ Error fixing missing users:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the fix
fixMissingUsers();


