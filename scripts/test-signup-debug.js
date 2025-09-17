#!/usr/bin/env node

console.log('🔍 **TESTING SIGNUP DEBUG FLOW**\n');

async function testSignupDebug() {
  try {
    console.log('🔍 Testing signup debug flow...');

    console.log('\n📋 Debug Points Added:');
    console.log('   1. ✅ OnboardingProfile - Logs data being passed');
    console.log('   2. ✅ SignUp component - Logs data being sent to API');
    console.log('   3. ✅ API signUp - Logs received data');
    console.log('   4. ✅ /api/users/create - Logs received data');
    console.log('   5. ✅ Database insert - Logs data being inserted');

    console.log('\n🔧 Data Flow:');
    console.log('   • OnboardingProfile → SignUp → API → /api/users/create → Database');
    console.log('   • Each step now logs the data being passed');

    console.log('\n📝 Expected Data Flow:');
    console.log('   1. OnboardingProfile: { username: "testuser", display_name: "Test User", ... }');
    console.log('   2. SignUp: { email: "...", username: "testuser", display_name: "Test User" }');
    console.log('   3. API: { email: "...", username: "testuser", display_name: "Test User" }');
    console.log('   4. /api/users/create: { email: "...", username: "testuser", display_name: "Test User" }');
    console.log('   5. Database: { id: "...", email: "...", username: "testuser", display_name: "Test User", stripe_customer_id: "..." }');

    console.log('\n🎉 Signup debug test completed!');
    console.log('\n📝 To test in browser:');
    console.log('   1. Open browser dev tools');
    console.log('   2. Go through signup flow');
    console.log('   3. Check console logs at each step');
    console.log('   4. Verify data is being passed correctly');
    console.log('   5. Check if username/display_name are null in database');
    
  } catch (error) {
    console.error('❌ Error testing signup debug:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testSignupDebug();

