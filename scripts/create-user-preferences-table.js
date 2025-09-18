const postgres = require('postgres');

// Load environment variables
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function createUserPreferencesTable() {
  try {
    console.log('🚀 Creating user_preferences table...');

    // Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        dark_mode BOOLEAN DEFAULT true NOT NULL,
        data_sharing_consent BOOLEAN DEFAULT false NOT NULL,
        personalization_consent BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
    `;

    console.log('✅ user_preferences table created successfully!');

    // Create unique index to ensure one preference record per user
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_user_id_unique 
      ON user_preferences (user_id);
    `;

    console.log('✅ Unique index created successfully!');
    
    // Verify the table was created by trying to query it
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_preferences';
    `;

    if (result && result.length > 0) {
      console.log('✅ Table verification successful - user_preferences table exists');
      return true;
    } else {
      console.log('❌ Table verification failed - user_preferences table not found');
      return false;
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function main() {
  console.log('🎯 Setting up user_preferences table...\n');

  const success = await createUserPreferencesTable();

  if (success) {
    console.log('\n🎉 user_preferences table setup completed successfully!');
    console.log('\n📋 Table structure:');
    console.log('   - id: UUID (Primary Key)');
    console.log('   - user_id: UUID (Foreign Key to users)');
    console.log('   - dark_mode: Boolean (default: true)');
    console.log('   - data_sharing_consent: Boolean (default: false)');
    console.log('   - personalization_consent: Boolean (default: false)');
    console.log('   - created_at: Timestamp');
    console.log('   - updated_at: Timestamp');
  } else {
    console.log('\n❌ user_preferences table setup failed!');
    process.exit(1);
  }
}

main().catch(console.error);
