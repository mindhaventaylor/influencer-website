require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullBase64() {
  console.log('🔍 Testing full base64 data URL...');
  
  try {
    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-image.png');
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // Write test image to file
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    fs.writeFileSync(testImagePath, imageBuffer);
    
    console.log('📋 Created test image file');
    
    // Test the full base64 data URL (with prefix)
    const testImageDataUrl = `data:image/png;base64,${testImageBase64}`;
    
    console.log('📋 Test full base64 data URL:', {
      starts_with_data: testImageDataUrl.startsWith('data:image/'),
      is_valid_base64: testImageDataUrl.includes('base64,'),
      length: testImageDataUrl.length,
      prefix: testImageDataUrl.substring(0, 22) + '...'
    });
    
    // Test saving to database
    console.log('\n🔍 Testing database save with full base64...');
    
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
        content: testImageDataUrl, // Full base64 data URL
        type: 'image'
      };
      
      console.log('📋 Test message structure:', {
        content_starts_with_data: testMessage.content.startsWith('data:image/'),
        type: testMessage.type,
        content_length: testMessage.content.length
      });
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([testMessage])
        .select();
      
      if (error) {
        console.log('❌ Error inserting full base64 message:', error.message);
      } else {
        console.log('✅ Successfully inserted full base64 message');
        console.log('📋 Message ID:', data[0].id);
        
        // Test retrieving the message
        const { data: retrievedMessage, error: retrieveError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('id', data[0].id)
          .single();
        
        if (retrieveError) {
          console.log('❌ Error retrieving message:', retrieveError.message);
        } else {
          console.log('✅ Successfully retrieved message');
          console.log('📋 Retrieved content starts with data:', retrievedMessage.content.startsWith('data:image/'));
          console.log('📋 Retrieved type:', retrievedMessage.type);
          console.log('📋 Retrieved content prefix:', retrievedMessage.content.substring(0, 22) + '...');
          
          // Test if the content can be used as image src
          console.log('📋 Content can be used as image src:', retrievedMessage.content.startsWith('data:image/'));
        }
        
        // Clean up
        await supabase
          .from('chat_messages')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test message');
      }
    }
    
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Cleaned up test image file');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testFullBase64().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
