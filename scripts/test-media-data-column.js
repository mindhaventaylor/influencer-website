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

async function testMediaDataColumn() {
  console.log('🔍 Testing if media_data column exists...');
  
  try {
    // Get a sample message to see the current structure
    const { data: sampleMessage, error: sampleError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error fetching sample message:', sampleError);
      return;
    }
    
    if (sampleMessage && sampleMessage.length > 0) {
      console.log('📋 Current message structure:');
      console.log('Columns:', Object.keys(sampleMessage[0]));
      console.log('\nSample message:', JSON.stringify(sampleMessage[0], null, 2));
    } else {
      console.log('⚠️ No messages found in database');
    }
    
    // Test creating a message with media_data column
    console.log('\n🔍 Testing media_data column...');
    
    // Get a real user and influencer ID
    const { data: existingMessage } = await supabase
      .from('chat_messages')
      .select('user_id, influencer_id, conversation_id')
      .limit(1);
    
    if (existingMessage && existingMessage.length > 0) {
      const { user_id, influencer_id, conversation_id } = existingMessage[0];
      
      const testMessage = {
        user_id,
        influencer_id,
        conversation_id,
        sender: 'user',
        content: 'Test message with media_data',
        type: 'image',
        media_data: 'data:image/png;base64,test'
      };
      
      console.log('📋 Attempting to insert test message with media_data...');
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([testMessage])
        .select();
      
      if (error) {
        console.log('❌ Error inserting with media_data:', error.message);
        console.log('⚠️ The table may not have media_data column');
        
        // Try without media_data column
        console.log('\n🔍 Trying without media_data column...');
        const testMessageWithoutMediaData = {
          user_id,
          influencer_id,
          conversation_id,
          sender: 'user',
          content: 'data:image/png;base64,test', // Store base64 in content
          type: 'image'
        };
        
        const { data: data2, error: error2 } = await supabase
          .from('chat_messages')
          .insert([testMessageWithoutMediaData])
          .select();
        
        if (error2) {
          console.log('❌ Error inserting without media_data:', error2.message);
        } else {
          console.log('✅ Successfully inserted without media_data column');
          console.log('📋 We need to store base64 data in content field');
          
          // Clean up the test message
          if (data2 && data2.length > 0) {
            await supabase
              .from('chat_messages')
              .delete()
              .eq('id', data2[0].id);
            console.log('🧹 Cleaned up test message');
          }
        }
      } else {
        console.log('✅ Successfully inserted with media_data column');
        console.log('📋 The table has media_data column');
        
        // Clean up the test message
        if (data && data.length > 0) {
          await supabase
            .from('chat_messages')
            .delete()
            .eq('id', data[0].id);
          console.log('🧹 Cleaned up test message');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testMediaDataColumn().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
