require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConversationInitialize() {
  console.log('🔍 Testing conversation initialize endpoint...');
  
  try {
    // First, get a real user session
    console.log('🔍 Getting user session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ No session found:', sessionError);
      console.log('💡 Please make sure you are logged in to the application');
      return;
    }
    
    console.log('✅ Session found:', {
      userId: session.user.id,
      email: session.user.email,
      accessToken: session.access_token ? `${session.access_token.substring(0, 10)}...` : 'none'
    });
    
    // Get an influencer ID
    const { data: influencers } = await supabase
      .from('influencers')
      .select('id')
      .limit(1);
    
    if (!influencers || influencers.length === 0) {
      console.error('❌ No influencers found in database');
      return;
    }
    
    const influencerId = influencers[0].id;
    console.log('📋 Using influencer ID:', influencerId);
    
    // Test the conversation initialize endpoint
    console.log('\n🔍 Testing /api/conversation/initialize...');
    
    const response = await fetch('http://localhost:3000/api/conversation/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        influencerId: influencerId
      })
    });
    
    console.log('📋 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conversation initialize successful:', {
        conversationId: data.conversationId,
        tokens: data.tokens,
        isNew: data.isNew
      });
    } else {
      const errorText = await response.text();
      console.error('❌ Conversation initialize failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConversationInitialize();
