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

async function checkTableColumns() {
  console.log('🔍 Checking if media_data and image_description columns exist...');
  
  try {
    // Try to insert a test message with the new columns
    const { data: existingMessage } = await supabase
      .from('chat_messages')
      .select('user_id, influencer_id')
      .limit(1);
    
    if (existingMessage && existingMessage.length > 0) {
      const { user_id, influencer_id } = existingMessage[0];
      
      const testMessage = {
        user_id,
        influencer_id,
        sender: 'user',
        content: 'Test message',
        type: 'text',
        media_data: 'test_data',
        image_description: 'test_description'
      };
      
      console.log('📋 Attempting to insert test message with new columns...');
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([testMessage])
        .select();
      
      if (error) {
        console.log('❌ Error inserting with new columns:', error.message);
        console.log('📋 Available columns:', Object.keys(testMessage));
        console.log('⚠️ The table may not have media_data and image_description columns');
        
        // Try without the new columns
        console.log('\n🔍 Trying without new columns...');
        const testMessageWithoutNewColumns = {
          user_id,
          influencer_id,
          sender: 'user',
          content: 'Test message without new columns',
          type: 'text'
        };
        
        const { data: data2, error: error2 } = await supabase
          .from('chat_messages')
          .insert([testMessageWithoutNewColumns])
          .select();
        
        if (error2) {
          console.log('❌ Error inserting without new columns:', error2.message);
        } else {
          console.log('✅ Successfully inserted without new columns');
          console.log('📋 We need to use only existing columns');
        }
      } else {
        console.log('✅ Successfully inserted with new columns');
        console.log('📋 The table has media_data and image_description columns');
        
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
checkTableColumns().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
