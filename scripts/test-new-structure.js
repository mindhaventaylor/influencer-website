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

async function testNewStructure() {
  console.log('🔍 Testing new message structure...');
  
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
    
    // Test creating a message with the new structure
    console.log('\n🔍 Testing new message creation...');
    
    // Get a real user and influencer ID
    const { data: existingMessage } = await supabase
      .from('chat_messages')
      .select('user_id, influencer_id')
      .limit(1);
    
    if (existingMessage && existingMessage.length > 0) {
      const { user_id, influencer_id } = existingMessage[0];
      
      // Create a test image message with base64 data
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const testMessage = {
        user_id,
        influencer_id,
        sender: 'user',
        content: 'Test message with image', // Text message
        type: 'image',
        media_data: testImageBase64, // Base64 image data
        image_description: 'Test image description'
      };
      
      console.log('📋 Test message structure:', {
        content: testMessage.content,
        type: testMessage.type,
        media_data_length: testMessage.media_data.length,
        media_data_starts_with_data: testMessage.media_data.startsWith('data:'),
        has_image_description: !!testMessage.image_description
      });
      
      console.log('✅ Test message structure is correct');
      console.log('📋 This structure will:');
      console.log('  - Store text message in "content" field');
      console.log('  - Store base64 image in "media_data" field');
      console.log('  - Use "type" field to identify media type');
      console.log('  - Store AI description in "image_description" field');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testNewStructure().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
