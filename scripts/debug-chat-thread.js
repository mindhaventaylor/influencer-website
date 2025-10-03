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

async function debugChatThread() {
  console.log('🔍 Debugging chat thread fetch...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n📡 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('influencers')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📋 Sample influencer data:', testData);
    
    if (testData && testData.length > 0) {
      const influencerId = testData[0].id;
      console.log(`\n🔍 Testing with influencer ID: ${influencerId}`);
      
      // Test 2: Check chat_messages table structure
      console.log('\n📋 Checking chat_messages table...');
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .limit(1);
      
      if (messagesError) {
        console.error('❌ Error accessing chat_messages:', messagesError);
      } else {
        console.log('✅ chat_messages table accessible');
        console.log('📋 Sample message structure:', messagesData);
      }
      
      // Test 3: Try to get messages for this influencer
      console.log(`\n🔍 Testing getChatThread with influencer ID: ${influencerId}`);
      const { data: threadData, error: threadError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (threadError) {
        console.error('❌ Error fetching chat thread:', threadError);
      } else {
        console.log('✅ Chat thread query successful');
        console.log(`📋 Found ${threadData?.length || 0} messages`);
        if (threadData && threadData.length > 0) {
          console.log('📋 Sample message:', threadData[0]);
        }
      }
    }
    
    // Test 4: Check table schema
    console.log('\n🔍 Checking table permissions...');
    const { data: permissionsData, error: permissionsError } = await supabase
      .rpc('get_table_info', { table_name: 'chat_messages' })
      .catch(() => ({ data: null, error: { message: 'RPC not available' } }));
    
    if (permissionsError) {
      console.log('⚠️ Could not check table permissions:', permissionsError.message);
    } else {
      console.log('✅ Table permissions check:', permissionsData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug
debugChatThread().then(() => {
  console.log('\n🏁 Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
