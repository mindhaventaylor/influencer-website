import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ChevronLeft, Image, Mic, Upload } from 'lucide-react';
import MessageFormatter from '@/components/ui/MessageFormatter';
import MultimediaMessage from '@/components/ui/MultimediaMessage';
import AudioRecorder from '@/components/ui/AudioRecorder';
import ChatCache from '@/lib/chatCache';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { logError } from '@/lib/errorLogger';
import { InfluencerCache } from '@/lib/influencerCache';
import { toast } from 'sonner';
import { getClientInfluencerInfo } from '@/lib/clientConfig';
import { useAuth } from '@/hooks/useAuth';

interface ChatThreadProps {
  onGoBack: () => void;
  influencerId?: string;
  userToken?: string;
  userId?: string;
}

const ChatThread = ({ onGoBack, influencerId, userToken, userId }: ChatThreadProps) => {
  const { session } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [influencer, setInfluencer] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [aiResponseType, setAiResponseType] = useState<'text' | 'audio'>('audio');
  const [isRecording, setIsRecording] = useState(false);
  
  // Debug: Log when animation type changes
  useEffect(() => {
    console.log('🎭 Animation type changed to:', aiResponseType);
  }, [aiResponseType]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOptimisticUpdateRef = useRef(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const isInitialLoadRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMediaType, setInputMediaType] = useState<'text' | 'audio' | 'image'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clientInfluencer = getClientInfluencerInfo();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'];

    if (allowedImageTypes.includes(file.type)) {
      setInputMediaType('image');
      setSelectedFile(file);
    } else if (allowedAudioTypes.includes(file.type)) {
      setInputMediaType('audio');
      setSelectedFile(file);
    } else {
      toast.error('File type not supported. Please select an image or audio file.');
      return;
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Keep the full data URL for display (e.g., "data:image/jpeg;base64,...")
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    setInputMediaType('text');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    // Convert blob to file
    const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    setSelectedFile(audioFile);
    setInputMediaType('audio');
    setIsRecording(false);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      if (!userId) {
        console.log('❌ ChatThread: No userId provided');
        return;
      }
      
      console.log('🔄 ChatThread: Initializing with influencerId:', influencerId, 'userId:', userId);
      console.log('📋 ChatThread: influencerId is', influencerId ? 'provided' : 'null - will fetch automatically');
      console.log('📋 ChatThread: userId details:', {
        userId,
        userIdType: typeof userId,
        userIdLength: userId?.length,
        isUndefined: userId === undefined,
        isNull: userId === null,
        isEmpty: userId === ''
      });
      
      try {
        setLoading(true);
        
        // 🚀 OPTIMIZATION: Check cache first for influencer data
        let influencerData, influencerIdData;
        const cachedData = InfluencerCache.get();
        
        if (cachedData) {
          console.log('🚀 Using cached influencer data');
          influencerData = cachedData.influencer;
          influencerIdData = cachedData.influencerId;
          
          if (mounted) setInfluencer(influencerData);
        } else {
          // 🚀 OPTIMIZATION: Use combined endpoint to get both influencer data and ID in one request
          try {
            const combinedResponse = await fetch('/api/influencer/combined');
            
            if (combinedResponse.ok) {
              const responseData = await combinedResponse.json();
              influencerData = responseData.influencer;
              influencerIdData = responseData.influencerId;
              
              // Cache the data for future use
              InfluencerCache.set(influencerData, influencerIdData);
              
              if (mounted) setInfluencer(influencerData);
            } else {
              console.warn('⚠️ Combined influencer API failed, using fallback');
              // Fallback to client config data
              influencerData = {
                id: clientInfluencer.id,
                display_name: clientInfluencer.displayName,
                avatar_url: clientInfluencer.avatarUrl,
                bio: clientInfluencer.bio,
                is_active: true
              };
              influencerIdData = { id: clientInfluencer.id };
              
              if (mounted) setInfluencer(influencerData);
            }
          } catch (fetchError) {
            console.warn('⚠️ Error fetching combined influencer data, using fallback:', fetchError);
            // Fallback to client config data
            influencerData = {
              id: clientInfluencer.id,
              display_name: clientInfluencer.displayName,
              avatar_url: clientInfluencer.avatarUrl,
              bio: clientInfluencer.bio,
              is_active: true
            };
            influencerIdData = { id: clientInfluencer.id };
            
            if (mounted) setInfluencer(influencerData);
          }
        }
        
        if (influencerData && influencerIdData) {
          // 🚀 FIX: Extract UUID from combined influencer ID string if needed
          let resolvedInfluencerId = influencerIdData.id; // Default to fetched ID
          
          if (influencerId) {
            // Check if influencerId contains both name and UUID (format: "Name:UUID")
            if (influencerId.includes(':')) {
              const parts = influencerId.split(':');
              if (parts.length >= 2) {
                // Extract the UUID part (last part after the colon)
                resolvedInfluencerId = parts[parts.length - 1];
                console.log('🔄 ChatThread: Extracted UUID from combined ID:', { 
                  original: influencerId, 
                  extracted: resolvedInfluencerId 
                });
              }
            } else {
              // If no colon, use the influencerId as-is (might be a direct UUID)
              resolvedInfluencerId = influencerId;
            }
          }
          
          console.log('🔄 ChatThread: Resolved IDs:', { 
            originalInfluencerId: influencerId, 
            resolvedInfluencerId, 
            userId,
            influencerData: !!influencerData,
            influencerIdData: !!influencerIdData
          });
          
          // Validate we have required IDs
          if (!resolvedInfluencerId || !userId) {
            console.error('❌ ChatThread: Missing required IDs:', { resolvedInfluencerId, userId });
            throw new Error('Missing required influencer or user ID');
          }
          
          // 🚀 OPTIMIZATION: Check cache first and show immediately if available
          const cachedMsgs = ChatCache.peekThread(resolvedInfluencerId, userId);
          if (cachedMsgs && cachedMsgs.length > 0) {
            if (mounted) {
              setMessages(cachedMsgs);
              setLoading(false); // Stop loading immediately for cached data
            }
          }
          
          // Fetch fresh messages in background
          console.log('🔄 ChatThread: Fetching messages for:', { resolvedInfluencerId, userId });
          const msgs = await ChatCache.getThread(resolvedInfluencerId, userId);
          if (mounted) {
            setMessages(msgs);
            setLoading(false);
          }
        } else {
          console.error('❌ ChatThread: Missing influencer data, using emergency fallback:', { influencerData: !!influencerData, influencerIdData: !!influencerIdData });
          
          // Emergency fallback - use client config data
          const emergencyInfluencerData = {
            id: clientInfluencer.id,
            display_name: clientInfluencer.displayName,
            avatar_url: clientInfluencer.avatarUrl,
            bio: clientInfluencer.bio,
            is_active: true
          };
          const emergencyInfluencerIdData = { id: clientInfluencer.id };
          
          if (mounted) setInfluencer(emergencyInfluencerData);
          
          // Proceed with emergency data
          const resolvedInfluencerId = influencerId || emergencyInfluencerIdData.id;
          
          if (resolvedInfluencerId && userId) {
            console.log('🚨 ChatThread: Using emergency fallback data:', { resolvedInfluencerId, userId });
            
            // Fetch messages with emergency data
            try {
              const msgs = await ChatCache.getThread(resolvedInfluencerId, userId);
              if (mounted) {
                setMessages(msgs);
                setLoading(false);
              }
            } catch (emergencyError) {
              console.error('❌ ChatThread: Emergency fallback also failed:', emergencyError);
              if (mounted) {
                toast.error('Failed to load chat. Please try refreshing the page.');
                setLoading(false);
              }
            }
          } else {
            console.error('❌ ChatThread: Emergency fallback missing required IDs:', { resolvedInfluencerId, userId });
            if (mounted) {
              toast.error('Unable to load chat. Please check your connection and try again.');
              setLoading(false);
            }
          }
        }
      } catch (err) {
        if (mounted) {
          const userFriendlyError = getUserFriendlyError(err);
          logError('Failed to initialize chat', err);
          toast.error(userFriendlyError);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    // subscribe to cache updates so optimistic updates reflect across navigations
    // We'll set up the subscription after we get the resolved influencer ID
    let unsubscribe: (() => void) | null = null;
    
    // 🚀 OPTIMIZATION: Setup subscription with cached influencer ID if available
    const setupSubscription = async () => {
      try {
        // Use influencerId if already available, otherwise fetch it
        let resolvedInfluencerId = influencerId;
        
        if (!resolvedInfluencerId) {
          const influencerIdResponse = await fetch('/api/influencer/id');
          if (influencerIdResponse.ok) {
            const influencerIdData = await influencerIdResponse.json();
            resolvedInfluencerId = influencerIdData.id;
          }
        }
        
        if (resolvedInfluencerId && userId) {
          unsubscribe = ChatCache.subscribeThread(resolvedInfluencerId, userId, (msgs) => {
            if (mounted && !isOptimisticUpdateRef.current) {
              console.log('🔄 Received cache update:', msgs.length, 'messages');
              setMessages(msgs);
            } else if (mounted && isOptimisticUpdateRef.current) {
              console.log('🔄 Skipping cache update during optimistic update');
            }
          });
        }
      } catch (error) {
        console.warn('Failed to setup subscription:', error);
      }
    };
    
    setupSubscription();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [influencerId, userId]);

  useEffect(() => {
    // Only scroll to bottom on initial load or when AI is replying (new messages)
    // Don't scroll when loading more messages (pagination)
    if (isInitialLoadRef.current || isAiReplying) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      isInitialLoadRef.current = false; // Mark initial load as complete
    }
  }, [messages, isAiReplying]);

  // Auto-scroll when new messages arrive (but not when loading more)
  useEffect(() => {
    if (messages.length > 0 && !isLoadingMoreRef.current) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && !selectedFile) return;

    const userMessageContent = newMessage;
    setNewMessage('');

    // Get the resolved influencer ID (database UUID)
    const influencerIdResponse = await fetch('/api/influencer/id');
    if (!influencerIdResponse.ok) {
      alert('Failed to get influencer information');
      return;
    }
    const influencerIdData = await influencerIdResponse.json();
    const resolvedInfluencerId = influencerIdData.id;
    
    if (!userId) {
      alert('User ID is required');
      return;
    }

    const tempId = Date.now().toString();
    // Convert file to base64 for optimistic update
    let base64Data = null;
    if (selectedFile) {
      try {
        base64Data = await convertFileToBase64(selectedFile);
      } catch (error) {
        console.error('Error converting file to base64:', error);
        toast.error('Failed to process file');
        return;
      }
    }

    // Handle different message types (text, image, audio, or combinations)
    let messageContent = '';
    let messageType = 'text';
    
    if (selectedFile && userMessageContent.trim()) {
      // Both media (image/audio) and text - store as JSON in content
      messageContent = JSON.stringify({
        text: userMessageContent,
        media: base64Data,
        hasText: true
      });
      // Use the actual media type with '_with_text' suffix
      messageType = `${inputMediaType}_with_text`;
    } else if (selectedFile) {
      // Only media (image or audio)
      messageContent = base64Data || '';
      messageType = inputMediaType;
    } else {
      // Only text
      messageContent = userMessageContent;
      messageType = 'text';
    }

    const optimisticUserMessage = { 
      id: tempId, 
      sender: 'user' as const, 
      content: messageContent,
      type: messageType,
      created_at: new Date().toISOString(),
      is_temp: true // Mark as temporary for identification
    };
    
    // 🚀 OPTIMISTIC UPDATE: Show user message immediately in local state FIRST
    console.log('🚀 Adding optimistic user message:', optimisticUserMessage);
    isOptimisticUpdateRef.current = true;
    
    setMessages(prev => {
      const exists = prev.some(msg => msg.id === optimisticUserMessage.id);
      return exists ? prev : [...prev, optimisticUserMessage];
    });
    
    // Then update cache (which will trigger subscription updates)
    ChatCache.appendToThread(resolvedInfluencerId, userId, optimisticUserMessage);
    
    // Reset optimistic update flag after a short delay
    setTimeout(() => {
      isOptimisticUpdateRef.current = false;
    }, 100);
    
    setIsAiReplying(true);
    // Set initial animation based on input type
    if (selectedFile) {
      if (inputMediaType === 'audio') {
        console.log('🎭 Setting initial animation to audio (audio input detected)');
        setAiResponseType('audio'); // Show audio animation for audio input
      } else {
        console.log('🎭 Setting initial animation to text (image input detected)');
        setAiResponseType('text'); // Show text animation for image/text input
      }
    } else {
      console.log('🎭 Setting initial animation to text (text input detected)');
      setAiResponseType('text'); // Default to text animation for text input
    }

    try {
      // Try multimedia API first if we have a file
      if (selectedFile) {
        try {
          // Convert file to base64
          const base64Data = await convertFileToBase64(selectedFile);
          
          // Prepare multimedia request
          const multimediaRequest = {
            user_id: userId,
            creator_id: resolvedInfluencerId,
            influencer_name: influencer?.display_name || clientInfluencer.displayName,
            chat_history: messages.slice(-10)
              .filter(msg => {
                // Only include text messages, exclude pure image and audio messages (with base64)
                const messageType = msg.type || 'text';
                return messageType === 'text' || 
                       messageType === 'image_with_text' || 
                       messageType === 'audio_with_text';
              })
              .map(msg => {
                // For media_with_text messages, extract only the text part
                if ((msg.type === 'image_with_text' || msg.type === 'audio_with_text') && typeof msg.content === 'string') {
                  try {
                    const parsed = JSON.parse(msg.content);
                    return [msg.sender, parsed.text || msg.content];
                  } catch {
                    return [msg.sender, msg.content];
                  }
                }
                return [msg.sender, msg.content];
              }),
            msgs_cnt_by_user: messages.filter(msg => msg.sender === 'user').length,
            input_media_type: inputMediaType, // Use inputMediaType (audio/image/text) not messageType
            user_query: userMessageContent || '',
            should_generate_tts: (messages.filter(msg => msg.sender === 'user').length + 1) % 15 === 0, // TTS every 15th message
            elevenlabs_voice_id: process.env.ELEVENLABS_VOICE_ID,
            ...(inputMediaType === 'image' && { image_data: base64Data }),
            ...(inputMediaType === 'audio' && { audio_data: base64Data })
          };

          console.log('🚀 Sending multimedia request:', { 
            inputMediaType, 
            hasImage: !!multimediaRequest.image_data,
            hasAudio: !!multimediaRequest.audio_data,
            base64Length: base64Data.length 
          });

          const response = await fetch('/api/post-multimedia-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(multimediaRequest),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const { userMessage, aiMessage, audioGenerated } = await response.json();
          
          // Replace optimistic message with real response
          ChatCache.replaceOptimistic(resolvedInfluencerId, userId, tempId, userMessage, aiMessage);
          
          console.log('🚀 Multimedia message sent successfully:', { audioGenerated });
          
          // Reset file selection
          resetFileSelection();
          return;
        } catch (multimediaError) {
          console.log('⚠️ Multimedia API failed, falling back to regular chat:', multimediaError);
          
          // Fallback: Save the image message directly to database
          try {
            if (!session?.access_token) {
              throw new Error('No authentication session available');
            }
            
            // Get or create conversation
            const conversationResponse = await fetch('/api/conversation/initialize', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
              },
              body: JSON.stringify({
                influencerId: resolvedInfluencerId
              })
            });
            
            if (!conversationResponse.ok) {
              const errorText = await conversationResponse.text();
              console.error('❌ Conversation initialization failed:', conversationResponse.status, errorText);
              throw new Error(`Conversation initialization failed: ${conversationResponse.status}`);
            }
            
            const { conversationId } = await conversationResponse.json();
            
            // Save user message with image
            const userMessage = {
              id: tempId,
              sender: 'user' as const,
              content: messageContent, // Use the processed messageContent
              type: messageType, // Use the processed messageType
              created_at: new Date().toISOString()
            };
            
            // Save to database
            const saveResponse = await fetch('/api/chat-messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                influencer_id: resolvedInfluencerId,
                conversation_id: conversationId,
                sender: 'user',
                content: messageContent,
                type: messageType  // The API will map this to content_type
              })
            });
            
            if (saveResponse.ok) {
              console.log('🚀 Image message saved to database via fallback');
              
              // Create a simple AI response
              const aiMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'influencer' as const,
                content: 'I can see your image! How can I help you with it?',
                type: 'text' as const,
                created_at: new Date().toISOString()
              };
              
              // Save AI response to database
              const aiSaveResponse = await fetch('/api/chat-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: userId,
                  influencer_id: resolvedInfluencerId,
                  conversation_id: conversationId,
                  sender: 'influencer',
                  content: aiMessage.content,
                  type: 'text'  // The API will map this to content_type
                })
              });
              
              if (aiSaveResponse.ok) {
                console.log('🚀 AI response saved to database');
              } else {
                console.error('❌ Failed to save AI response:', aiSaveResponse.status);
              }
              
              // Replace optimistic message with real response
              ChatCache.replaceOptimistic(resolvedInfluencerId, userId, tempId, userMessage, aiMessage);
              
              console.log('🚀 Fallback message sent successfully');
            } else {
              const errorText = await saveResponse.text();
              console.error('❌ Failed to save image message:', saveResponse.status, errorText);
              throw new Error(`Failed to save image message: ${saveResponse.status} - ${errorText}`);
            }
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            
            // Final fallback: just text message
            const messageContent = `${userMessageContent || ''} [${inputMediaType.toUpperCase()} file attached - ${selectedFile.name}]`;
            const result = await ChatCache.sendMessageFast(resolvedInfluencerId, messageContent, userId);
            const { userMessage, aiMessage, isFastMode, responseType } = result as any;
            
            // Update animation type based on API response
            console.log('🎭 Received response type (fallback):', responseType, 'Setting animation to:', responseType === 'audio' ? 'audio' : 'text');
            setAiResponseType(responseType === 'audio' ? 'audio' : 'text');
            
            // Replace optimistic message with real response
            ChatCache.replaceOptimistic(resolvedInfluencerId, userId, tempId, userMessage, aiMessage);
            
            console.log('🚀 Final fallback message sent successfully:', { isFastMode, responseType });
          }
          
          // Reset file selection
          resetFileSelection();
        }
      } else {
        // Regular text message
        const result = await ChatCache.sendMessageFast(resolvedInfluencerId, userMessageContent, userId);
        const { userMessage, aiMessage, isFastMode, responseType } = result as any;
        
        // Update animation type based on API response
        console.log('🎭 Received response type:', responseType, 'Setting animation to:', responseType === 'audio' ? 'audio' : 'text');
        console.log('🎭 Full result object:', result);
        console.log('🎭 AI message content preview:', aiMessage.content?.substring(0, 100));
        console.log('🎭 AI message content length:', aiMessage.content?.length);
        console.log('🎭 AI message has content:', !!aiMessage.content);
        setAiResponseType(responseType === 'audio' ? 'audio' : 'text');
        
        // Replace optimistic message with real response
        ChatCache.replaceOptimistic(resolvedInfluencerId, userId, tempId, userMessage, aiMessage);
        
        console.log('🚀 Text message sent successfully:', { isFastMode, responseType });
      }
        
    } catch (err) {
      const userFriendlyError = getUserFriendlyError(err);
      logError('Failed to send message', err);
      
      // 🚀 OPTIMISTIC UPDATE: Remove failed message from both cache and local state
      console.log('🚀 Removing failed optimistic message:', tempId);
      ChatCache.removeMessageById(resolvedInfluencerId, userId, tempId);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // Show toast notification instead of blocking error
      const errorStatus = (err as any)?.status || (err as any)?.statusCode;
      if (errorStatus === 402 || userFriendlyError.toLowerCase().includes('token')) {
        toast.error('Insufficient tokens. Please purchase more tokens to continue chatting.');
      } else {
        toast.error(userFriendlyError);
      }
    } finally {
      setIsAiReplying(false);
      setAiResponseType('text'); // Reset to default
      // Scroll to bottom after sending message and getting AI response
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  // 🚀 OPTIMIZATION: Load more messages for pagination
  const handleLoadMore = async () => {
    if (!influencer || !userId || loadingMore) return;
    
    try {
      setLoadingMore(true);
      isLoadingMoreRef.current = true; // Mark that we're loading more messages
      
      const newMessages = await ChatCache.loadMoreMessages(influencer.id, userId, 5);
      
      if (newMessages.length < 5) {
        setHasMoreMessages(false);
      }
      
      // Update messages state - prepend older messages
      setMessages(prev => [...newMessages, ...prev]);
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error('Failed to load more messages');
    } finally {
      setLoadingMore(false);
      // Reset the loading more flag after a short delay to allow for state updates
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onGoBack}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>
            <div className="w-12 h-12 rounded-full bg-secondary animate-pulse"></div>
            <div>
              <div className="w-24 h-5 bg-secondary rounded animate-pulse mb-2"></div>
              <div className="w-16 h-4 bg-secondary rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 rounded-full bg-secondary animate-pulse"></div>
            <div className="w-12 h-12 rounded-full bg-secondary animate-pulse"></div>
          </div>
        </div>
        
        {/* Messages Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* AI Message Skeleton */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-secondary animate-pulse"></div>
            <div className="flex-1">
              <div className="bg-secondary rounded-2xl p-4 max-w-xs">
                <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Message Skeleton */}
          <div className="flex items-start space-x-3 justify-end">
            <div className="flex-1 max-w-xs">
              <div className="bg-red-600 rounded-2xl p-4 ml-auto">
                <div className="space-y-2">
                  <div className="w-full h-4 bg-red-500 rounded animate-pulse"></div>
                  <div className="w-2/3 h-4 bg-red-500 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary animate-pulse"></div>
          </div>
          
          {/* AI Message Skeleton */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-secondary animate-pulse"></div>
            <div className="flex-1">
              <div className="bg-secondary rounded-2xl p-4 max-w-sm">
                <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded animate-pulse"></div>
                  <div className="w-4/5 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Input Skeleton */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-12 bg-secondary rounded-full animate-pulse"></div>
            <div className="w-12 h-12 bg-secondary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0 relative z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onGoBack}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          {influencer && (
            <>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/default_avatar.png" 
                  alt={influencer.display_name || clientInfluencer.displayName} 
                  className="w-full h-full object-cover"
                />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{influencer.display_name || clientInfluencer.displayName}</h1>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ paddingBottom: '200px' }}>
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            // Chat interface for new conversations - more focused on chatting
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-red-500 mx-auto mb-6">
                <img 
                  src="/default_avatar.png" 
                  alt={influencer?.display_name || clientInfluencer.displayName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">Chat with {influencer?.display_name || clientInfluencer.displayName}</h2>
              <p className="text-muted-foreground mb-4">
                Type your message below to start chatting!
              </p>
              <div className="text-sm text-muted-foreground">
                💬 Ready to chat
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 🚀 OPTIMIZATION: Load More Messages Button */}
            {hasMoreMessages && messages.length > 0 && (
              <div className="flex justify-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-sm text-secondary-foreground transition-colors"
                >
                  {loadingMore ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More Messages'
                  )}
                </button>
              </div>
            )}
            
            {messages
              .flatMap((message) => {
                if (message.content && message.content.includes('\n')) {
                  return message.content.split('\n').map((line: string, index: number) => ({
                    ...message,
                    id: `${message.id}-${index}`,
                    content: line,
                  }));
                }
                return message;
              })
              // 🚀 FIX: Remove duplicate messages based on unique ID
              .filter((message, index, array) => 
                array.findIndex(m => m.id === message.id) === index
              )
              .map((message, index, array) => {
                // Check if this message is from a different user than the previous one
                const previousMessage = array[index - 1];
                const isDifferentUser = previousMessage && previousMessage.sender !== message.sender;
                
                return message.content && message.content.trim() && (
                  <div
                    key={message.id}
                    className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${isDifferentUser ? 'mb-2' : ''}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-red-500 mr-3 flex-shrink-0">
                        <img 
                          src="/default_avatar.png" 
                          alt={influencer?.display_name || clientInfluencer.displayName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-2xl max-w-xs lg:max-w-md relative ${
                        message.sender === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg'
                      }`}
                    >
                      {/* Message type indicator */}
                      {message.sender === 'ai' && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          {message.type === 'image' ? (
                            <span className="text-xs">🖼️</span>
                          ) : (message.content && (message.content.startsWith('data:audio/') || message.content.startsWith('http'))) ? (
                            <span className="text-xs">🎵</span>
                          ) : (
                            <span className="text-xs">💬</span>
                          )}
                        </div>
                      )}
                      <MultimediaMessage 
                        message={message} 
                        sender={message.sender} 
                      />
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-red-500 ml-3 flex-shrink-0">
                        <img 
                          src="/profile.png" 
                          alt="User" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            }
          </>
        )}
        {isAiReplying && (
          <div className="flex items-end">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 mr-3">
              <img 
                src="/default_avatar.png" 
                alt={influencer?.display_name || clientInfluencer.displayName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 rounded-2xl max-w-xs lg:max-w-md bg-secondary text-secondary-foreground">
              {aiResponseType === 'audio' ? (
                /* Audio Generation Animation */
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.4s]"></div>
                    <div className="w-1 h-5 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.2s]"></div>
                    <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.1s]"></div>
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse [animation-delay:0s]"></div>
                    <div className="w-1 h-7 bg-blue-500 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                    <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-1 h-5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.3s]"></div>
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-blue-400 font-medium">🎵 Generating audio...</span>
                    <span className="text-xs text-muted-foreground">Creating voice response</span>
                  </div>
                </div>
              ) : (
                /* Text Typing Animation */
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-background relative z-50">
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            {/* File Selection Display */}
            {selectedFile && (
              <div className="mb-3 flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div className="flex items-center space-x-2">
                  {inputMediaType === 'image' ? (
                    <Image className="w-4 h-4 text-primary" />
                  ) : (
                    <Mic className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm text-foreground">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({inputMediaType.toUpperCase()})
                  </span>
                </div>
                <button
                  onClick={resetFileSelection}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            )}

            {/* Audio Recorder */}
            {isRecording && (
              <AudioRecorder
                onAudioRecorded={handleAudioRecorded}
                onCancel={handleCancelRecording}
              />
            )}

            {!isRecording && (
              <div className="flex items-center space-x-3">
                {/* File Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <Upload className="h-5 w-5" />
                </button>

                {/* Voice Recording Button */}
                <button
                  onClick={() => setIsRecording(true)}
                  className="p-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <Mic className="h-5 w-5" />
                </button>

                <Input
                type="text"
                placeholder={selectedFile ? `Add message to ${inputMediaType}...` : "Type a message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="flex-1 p-4 rounded-2xl bg-input border border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base md:text-sm"
              />
                <button 
                  onClick={handleSendMessage} 
                  className="p-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                  style={{ backgroundColor: 'hsl(0 84% 60%)', color: 'hsl(0 0% 100%)' }}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/60" onClick={() => setShowFeatureModal(false)} />
          <div className="relative bg-card text-card-foreground rounded-2xl p-6 max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Feature coming soon</h3>
            <p className="text-sm text-muted-foreground">{featureMessage}</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowFeatureModal(false)} 
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                style={{ backgroundColor: 'hsl(0 84% 60%)', color: 'hsl(0 0% 100%)' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80" onClick={() => setShowProfileModal(false)} />
          <div className="relative bg-card text-card-foreground rounded-2xl p-6 max-w-lg mx-4 border border-border">
            <div className="text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-red-500 mx-auto mb-4">
                <img 
                  src="/default_avatar.png" 
                  alt={influencer?.display_name || clientInfluencer.displayName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                {influencer?.display_name || clientInfluencer.displayName}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">AI Assistant</p>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                style={{ backgroundColor: 'hsl(0 84% 60%)', color: 'hsl(0 0% 100%)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatThread;