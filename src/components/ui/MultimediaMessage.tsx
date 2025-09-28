import React, { useState } from 'react';
import { Play, Pause, Volume2, Image, Mic } from 'lucide-react';

interface MultimediaMessageProps {
  message: {
    id: string;
    content: string;
    type: string;
  };
  sender: 'user' | 'influencer';
}

const MultimediaMessage: React.FC<MultimediaMessageProps> = ({ message, sender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Ensure type has a default value
  const contentType = message.type || 'text';

  const handleAudioPlay = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    } else if (message.content && message.content.startsWith('data:audio/')) {
      const audio = new Audio(message.content);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        console.error('Error playing audio');
        setIsPlaying(false);
      };
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    }
  };

  const renderInputMedia = () => {
    // For user messages, check if type is image or audio
    if (sender === 'user' && contentType === 'image' && message.content.startsWith('data:image/')) {
      return (
        <div className="mb-2">
          <img
            src={message.content}
            alt="User uploaded image"
            className="max-w-xs max-h-64 rounded-lg object-cover border border-border"
          />
        </div>
      );
    }

    // Handle image with text combination (stored as JSON in image type)
    if (sender === 'user' && contentType === 'image' && message.content.startsWith('{')) {
      console.log('🔍 Rendering image+text message:', {
        contentType,
        contentLength: message.content?.length,
        contentPreview: message.content?.substring(0, 100)
      });
      
      try {
        const parsedContent = JSON.parse(message.content);
        console.log('🔍 Parsed content:', {
          hasImage: !!parsedContent.image,
          hasText: !!parsedContent.hasText,
          textLength: parsedContent.text?.length
        });
        
        if (parsedContent.hasText && parsedContent.image && parsedContent.text) {
          return (
            <div className="mb-2 space-y-2">
              <img
                src={parsedContent.image}
                alt="User uploaded image"
                className="max-w-xs max-h-64 rounded-lg object-cover border border-border"
              />
              <div className="text-sm text-white bg-secondary/50 p-2 rounded-lg">
                {parsedContent.text}
              </div>
            </div>
          );
        } else {
          console.log('⚠️ Parsed content missing required fields');
        }
      } catch (error) {
        console.error('❌ Error parsing image+text content:', error);
        console.log('❌ Raw content:', message.content);
        // Fallback to regular image display
        return null;
      }
    }

    if (sender === 'user' && contentType === 'audio' && message.content.startsWith('data:audio/')) {
      return (
        <div className="mb-2 flex items-center space-x-2">
          <button
            onClick={handleAudioPlay}
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-primary" />
            ) : (
              <Play className="w-4 h-4 text-primary" />
            )}
          </button>
          <span className="text-sm text-muted-foreground">Audio message</span>
        </div>
      );
    }

    return null;
  };

  const renderOutputMedia = () => {
    // For AI messages, check if type is audio and has base64 audio data
    if (sender === 'influencer' && contentType === 'audio' && message.content.startsWith('data:audio/')) {
      return (
        <div className="flex items-center space-x-3 mt-3">
          <button
            onClick={handleAudioPlay}
            className="flex items-center space-x-2 p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-primary" />
            ) : (
              <Play className="w-5 h-5 text-primary" />
            )}
            <span className="text-sm font-medium">Play Response</span>
          </button>
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </div>
      );
    }

    return null;
  };

  const getInputIcon = () => {
    switch (contentType) {
      case 'image':
        return <Image className="w-3 h-3" />;
      case 'audio':
        return <Mic className="w-3 h-3" />;
      case 'image_with_text':
        return <Image className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Media type indicator */}
      {contentType && contentType !== 'text' && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {getInputIcon()}
          <span>{contentType === 'image_with_text' ? 'IMAGE + TEXT' : contentType.toUpperCase()}</span>
        </div>
      )}

      {/* Input media content (for user messages) */}
      {renderInputMedia()}

      {/* Text content - only show if it's not base64 media data or JSON content */}
      {message.content && contentType && 
       message.content !== `[${contentType.toUpperCase()}_MESSAGE]` &&
       !message.content.startsWith('data:image/') &&
       !message.content.startsWith('data:audio/') &&
       !message.content.startsWith('{') && (
        <div className="prose prose-sm max-w-none">
          {message.content}
        </div>
      )}

      {/* Output media content (for AI messages) */}
      {renderOutputMedia()}
    </div>
  );
};

export default MultimediaMessage;
