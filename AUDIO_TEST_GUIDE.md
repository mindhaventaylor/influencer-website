# 🧪 Audio Request Test Script

## Overview
This script tests the audio generation functionality of your multimedia API endpoint.

## Usage

### Run All Tests
```bash
node test-audio-request.js
```

### Test Specific Scenario
```bash
node test-audio-request.js "Text to Audio"
node test-audio-request.js "Image to Audio"
node test-audio-request.js "Audio to Audio"
```

## Test Scenarios

### 1. Text to Audio
- **Input**: Text message
- **Expected**: AI responds with audio
- **Tests**: Basic text-to-audio conversion

### 2. Image to Audio
- **Input**: Image with text description
- **Expected**: AI responds with audio describing the image
- **Tests**: Image processing and audio generation

### 3. Audio to Audio
- **Input**: Audio message
- **Expected**: AI responds with audio
- **Tests**: Audio-to-audio conversation flow

## Configuration

### Environment Variables
Make sure these are set in your `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TEST_AUTH_TOKEN=your-test-token

# AI Service Configuration
AI_SERVICE_URL=your-ai-service-url
AI_SERVICE_TOKEN=your-ai-service-token
ELEVENLABS_VOICE_ID=your-voice-id
```

### Test Data
The script uses these test IDs:
- **User ID**: `test_user_123`
- **Influencer ID**: `test_influencer_456`

## Expected Output

### Successful Test
```
🧪 Testing: Text to Audio
📝 Description: Send text message and expect audio response
📤 Request: { ... }
⏱️  Response time: 2500ms
📊 Status: 200 OK
📥 Response data: { ... }
✅ Validation: {
  hasUserMessage: true,
  hasAiMessage: true,
  aiMessageIsAudio: true,
  hasAudioContent: true,
  responseTime: 2500
}
```

### Failed Test
```
❌ Request failed: Connection refused
❌ Error response: {"error":"AI service unavailable"}
```

## Validation Checks

The script validates:
- ✅ **User message** is saved
- ✅ **AI message** is generated
- ✅ **AI message type** is 'audio'
- ✅ **Audio content** is present (base64 or URL)
- ✅ **Response time** is reasonable

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if your Next.js server is running
   - Verify `NEXT_PUBLIC_SITE_URL` is correct

2. **AI Service Unavailable**
   - Check `AI_SERVICE_URL` and `AI_SERVICE_TOKEN`
   - Verify the AI service is running

3. **No Audio Generated**
   - Check console logs for audio generation decisions
   - Verify `should_generate_tts` is being sent correctly

4. **Authentication Errors**
   - Check `TEST_AUTH_TOKEN` matches your auth setup
   - Verify the Authorization header format

### Debug Mode
Add more logging by modifying the script:
```javascript
console.log('🔍 Debug info:', {
  url: `${API_BASE_URL}/api/post-multimedia-message`,
  headers: { ... },
  body: scenario.request
});
```

## Sample Output

```
🚀 Starting Audio Request Tests
==================================================

🧪 Testing: Text to Audio
📝 Description: Send text message and expect audio response
📤 Request: {
  "user_id": "test_user_123",
  "influencer_id": "test_influencer_456",
  "input_media_type": "text",
  "user_query": "Hello! Can you tell me about artificial intelligence?",
  "should_generate_tts": true
}
⏱️  Response time: 2500ms
📊 Status: 200 OK
📥 Response data: {
  "userMessage": { ... },
  "aiMessage": {
    "id": "1234567890",
    "sender": "influencer",
    "content": "data:audio/mpeg;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqF...",
    "type": "audio",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
✅ Validation: {
  "hasUserMessage": true,
  "hasAiMessage": true,
  "aiMessageIsAudio": true,
  "hasAudioContent": true,
  "responseTime": 2500
}

📊 Test Summary
==================================================
1. Text to Audio: ✅ PASS
   - AI Message Type: Audio
   - Has Audio Content: Yes
   - Response Time: 2500ms

🎯 Results: 1/1 tests passed
🎉 All tests passed! Audio generation is working correctly.
```
