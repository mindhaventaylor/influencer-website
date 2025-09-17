#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 **TESTING SIGNUP DATA FLOW**\n');

async function testSignupDataFlow() {
  try {
    // Load config
    const config = require('../influencer.config.js');
    
    // Initialize Supabase client
    const supabaseUrl = config.database.supabase.url;
    const supabaseServiceKey = config.database.supabase.serviceRoleKey;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Testing signup data flow...');

    // Test data that should be passed
    const testData = {
      email: 'test@example.com',
      username: 'testuser',
      display_name: 'Test User'
    };

    console.log('\n📋 Test data:');
    console.log(`   • Email: ${testData.email}`);
    console.log(`   • Username: ${testData.username}`);
    console.log(`   • Display Name: ${testData.display_name}`);

    // Check if we can create a user profile directly
    console.log('\n🔍 Testing direct user creation...');
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .upsert([{ 
        id: testUserId,
        email: testData.email,
        username: testData.username,
        display_name: testData.display_name,
        stripe_customer_id: 'cus_test123'
      }], { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error('❌ Error inserting test user:', insertError);
    } else {
      console.log('✅ Test user inserted successfully');
    }

    // Check if we can query the user back
    console.log('\n🔍 Testing user query...');
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId);

    if (queryError) {
      console.error('❌ Error querying test user:', queryError);
    } else {
      console.log('✅ Test user queried successfully');
      if (users && users.length > 0) {
        const user = users[0];
        console.log('\n📋 Retrieved user data:');
        Object.keys(user).forEach(key => {
          console.log(`   • ${key}: ${user[key]}`);
        });
      }
    }

    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);

    if (deleteError) {
      console.error('❌ Error deleting test user:', deleteError);
    } else {
      console.log('✅ Test user cleaned up');
    }

    console.log('\n🎉 Signup data flow test completed!');
    
  } catch (error) {
    console.error('❌ Error testing signup data flow:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testSignupDataFlow();
