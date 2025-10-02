import React, { useState, useEffect } from 'react';
import { Play, Pause, Mic, Image } from 'lucide-react';

interface MultimediaMessageProps {
  message: {
    id: string;
    sender: 'user' | 'influencer';
    content: string;
    type?: string;
    created_at?: string;
  };
  sender: 'user' | 'influencer';
}

const MultimediaMessage: React.FC<MultimediaMessageProps> = ({ message, sender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Use the database type field as the primary source of truth
  const contentType = message.type || 'text';

  // Parse content if it's JSON (for image_with_text or audio_with_text)
  let parsedContent: { text?: string; media?: string; image?: string; audio?: string; hasText?: boolean } | null = null;
  let displayContent = message.content;
  let displayText = '';
  
  // Try to parse JSON content for media_with_text messages
  if (contentType === 'image_with_text' || contentType === 'audio_with_text') {
    try {
      parsedContent = JSON.parse(message.content);
      // For image_with_text: look for 'image' field
      // For audio_with_text: look for 'audio' field
      displayContent = parsedContent?.image || parsedContent?.audio || parsedContent?.media || message.content;
      displayText = parsedContent?.text || '';
      console.log('📦 Parsed media_with_text content:', {
        type: contentType,
        hasText: !!displayText,
        hasMedia: !!displayContent,
        textPreview: displayText?.substring(0, 50),
        imageField: !!parsedContent?.image,
        audioField: !!parsedContent?.audio,
        mediaField: !!parsedContent?.media,
        audioContentPreview: parsedContent?.audio?.substring(0, 100),
        audioContentLength: parsedContent?.audio?.length,
        audioContentType: parsedContent?.audio?.startsWith('data:audio/') ? 'BASE64_AUDIO' : 
                          parsedContent?.audio?.startsWith('http') ? 'URL_AUDIO' : 'UNKNOWN'
      });
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON content for', contentType, parseError);
      displayContent = message.content;
    }
  } else if (message.content && message.content.startsWith('{') && (message.content.includes('"text"') && (message.content.includes('"image"') || message.content.includes('"audio"')))) {
    // Fallback: Try to parse JSON even if type is not set correctly
    try {
      parsedContent = JSON.parse(message.content);
      displayContent = parsedContent?.image || parsedContent?.audio || message.content;
      displayText = parsedContent?.text || '';
      console.log('📦 Fallback JSON parsing successful:', {
        hasText: !!displayText,
        hasMedia: !!displayContent,
        textPreview: displayText?.substring(0, 50),
        hasImage: !!parsedContent?.image,
        hasAudio: !!parsedContent?.audio
      });
    } catch (fallbackError) {
      console.warn('⚠️ Fallback JSON parsing also failed:', fallbackError);
    }
  }

  // Detect audio content from URL/base64
  const isAudioContent = displayContent && (
    displayContent.startsWith('data:audio/') || 
    displayContent.startsWith('data:video/') || // Some audio formats are detected as video
    displayContent.startsWith('data:video/mp4') || // MP4 audio files
    displayContent.startsWith('data:audio/mp4') || // MP4 audio files
    displayContent.startsWith('http') ||
    displayContent.startsWith('https://')
  );
  
  // Use database type as primary source of truth
  const effectiveContentType = contentType === 'audio' || contentType === 'audio_with_text' ? 'audio' : 
                               contentType === 'image' || contentType === 'image_with_text' ? 'image' : 
                               'text';
  
  // Comprehensive debug logging
  console.log('🎵 MultimediaMessage COMPREHENSIVE DEBUG:', {
    // Message metadata
    messageId: message.id,
    sender: sender,
    messageType: contentType,
    effectiveContentType,
    
    // Content analysis
    hasContent: !!message.content,
    contentLength: message.content?.length,
    contentPreview: message.content?.substring(0, 100),
    
    // JSON parsing results
    parsedContent,
    displayContent: displayContent?.substring(0, 100),
    displayText,
    hasDisplayText: !!displayText,
    hasDisplayContent: !!displayContent,
    
    // Image detection
    isImageContent: displayContent?.startsWith('data:image/'),
    isImageBase64: displayContent?.includes('data:image/'),
    
    // Audio detection
    isAudioContent,
    isBase64: message.content?.startsWith('data:'),
    isHttp: message.content?.startsWith('http'),
    isHttps: message.content?.startsWith('https://'),
    
    // Content type detection
    startsWithDataAudio: message.content?.startsWith('data:audio/'),
    startsWithDataImage: message.content?.startsWith('data:image/'),
    startsWithHttp: message.content?.startsWith('http'),
    startsWithHttps: message.content?.startsWith('https://'),
    
    // Legacy base64 detection
    isOldBase64: message.content?.includes('UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='),
    
    // Full content (truncated for logging)
    fullContent: message.content?.length > 200 ? message.content.substring(0, 200) + '...' : message.content,
    
    // Audio state
    isPlaying,
    hasAudioElement: !!audioElement,
    
    // Component state
    timestamp: new Date().toISOString()
  });

  // Cleanup audio element on component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        try {
          audioElement.pause();
          audioElement.src = '';
          setAudioElement(null);
        } catch (error) {
          console.error('❌ Error cleaning up audio:', error);
        }
      }
    };
  }, []); // Remove audioElement dependency to prevent cleanup on every change

  const handleAudioPlay = async () => {
    console.log('🔊 AUDIO PLAY BUTTON CLICKED - DETAILED DEBUG:', {
      // Current state
      isPlaying,
      hasAudioElement: !!audioElement,
      messageId: message.id,
      sender: sender,
      
      // Message content analysis
      messageContent: message.content,
      contentType: message.type,
      effectiveContentType,
      
      // Audio element state
      audioElementSrc: audioElement?.src,
      audioElementPaused: audioElement?.paused,
      audioElementEnded: audioElement?.ended,
      audioElementReadyState: audioElement?.readyState,
      audioElementNetworkState: audioElement?.networkState,
      
      // Timestamp
      timestamp: new Date().toISOString()
    });
    
    // Handle pause if already playing
    if (audioElement && isPlaying) {
      try {
        console.log('⏸️ Pausing existing audio element...');
        audioElement.pause();
        setIsPlaying(false);
        console.log('✅ Audio paused successfully');
        return;
      } catch (error) {
        console.error('❌ Error pausing audio:', error);
        console.error('❌ Audio pause error details:', {
          error: error,
          errorMessage: (error as Error).message,
          audioElement: audioElement,
          audioElementSrc: audioElement?.src
        });
      }
    }
    
    // Handle resume if paused
    if (audioElement && !isPlaying) {
      try {
        console.log('▶️ Resuming existing audio element...');
        console.log('🔍 Resume attempt details:', {
          audioElementSrc: audioElement.src,
          audioElementCurrentTime: audioElement.currentTime,
          audioElementDuration: audioElement.duration,
          audioElementReadyState: audioElement.readyState,
          audioElementNetworkState: audioElement.networkState
        });
        
        await audioElement.play();
        setIsPlaying(true);
        console.log('✅ Audio resumed successfully');
        return;
      } catch (error) {
        console.error('❌ Error resuming audio:', error);
        console.error('❌ Audio resume error details:', {
          error: error,
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          audioElement: audioElement,
          audioElementSrc: audioElement?.src,
          audioElementReadyState: audioElement?.readyState
        });
        // If resume fails, create new audio element
        setAudioElement(null);
        setIsPlaying(false);
      }
    }
    
    // Create new audio element with actual content
    console.log('🎵 Creating new audio element...');
    let audioSource = displayContent; // Use parsed displayContent instead of raw message.content
    
    console.log('🎵 Audio source analysis:', {
      displayContent: displayContent?.substring(0, 100),
      displayContentLength: displayContent?.length,
      isBase64Audio: displayContent?.startsWith('data:audio/'),
      isHttpAudio: displayContent?.startsWith('http'),
      isHttpsAudio: displayContent?.startsWith('https://'),
      contentType: message.type,
      effectiveContentType,
      parsedContent: parsedContent,
      // Additional debugging for audio content
      originalMessageContent: message.content?.substring(0, 100),
      hasParsedAudio: !!parsedContent?.audio,
      parsedAudioPreview: parsedContent?.audio?.substring(0, 50),
      parsedAudioLength: parsedContent?.audio?.length,
      parsedAudioType: parsedContent?.audio?.startsWith('data:audio/') ? 'BASE64_AUDIO' : 
                       parsedContent?.audio?.startsWith('data:video/') ? 'BASE64_VIDEO' : 
                       parsedContent?.audio?.startsWith('http') ? 'URL_AUDIO' : 'UNKNOWN'
    });
    
    // Determine audio source type with detailed logging
    console.log('🔍 Audio source determination:', {
      originalContent: message.content,
      originalContentLength: message.content?.length,
      displayContent: displayContent,
      displayContentLength: displayContent?.length,
      startsWithDataAudio: displayContent?.startsWith('data:audio/'),
      startsWithHttp: displayContent?.startsWith('http'),
      startsWithHttps: displayContent?.startsWith('https://'),
      contentType: message.type,
      effectiveContentType,
      hasDisplayText: !!displayText
    });
    
    // Priority: 1) Parsed audio content, 2) Display content, 3) Fallback
    if (parsedContent?.audio && (
      parsedContent.audio.startsWith('data:audio/') || 
      parsedContent.audio.startsWith('data:video/') || 
      parsedContent.audio.startsWith('data:video/mp4') || // MP4 audio files
      parsedContent.audio.startsWith('data:audio/mp4') || // MP4 audio files
      parsedContent.audio.startsWith('http')
    )) {
      console.log('🎵 Using parsed audio content from JSON');
      audioSource = parsedContent.audio;
    } else if (parsedContent?.audio && parsedContent.audio.startsWith('data:')) {
      // Fallback: Try any data URL that might be audio
      console.log('🎵 Using parsed audio content (any data URL)');
      audioSource = parsedContent.audio;
    } else if (displayContent && (
      displayContent.startsWith('data:audio/') || 
      displayContent.startsWith('data:video/') ||
      displayContent.startsWith('data:video/mp4') || // MP4 audio files
      displayContent.startsWith('data:audio/mp4')    // MP4 audio files
    )) {
      console.log('🎵 Using base64 audio from display content');
      audioSource = displayContent;
    } else if (displayContent && displayContent.startsWith('data:')) {
      // Fallback: Try any data URL that might be audio
      console.log('🎵 Using display content (any data URL)');
      audioSource = displayContent;
    } else if (displayContent && displayContent.startsWith('http')) {
      console.log('🎵 Using AI service audio URL:', displayContent);
      audioSource = displayContent;
    } else {
      console.log('🎵 No valid audio content, using fallback audio URL');
      console.log('🎵 Fallback reason:', {
        hasDisplayContent: !!displayContent,
        displayContentType: displayContent?.substring(0, 20),
        isDataAudio: displayContent?.startsWith('data:audio/'),
        isDataVideo: displayContent?.startsWith('data:video/'),
        isDataVideoMp4: displayContent?.startsWith('data:video/mp4'),
        isDataAudioMp4: displayContent?.startsWith('data:audio/mp4'),
        isDataUrl: displayContent?.startsWith('data:'),
        isHttp: displayContent?.startsWith('http'),
        hasParsedAudio: !!parsedContent?.audio,
        parsedAudioType: parsedContent?.audio?.substring(0, 20),
        parsedAudioIsDataUrl: parsedContent?.audio?.startsWith('data:')
      });
      audioSource = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
    }
    
    console.log('🎵 Final audio source details:', {
      audioSource: audioSource,
      isBase64: audioSource?.startsWith('data:audio/'),
      isUrl: audioSource?.startsWith('http'),
      isHttps: audioSource?.startsWith('https://'),
      contentLength: audioSource?.length,
      contentPreview: audioSource?.substring(0, 100),
      sourceType: audioSource?.startsWith('data:audio/') ? 'BASE64' : 
                  audioSource?.startsWith('http') ? 'URL' : 'FALLBACK'
    });
    
    try {
      console.log('🎵 Creating Audio element with source:', audioSource);
      const audio = new Audio(audioSource);
      
      console.log('🎵 Audio element created successfully');
      
      // Add comprehensive event listeners
      audio.addEventListener('ended', () => {
        console.log('🏁 Audio ended event fired');
        console.log('🏁 Audio ended details:', {
          currentTime: audio.currentTime,
          duration: audio.duration,
          ended: audio.ended,
          paused: audio.paused
        });
        setIsPlaying(false);
        setAudioElement(null);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error event fired:', e);
        console.error('❌ Audio error details:', {
          error: audio.error,
          errorCode: audio.error?.code,
          errorMessage: audio.error?.message,
          src: audio.src,
          currentSrc: audio.currentSrc,
          networkState: audio.networkState,
          readyState: audio.readyState,
          duration: audio.duration,
          paused: audio.paused,
          ended: audio.ended,
          volume: audio.volume,
          muted: audio.muted
        });
        setIsPlaying(false);
        setAudioElement(null);
      });
      
      audio.addEventListener('loadstart', () => {
        console.log('🔄 Audio loadstart event fired');
      });
      
      audio.addEventListener('loadeddata', () => {
        console.log('📊 Audio loadeddata event fired');
        console.log('📊 Audio loadeddata details:', {
          duration: audio.duration,
          readyState: audio.readyState,
          networkState: audio.networkState
        });
      });
      
      audio.addEventListener('canplay', () => {
        console.log('▶️ Audio canplay event fired');
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Audio canplaythrough event fired');
      });
      
      // Set the audio element first, then play
      console.log('🎵 Setting audio element state...');
      setAudioElement(audio);
      
      // Small delay to ensure the element is set
      console.log('🎵 Waiting 10ms before playing...');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      console.log('🎵 Attempting to play audio...');
      console.log('🔍 Pre-play audio state:', {
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
        duration: audio.duration,
        paused: audio.paused,
        ended: audio.ended
      });
      
      await audio.play();
      setIsPlaying(true);
      console.log('✅ Audio started successfully');
      console.log('✅ Post-play audio state:', {
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
        duration: audio.duration,
        paused: audio.paused,
        ended: audio.ended,
        currentTime: audio.currentTime
      });
      
    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      console.error('❌ Audio play error details:', {
        error: error,
        errorMessage: (error as Error).message,
        errorName: (error as Error).name,
        errorStack: (error as Error).stack,
        audioSource: audioSource,
        audioSourceType: audioSource?.startsWith('data:audio/') ? 'BASE64' : 'URL'
      });
      setIsPlaying(false);
      setAudioElement(null);
    }
  };

  // Render audio player
  if (effectiveContentType === 'audio') {
    console.log('🎵 Rendering audio player:', {
      hasDisplayText: !!displayText,
      displayText: displayText,
      hasDisplayContent: !!displayContent,
      displayContentPreview: displayContent?.substring(0, 50),
      contentType: message.type,
      effectiveContentType
    });
    
    return (
      <div className="space-y-2">
        {displayText && (
          <div className="text-sm mb-2">
            {displayText}
          </div>
        )}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <button
            onClick={handleAudioPlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <div className="text-sm font-medium">
              {isPlaying ? 'Playing audio...' : 'Audio message'}
            </div>
            <div className="text-xs text-muted-foreground">
              Click to {isPlaying ? 'pause' : 'play'}
            </div>
          </div>
          <Mic className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Render image
  if (effectiveContentType === 'image') {
    console.log('🖼️ Rendering image:', {
      hasDisplayText: !!displayText,
      displayText: displayText,
      hasDisplayContent: !!displayContent,
      displayContentPreview: displayContent?.substring(0, 50),
      contentType: message.type,
      effectiveContentType
    });
    
    return (
      <div className="space-y-2">
        {displayText && (
          <div className="text-sm mb-2">
            {displayText}
          </div>
        )}
        <div className="mt-3">
          <img
            src={displayContent}
            alt="User uploaded image"
            className="max-w-sm max-h-96 rounded-lg object-cover border border-border"
          />
        </div>
      </div>
    );
  }

  // Render text
  return (
    <div className="text-sm">
      {message.content}
    </div>
  );
};

export default MultimediaMessage;
