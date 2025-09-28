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

async function checkTableStructure() {
  console.log('🔍 Checking chat_messages table structure...');
  
  try {
    // Get a sample message to see the actual structure
    const { data: sampleMessage, error: sampleError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error fetching sample message:', sampleError);
      return;
    }
    
    if (sampleMessage && sampleMessage.length > 0) {
      console.log('📋 Sample message structure:');
      console.log('Columns:', Object.keys(sampleMessage[0]));
      console.log('\nFull message:', JSON.stringify(sampleMessage[0], null, 2));
    } else {
      console.log('⚠️ No messages found in database');
    }
    
    // Try to get column information
    console.log('\n🔍 Trying to get column information...');
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'chat_messages' });
    
    if (columnError) {
      console.log('⚠️ Could not get column info:', columnError.message);
    } else {
      console.log('📋 Column information:', columnInfo);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
checkTableStructure().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
