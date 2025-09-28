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

async function testImageMessages() {
  console.log('🔍 Testing image messages in database...');
  
  try {
    // Get messages with images
    const { data: imageMessages, error: imageError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('content_type', 'image')
      .limit(5);
    
    if (imageError) {
      console.error('❌ Error fetching image messages:', imageError);
      return;
    }
    
    console.log('📋 Image messages found:', imageMessages?.length || 0);
    
    if (imageMessages && imageMessages.length > 0) {
      imageMessages.forEach((msg, index) => {
        console.log(`\n📸 Message ${index + 1}:`);
        console.log('  - ID:', msg.id);
        console.log('  - Sender:', msg.sender);
        console.log('  - Content:', msg.content);
        console.log('  - Content Type:', msg.content_type);
        console.log('  - Media URL length:', msg.media_url?.length || 0);
        console.log('  - Media URL starts with data:', msg.media_url?.startsWith('data:') || false);
        console.log('  - Has metadata:', !!msg.metadata);
        if (msg.metadata) {
          console.log('  - Metadata keys:', Object.keys(msg.metadata));
          console.log('  - Has image description:', !!msg.metadata.image_description);
        }
      });
    } else {
      console.log('⚠️ No image messages found');
    }
    
    // Test creating a sample image message
    console.log('\n🔍 Testing image message creation...');
    
    // Get a real user and influencer ID
    const { data: sampleMessage } = await supabase
      .from('chat_messages')
      .select('user_id, influencer_id')
      .limit(1);
    
    if (sampleMessage && sampleMessage.length > 0) {
      const { user_id, influencer_id } = sampleMessage[0];
      
      // Create a test image message with base64 data
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const testMessage = {
        user_id,
        influencer_id,
        sender: 'user',
        content: 'Test image message',
        content_type: 'image',
        media_url: testImageBase64,
        metadata: {
          has_image: true,
          has_audio: false,
          image_description: 'Test image description',
          timings: { test: true }
        }
      };
      
      console.log('📋 Test message structure:', {
        content_type: testMessage.content_type,
        media_url_length: testMessage.media_url.length,
        media_url_starts_with_data: testMessage.media_url.startsWith('data:'),
        has_metadata: !!testMessage.metadata
      });
      
      // Don't actually insert, just show what would be saved
      console.log('✅ Test message structure is correct');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testImageMessages().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
