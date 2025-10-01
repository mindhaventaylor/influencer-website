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

  // Detect audio content from URL/base64 (database constraint only allows 'text' and 'image')
  const isAudioContent = message.content && (
    message.content.startsWith('data:audio/') || 
    message.content.startsWith('http') ||
    message.content.startsWith('https://')
  );
  
  // Use database type as primary, but detect audio content even when type is 'text'
  const effectiveContentType = contentType === 'audio' ? 'audio' : 
                               contentType === 'image' ? 'image' : 
                               isAudioContent ? 'audio' : 'text';
  
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
    
    // Audio detection
    isAudioContent,
    isBase64: message.content?.startsWith('data:'),
    isHttp: message.content?.startsWith('http'),
    isHttps: message.content?.startsWith('https://'),
    
    // Content type detection
    startsWithDataAudio: message.content?.startsWith('data:audio/'),
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
    let audioSource = message.content;
    
    // Determine audio source type with detailed logging
    console.log('🔍 Audio source determination:', {
      originalContent: message.content,
      originalContentLength: message.content?.length,
      startsWithDataAudio: message.content?.startsWith('data:audio/'),
      startsWithHttp: message.content?.startsWith('http'),
      startsWithHttps: message.content?.startsWith('https://'),
      contentType: message.type,
      effectiveContentType
    });
    
    if (message.content && message.content.startsWith('data:audio/')) {
      console.log('🎵 Using base64 audio from message content');
      audioSource = message.content;
    } else if (message.content && message.content.startsWith('http')) {
      console.log('🎵 Using AI service audio URL:', message.content);
      audioSource = message.content;
    } else {
      console.log('🎵 No valid audio content, using fallback audio URL');
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
    return (
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
    );
  }

  // Render image
  if (effectiveContentType === 'image') {
    return (
      <div className="mt-3">
        <img
          src={message.content}
          alt="Generated image"
          className="max-w-sm max-h-96 rounded-lg object-cover border border-border"
        />
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
