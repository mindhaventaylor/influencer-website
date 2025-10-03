require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client exactly like the app does
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    headers: {
      'X-Client-Info': 'influencer-website@1.0.0',
    },
  },
});

async function testAppQuery() {
  console.log('🔍 Testing app-like query...');
  
  try {
    // Get real IDs from database
    console.log('\n📋 Getting real IDs from database...');
    const { data: messageData, error: messageError } = await supabase
      .from('chat_messages')
      .select('influencer_id, user_id')
      .limit(1);
    
    if (messageError) {
      console.error('❌ Error getting message IDs:', messageError);
      return;
    }
    
    if (!messageData || messageData.length === 0) {
      console.log('⚠️ No messages found in database');
      return;
    }
    
    const { influencer_id, user_id } = messageData[0];
    console.log('📋 Using IDs:', { influencer_id, user_id });
    
    // Test session
    console.log('\n🔍 Testing session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('📋 Session check:', {
      hasSession: !!session,
      sessionError,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      accessToken: session?.access_token ? `${session.access_token.substring(0, 10)}...` : 'none'
    });
    
    // Test the exact query from the API
    console.log('\n🔍 Testing exact API query...');
    const { data: queryData, error: queryError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('influencer_id', influencer_id)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(0, 9);
    
    console.log('📋 Query result:', {
      dataLength: queryData?.length,
      error: queryError,
      hasData: !!queryData,
      errorCode: queryError?.code,
      errorMessage: queryError?.message,
      errorDetails: queryError?.details,
      errorHint: queryError?.hint
    });
    
    if (queryError) {
      console.error('❌ Query failed with details:', {
        code: queryError.code,
        message: queryError.message,
        details: queryError.details,
        hint: queryError.hint
      });
    } else {
      console.log('✅ Query successful!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAppQuery().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
