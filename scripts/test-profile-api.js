#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testProfileAPI() {
  try {
    console.log('🧪 **TESTING PROFILE API ENDPOINT**\n');

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Getting current user...');
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById('e604f1de-f565-41e6-ad79-4289eda38d44'); // Using the user ID from the schema check

    if (authError || !user) {
      console.error('❌ Error getting user:', authError);
      return;
    }

    console.log('👤 Auth User:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });

    console.log('\n📊 Checking database user data...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, username, display_name, created_at')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('❌ Error fetching user profile:', userError);
      return;
    }

    console.log('📋 Database User Data:', userData);
    console.log('📋 All keys:', Object.keys(userData));

    console.log('\n🎯 Priority Order Test:');
    console.log('   display_name:', userData.display_name);
    console.log('   username:', userData.username);
    console.log('   email:', userData.email);
    console.log('   Expected display:', userData.display_name || userData.username || userData.email || 'User');

    // Also check if there are any other name fields
    console.log('📋 All fields:');
    Object.entries(userData).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        console.log(`   ${key}: ${value}`);
      }
    });

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Error testing profile API:', error);
  }
}

testProfileAPI();
