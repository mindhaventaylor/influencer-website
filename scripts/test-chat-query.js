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

async function testChatQuery() {
  console.log('🔍 Testing chat_messages query...');
  
  try {
    // Test 1: Check table structure
    console.log('\n📋 Testing table structure...');
    const { data: structureData, error: structureError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Table structure error:', structureError);
      return;
    }
    
    console.log('✅ Table accessible');
    if (structureData && structureData.length > 0) {
      console.log('📋 Sample message structure:', Object.keys(structureData[0]));
    }
    
    // Test 2: Get a real influencer ID and user ID from the data
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
    
    // Test 3: Test the exact query that's failing
    console.log('\n🔍 Testing exact query from API...');
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
      hasData: !!queryData
    });
    
    if (queryError) {
      console.error('❌ Query failed:', queryError);
      
      // Test 4: Try without range
      console.log('\n🔍 Testing without range...');
      const { data: noRangeData, error: noRangeError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('influencer_id', influencer_id)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      console.log('📋 No range result:', {
        dataLength: noRangeData?.length,
        error: noRangeError,
        hasData: !!noRangeData
      });
      
      if (noRangeError) {
        console.error('❌ No range query also failed:', noRangeError);
        
        // Test 5: Try without ordering
        console.log('\n🔍 Testing without ordering...');
        const { data: noOrderData, error: noOrderError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('influencer_id', influencer_id)
          .eq('user_id', user_id)
          .limit(10);
        
        console.log('📋 No order result:', {
          dataLength: noOrderData?.length,
          error: noOrderError,
          hasData: !!noOrderData
        });
      }
    } else {
      console.log('✅ Query successful!');
      console.log('📋 Messages found:', queryData?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testChatQuery().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
