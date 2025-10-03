import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, Image, X, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

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
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Image zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Debug modal state changes
  useEffect(() => {
    console.log('🖼️ Image modal state changed:', showImageModal);
  }, [showImageModal]);

  // Reset zoom and pan when modal opens/closes
  useEffect(() => {
    if (showImageModal) {
      setZoomLevel(1);
      setPanX(0);
      setPanY(0);
    }
  }, [showImageModal]);

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5)); // Max 5x zoom
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5)); // Min 0.5x zoom
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  // Pan functions
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - panX, 
        y: e.clientY - panY 
      });
      console.log('🖱️ Mouse down on image - starting drag:', { 
        clientX: e.clientX, 
        clientY: e.clientY, 
        panX, 
        panY,
        zoomLevel,
        dragStart: { x: e.clientX - panX, y: e.clientY - panY }
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      e.stopPropagation();
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      
      // Add some constraints to prevent panning too far
      const maxPan = 300; // Increased maximum pan distance
      const constrainedPanX = Math.max(-maxPan, Math.min(maxPan, newPanX));
      const constrainedPanY = Math.max(-maxPan, Math.min(maxPan, newPanY));
      
      setPanX(constrainedPanX);
      setPanY(constrainedPanY);
      console.log('🖱️ Mouse move on image - dragging:', { 
        clientX: e.clientX, 
        clientY: e.clientY, 
        newPanX, 
        newPanY,
        constrainedPanX,
        constrainedPanY,
        dragStart,
        zoomLevel
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) {
      console.log('🖱️ Mouse up - ending drag');
      setIsDragging(false);
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

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

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

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

  // Helper function to get image source with proper MIME type
  const getImageSrc = (imageContent: string) => {
    if (imageContent.startsWith('data:')) {
      return imageContent; // Already has MIME type
    } else {
      // Assume it's a common image format, you might want to store the MIME type separately
      return `data:image/jpeg;base64,${imageContent}`;
    }
  };

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
      <>
        <div className="space-y-2">
          {displayText && (
            <div className="text-sm mb-2">
              {displayText}
            </div>
          )}
          <div className="mt-3 relative group">
            <img
              src={getImageSrc(displayContent)}
              alt="User uploaded image"
              className="max-w-sm max-h-96 rounded-lg object-cover border border-border cursor-pointer hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖼️ Image clicked, opening modal');
                setShowImageModal(true);
              }}
            />
            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
              <div className="bg-white bg-opacity-90 rounded-full p-2">
                <ZoomIn className="w-4 h-4 text-gray-700" />
              </div>
            </div>
            {/* Test button for debugging */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖼️ Test button clicked, opening modal');
                setShowImageModal(true);
              }}
              className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Zoom
            </button>
          </div>
        </div>

        {/* Image Zoom Modal */}
        {showImageModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            style={{ zIndex: 9999 }}
            onClick={(e) => {
              console.log('🖼️ Modal background clicked, closing modal');
              setShowImageModal(false);
            }}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
              {/* Control buttons */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetZoom();
                  }}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🖼️ Close button clicked');
                  setShowImageModal(false);
                }}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-colors"
                style={{ zIndex: 10000 }}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Zoom level indicator */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {Math.round(zoomLevel * 100)}%
              </div>
              
              {/* Image container with zoom and pan */}
              <div 
                className="w-full h-full overflow-hidden rounded-lg relative"
                onWheel={handleWheel}
                style={{ 
                  userSelect: 'none'
                }}
              >
                <img
                  ref={imageRef}
                  src={getImageSrc(displayContent)}
                  alt="User uploaded image - full size"
                  className={`w-full h-full object-contain ${
                    isDragging ? 'transition-none' : 'transition-transform duration-200'
                  }`}
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`,
                    cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    transformOrigin: 'center center',
                    userSelect: 'none'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  draggable={false}
                />
              </div>

              {/* Instructions */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
                <div className="flex items-center gap-4">
                  <span>🖱️ Scroll to zoom</span>
                  {zoomLevel > 1 && (
                    <span className="text-yellow-300">🖱️ Drag to pan</span>
                  )}
                  <span>⌨️ ESC to close</span>
                </div>
              </div>

              {/* Pan indicator when zoomed */}
              {zoomLevel > 1 && (
                <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isDragging 
                    ? 'bg-red-500 bg-opacity-90 text-white' 
                    : 'bg-yellow-500 bg-opacity-80 text-black'
                }`}>
                  <Move className="w-3 h-3 inline mr-1" />
                  {isDragging ? 'Dragging...' : 'Drag to pan'}
                </div>
              )}
            </div>
          </div>
        )}
      </>
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
