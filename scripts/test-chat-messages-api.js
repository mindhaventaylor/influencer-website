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

async function testChatMessagesAPI() {
  console.log('🔍 Testing chat-messages API...');
  
  try {
    // Get a sample message to get IDs
    const { data: sampleMessage, error: sampleError } = await supabase
      .from('chat_messages')
      .select('user_id, influencer_id, conversation_id')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error fetching sample message:', sampleError);
      return;
    }
    
    if (sampleMessage && sampleMessage.length > 0) {
      const { user_id, influencer_id, conversation_id } = sampleMessage[0];
      
      // Test image message
      const testImageMessage = {
        user_id,
        influencer_id,
        conversation_id,
        sender: 'user',
        content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        type: 'image'
      };
      
      console.log('📋 Test message structure:', {
        content_starts_with_data: testImageMessage.content.startsWith('data:image/'),
        type: testImageMessage.type,
        content_length: testImageMessage.content.length
      });
      
      // Test direct database insert (simulating the API)
      console.log('\n🔍 Testing direct database insert...');
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([testImageMessage])
        .select()
        .single();
      
      if (error) {
        console.log('❌ Error inserting message:', error.message);
      } else {
        console.log('✅ Successfully inserted message');
        console.log('📋 Message ID:', data.id);
        console.log('📋 Message content starts with data:', data.content.startsWith('data:image/'));
        console.log('📋 Message type:', data.type);
        
        // Clean up
        await supabase
          .from('chat_messages')
          .delete()
          .eq('id', data.id);
        console.log('🧹 Cleaned up test message');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testChatMessagesAPI().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
