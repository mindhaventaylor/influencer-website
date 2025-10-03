#!/usr/bin/env node

/**
 * Test script for audio request functionality
 * Tests the multimedia API endpoint with various scenarios
 */

require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test_user_123';
const TEST_INFLUENCER_ID = 'test_influencer_456';

// Test scenarios
const testScenarios = [
  {
    name: 'Text to Audio',
    description: 'Send text message and expect audio response',
    request: {
      user_id: TEST_USER_ID,
      influencer_id: TEST_INFLUENCER_ID,
      input_media_type: 'text',
      user_query: 'Hello! Can you tell me about artificial intelligence?',
      should_generate_tts: true
    }
  },
  {
    name: 'Image to Audio',
    description: 'Send image message and expect audio response',
    request: {
      user_id: TEST_USER_ID,
      influencer_id: TEST_INFLUENCER_ID,
      input_media_type: 'image',
      user_query: 'What do you see in this image?',
      image_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    }
  },
  {
    name: 'Audio to Audio',
    description: 'Send audio message and expect audio response',
    request: {
      user_id: TEST_USER_ID,
      influencer_id: TEST_INFLUENCER_ID,
      input_media_type: 'audio',
      user_query: 'Please respond to my audio message',
      audio_data: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqF'
    }
  }
];

async function testAudioRequest(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log('📤 Request:', JSON.stringify(scenario.request, null, 2));
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE_URL}/api/post-multimedia-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(scenario.request)
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error response:`, errorText);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    console.log('📥 Response data:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    const validation = validateResponse(data);
    console.log('✅ Validation:', validation);
    
    return { 
      success: true, 
      data, 
      responseTime,
      validation 
    };
    
  } catch (error) {
    console.log(`❌ Request failed:`, error.message);
    return { success: false, error: error.message };
  }
}

function validateResponse(data) {
  const validation = {
    hasUserMessage: !!data.userMessage,
    hasAiMessage: !!data.aiMessage,
    aiMessageIsAudio: data.aiMessage?.type === 'audio',
    hasAudioContent: !!data.aiMessage?.content?.startsWith('data:audio/'),
    hasAudioUrl: !!data.aiMessage?.content?.startsWith('http'),
    responseTime: data.responseTime || 'N/A'
  };
  
  validation.isValid = validation.hasUserMessage && 
                      validation.hasAiMessage && 
                      validation.aiMessageIsAudio;
  
  return validation;
}

async function runAllTests() {
  console.log('🚀 Starting Audio Request Tests');
  console.log('=' .repeat(50));
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const result = await testAudioRequest(scenario);
    results.push({ scenario: scenario.name, ...result });
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('=' .repeat(50));
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.scenario}: ${status}`);
    
    if (result.success && result.validation) {
      console.log(`   - AI Message Type: ${result.validation.aiMessageIsAudio ? 'Audio' : 'Text'}`);
      console.log(`   - Has Audio Content: ${result.validation.hasAudioContent || result.validation.hasAudioUrl ? 'Yes' : 'No'}`);
      console.log(`   - Response Time: ${result.responseTime}ms`);
    }
    
    if (result.error) {
      console.log(`   - Error: ${result.error}`);
    }
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Audio generation is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }
}

// Test individual scenario
async function testSingleScenario(scenarioName) {
  const scenario = testScenarios.find(s => s.name === scenarioName);
  if (!scenario) {
    console.log(`❌ Scenario '${scenarioName}' not found. Available scenarios:`);
    testScenarios.forEach(s => console.log(`   - ${s.name}`));
    return;
  }
  
  console.log(`🎯 Testing single scenario: ${scenarioName}`);
  await testAudioRequest(scenario);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Test specific scenario
    await testSingleScenario(args[0]);
  } else {
    // Run all tests
    await runAllTests();
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
main().catch(console.error);
