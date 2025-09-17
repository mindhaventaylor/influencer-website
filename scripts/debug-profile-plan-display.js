#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 **DEBUGGING PROFILE PLAN DISPLAY**\n');

async function debugProfilePlanDisplay() {
  try {
    // Load config
    const config = require('../influencer.config.js');
    
    // Initialize Supabase client
    const supabaseUrl = config.database.supabase.url;
    const supabaseServiceKey = config.database.supabase.serviceRoleKey;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Debugging profile plan display...');

    // Check what plans are in the database
    console.log('\n📋 Checking plans in database...');
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (plansError) {
      console.error('❌ Error fetching plans:', plansError);
    } else {
      console.log('✅ Plans in database:');
      plans.forEach(plan => {
        console.log(`   • ${plan.name} (${plan.id}) - $${plan.price_cents/100}/${plan.interval}`);
      });
    }

    // Check conversations table
    console.log('\n📋 Checking conversations table...');
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(5);

    if (conversationsError) {
      console.error('❌ Error fetching conversations:', conversationsError);
    } else {
      console.log('✅ Sample conversations:');
      conversations.forEach(conv => {
        console.log(`   • User: ${conv.user_id}, Tokens: ${conv.tokens}, Plan IDs: ${JSON.stringify(conv.influencer_plan_ids)}`);
      });
    }

    // Check users table
    console.log('\n📋 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log('✅ Sample users:');
      users.forEach(user => {
        console.log(`   • ${user.email} (${user.id}) - Username: ${user.username || 'null'}, Display: ${user.display_name || 'null'}`);
      });
    }

    // Check user_subscriptions table
    console.log('\n📋 Checking user_subscriptions table...');
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(5);

    if (subscriptionsError) {
      console.error('❌ Error fetching subscriptions:', subscriptionsError);
    } else {
      console.log('✅ Sample subscriptions:');
      subscriptions.forEach(sub => {
        console.log(`   • User: ${sub.user_id}, Plan: ${sub.plan_id}, Status: ${sub.status}`);
      });
    }

    console.log('\n🎉 Profile plan display debug completed!');
    
  } catch (error) {
    console.error('❌ Error debugging profile plan display:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the debug
debugProfilePlanDisplay();


