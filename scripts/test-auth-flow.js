#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔐 **TESTING AUTHENTICATION FLOW**\n');

async function testAuthFlow() {
  try {
    // Load config from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables!');
      console.log('💡 Make sure you have run: npm run migrate:env');
      process.exit(1);
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('🔍 Testing authentication flow...');

    // Test 1: Check current session
    console.log('\n1️⃣ Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check error:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found:', {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: new Date(session.expires_at * 1000).toISOString()
      });
    } else {
      console.log('ℹ️  No active session');
    }

    // Test 2: Check auth state change listener
    console.log('\n2️⃣ Testing auth state change listener...');
    let authStateChangeReceived = false;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔄 Auth state change: ${event}`, session ? 'authenticated' : 'not authenticated');
      authStateChangeReceived = true;
    });

    // Wait a bit for any auth state changes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (authStateChangeReceived) {
      console.log('✅ Auth state change listener working');
    } else {
      console.log('ℹ️  No auth state changes detected (this is normal if no session)');
    }

    subscription.unsubscribe();

    // Test 3: Check user creation endpoint
    console.log('\n3️⃣ Testing user creation endpoint...');
    try {
      const response = await fetch('http://localhost:3005/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          display_name: 'Test User'
        })
      });

      if (response.status === 401) {
        console.log('✅ User creation endpoint properly requires authentication');
      } else {
        console.log(`⚠️  Unexpected response: ${response.status}`);
      }
    } catch (error) {
      console.log('ℹ️  User creation endpoint test skipped (server not running)');
    }

    // Test 4: Check conversation creation endpoint
    console.log('\n4️⃣ Testing conversation creation endpoint...');
    try {
      const response = await fetch('http://localhost:3005/api/conversation/create-for-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-id'
        })
      });

      if (response.status === 401) {
        console.log('✅ Conversation creation endpoint properly requires authentication');
      } else {
        console.log(`⚠️  Unexpected response: ${response.status}`);
      }
    } catch (error) {
      console.log('ℹ️  Conversation creation endpoint test skipped (server not running)');
    }

    console.log('\n🎉 Authentication flow test completed!');
    console.log('\n📝 Recommendations:');
    console.log('   1. Test signup flow in browser');
    console.log('   2. Test login flow in browser');
    console.log('   3. Check browser console for any errors');
    console.log('   4. Verify conversation creation works');
    
  } catch (error) {
    console.error('❌ Error testing auth flow:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testAuthFlow();


