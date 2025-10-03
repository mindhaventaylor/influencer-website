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

async function testImageFallbackFlow() {
  console.log('🔍 Testing image fallback flow...');
  
  try {
    // Get existing data
    const { data: existingMessage } = await supabase
      .from('chat_messages')
      .select('user_id, influencer_id, conversation_id')
      .limit(1);
    
    if (!existingMessage || existingMessage.length === 0) {
      console.error('❌ No existing messages found. Please create a message first.');
      return;
    }
    
    const { user_id, influencer_id, conversation_id } = existingMessage[0];
    console.log('📋 Using existing data:', {
      userId: user_id,
      influencerId: influencer_id,
      conversationId: conversation_id
    });
    
    // Test image data
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const base64Data = `data:image/png;base64,${testImageBase64}`;
    
    console.log('\n🔍 Testing direct chat-messages API call...');
    
    // Test the chat-messages API directly (this is what the fallback does)
    const saveResponse = await fetch('http://localhost:3000/api/chat-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user_id,
        influencer_id: influencer_id,
        conversation_id: conversation_id,
        sender: 'user',
        content: base64Data,
        type: 'image'
      })
    });
    
    console.log('📋 Save response status:', saveResponse.status);
    
    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ Image message saved successfully:', {
        messageId: saveData.message?.id,
        success: saveData.success
      });
      
      // Clean up the test message
      console.log('\n🧹 Cleaning up test message...');
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', saveData.message.id);
      
      if (deleteError) {
        console.error('⚠️ Failed to clean up test message:', deleteError);
      } else {
        console.log('✅ Test message cleaned up');
      }
      
    } else {
      const errorText = await saveResponse.text();
      console.error('❌ Failed to save image message:', saveResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testImageFallbackFlow();
