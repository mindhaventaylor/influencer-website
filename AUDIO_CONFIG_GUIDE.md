# 🔊 AI Audio Generation Configuration

## Overview
The AI audio generation system is configured to generate audio for every AI response, making conversations more engaging and interactive.

## Environment Variables
Add these to your `.env.local` file for audio configuration:

```bash
# ElevenLabs Configuration (if using)
ELEVENLABS_VOICE_ID=your_voice_id_here
```

## How It Works

### 1. Always Audio Generation
- **Every Response**: Every AI response will be generated as audio
- **No Randomness**: Consistent audio experience for all conversations
- **Immediate Audio**: Users get audio responses right away

### 2. Explicit Audio Request
- **Force Audio**: Set `should_generate_tts: true` in the request
- **Always Generates**: Bypasses any logic and always generates audio

## Current Configuration

### Always Audio Mode
The system is currently configured to generate audio for every AI response:

```typescript
const shouldSendAudio = true; // Every AI response will be audio
```

This means:
- ✅ **Every AI response** will be audio
- ✅ **No randomness** - consistent experience
- ✅ **Immediate audio** for all conversations

## Debugging

### Console Logs
The system logs audio generation decisions:
```
🔊 Audio generation check: {
  msgs_cnt_by_user: 4,
  should_generate_tts: false,
  shouldSendAudio: true,
  mode: 'always_audio'
}
```

### Audio Rendering Logs
```
🔊 Rendering AI audio message: {
  contentType: 'audio',
  contentLength: 1234,
  contentPreview: 'https://example.com/audio.mp3',
  isUrl: true,
  isBase64: false
}
```

## Troubleshooting

### No Audio Generated
1. Check console logs for audio generation decisions
2. Verify AI service is returning `audio_output_url`
3. Test with explicit `should_generate_tts: true`
4. Check if `shouldSendAudio` is set to `true`

### Audio Not Playing
1. Check browser console for audio errors
2. Verify audio URL is accessible
3. Check if audio format is supported by browser
4. Look for CORS issues with audio URLs

### Audio Always Generated
This is the expected behavior! Every AI response should generate audio.

## Testing

### Test Audio Generation
1. Send any message to test audio generation
2. Check console logs for audio generation decisions
3. Verify audio appears in chat interface
4. Test audio playback functionality

### Expected Behavior
- **Every AI response** should be audio
- **No text responses** from AI (only audio)
- **Consistent experience** across all conversations

### To Change Back to Random Audio
If you want to go back to random audio generation, change this line in the code:
```typescript
// Change from:
const shouldSendAudio = true;

// To:
const shouldSendAudio = should_generate_tts || Math.random() < audioProbability;
```
