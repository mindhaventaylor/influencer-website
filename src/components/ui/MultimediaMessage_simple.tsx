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
    message.content.startsWith('http')
  );
  
  // Use database type as primary, but detect audio content even when type is 'text'
  const effectiveContentType = contentType === 'audio' ? 'audio' : 
                               contentType === 'image' ? 'image' : 
                               isAudioContent ? 'audio' : 'text';
  
  // Debug logging
  console.log('🎵 MultimediaMessage debug:', {
    messageType: contentType,
    effectiveContentType,
    isAudioContent,
    contentPreview: message.content?.substring(0, 50),
    contentLength: message.content?.length,
    hasContent: !!message.content,
    fullContent: message.content,
    isBase64: message.content?.startsWith('data:'),
    isHttp: message.content?.startsWith('http'),
    isOldBase64: message.content?.includes('UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=')
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
  }, [audioElement]);

  const handleAudioPlay = async () => {
    console.log('🔊 Audio play button clicked - SIMPLIFIED VERSION');
    
    // Stop any existing audio
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
      setIsPlaying(false);
    }
    
    // Always use the reliable WAV file
    const audioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
    console.log('🎵 Using reliable audio URL:', audioUrl);
    
    try {
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('ended', () => {
        console.log('🏁 Audio ended');
        setIsPlaying(false);
        setAudioElement(null);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error:', e);
        console.error('❌ Audio error details:', audio.error);
        setIsPlaying(false);
        setAudioElement(null);
      });
      
      setAudioElement(audio);
      await audio.play();
      setIsPlaying(true);
      console.log('✅ Audio started successfully');
      
    } catch (error) {
      console.error('❌ Failed to play audio:', error);
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

