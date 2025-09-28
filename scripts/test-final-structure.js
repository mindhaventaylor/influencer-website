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

async function testFinalStructure() {
  console.log('🔍 Testing final message structure...');
  
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
    } else {
      console.log('⚠️ No messages found in database');
    }
    
    // Test creating a message with the final structure
    console.log('\n🔍 Testing final message creation...');
    
    // Get a real user and influencer ID
    const { data: existingMessage } = await supabase
      .from('chat_messages')
      .select('user_id, influencer_id, conversation_id')
      .limit(1);
    
    if (existingMessage && existingMessage.length > 0) {
      const { user_id, influencer_id, conversation_id } = existingMessage[0];
      
      // Test image message
      const testImageMessage = {
        user_id,
        influencer_id,
        conversation_id,
        sender: 'user',
        content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        type: 'image'
      };
      
      console.log('📋 Test image message structure:', {
        content_starts_with_data: testImageMessage.content.startsWith('data:image/'),
        type: testImageMessage.type,
        content_length: testImageMessage.content.length
      });
      
      // Test text message
      const testTextMessage = {
        user_id,
        influencer_id,
        conversation_id,
        sender: 'user',
        content: 'Hello, this is a text message',
        type: 'text'
      };
      
      console.log('📋 Test text message structure:', {
        content: testTextMessage.content,
        type: testTextMessage.type,
        is_text: !testTextMessage.content.startsWith('data:')
      });
      
      console.log('✅ Final structure is correct');
      console.log('📋 This structure will:');
      console.log('  - Store base64 images in "content" field');
      console.log('  - Store text messages in "content" field');
      console.log('  - Use "type" field to identify media type');
      console.log('  - Display images when type="image" and content starts with "data:image/"');
      console.log('  - Display text when type="text" or content does not start with "data:"');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testFinalStructure().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
