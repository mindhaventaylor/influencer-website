import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Video, Phone, ChevronLeft, MessageCircle } from 'lucide-react';
import MessageFormatter from '@/components/ui/MessageFormatter';
import ChatCache from '@/lib/chatCache';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { logError } from '@/lib/errorLogger';
import { InfluencerCache } from '@/lib/influencerCache';
import { toast } from 'sonner';
import { getClientInfluencerInfo } from '@/lib/clientConfig';

interface ChatThreadProps {
  onGoBack: () => void;
  influencerId?: string;
  userToken?: string;
  userId?: string;
}

const ChatThread = ({ onGoBack, influencerId, userToken, userId }: ChatThreadProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [influencer, setInfluencer] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOptimisticUpdateRef = useRef(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const isInitialLoadRef = useRef(true);
  const isLoadingMoreRef = useRef(false);

  const clientInfluencer = getClientInfluencerInfo();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
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
          // Use the resolved influencer ID (database UUID) for chat messages
          // If no influencerId was passed, use the current influencer
          const resolvedInfluencerId = influencerId || influencerIdData.id;
          
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
        
        if (resolvedInfluencerId) {
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
    if (newMessage.trim() === '') return;

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

    const tempId = Date.now();
    const optimisticUserMessage = { 
      id: tempId, 
      sender: 'user', 
      content: userMessageContent, 
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

    try {
      // 🚀 FAST MODE: Get AI response immediately, save in background
      console.log('🚀 Using FAST MODE for better user experience');
      const { userMessage, aiMessage, isFastMode } = await ChatCache.sendMessageFast(resolvedInfluencerId, userMessageContent, userId);
      
      // Replace optimistic message with real response immediately
      ChatCache.replaceOptimistic(resolvedInfluencerId, userId, tempId, userMessage, aiMessage);
      
      if (isFastMode) {
        console.log('🚀 Fast mode successful - AI response shown immediately, saving in background');
      }
    } catch (err) {
      const userFriendlyError = getUserFriendlyError(err);
      logError('Failed to send message (fast mode)', err);
      
      // 🚀 OPTIMISTIC UPDATE: Remove failed message from both cache and local state
      console.log('🚀 Removing failed optimistic message:', tempId);
      ChatCache.removeMessageById(resolvedInfluencerId, userId, tempId);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // Debug: Log error structure to help troubleshoot
      console.log('🔍 Error structure:', {
        error: err,
        status: (err as any)?.status,
        statusCode: (err as any)?.statusCode,
        message: (err as any)?.message,
        userFriendlyError
      });
      
      // Show toast notification instead of blocking error
      // Check for 402 Payment Required status or token-related messages
      const errorStatus = (err as any)?.status || (err as any)?.statusCode;
      if (errorStatus === 402 || userFriendlyError.toLowerCase().includes('token')) {
        toast.error('Insufficient tokens. Please purchase more tokens to continue chatting.');
      } else {
        toast.error(userFriendlyError);
      }
    } finally {
      setIsAiReplying(false);
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
                  src={influencer.avatar_url || clientInfluencer.avatarUrl} 
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
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { 
              console.log('🎥 Video button clicked');
              setFeatureMessage('Video calling is coming soon — we\'re working on it!'); 
              setShowFeatureModal(true); 
            }}
            className="p-4 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Video className="h-6 w-6 text-muted-foreground" />
          </button>
          <button
            onClick={() => { setFeatureMessage('Voice calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-4 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Phone className="h-6 w-6 text-muted-foreground" />
          </button>
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
                  src={influencer?.avatar_url || clientInfluencer.avatarUrl} 
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
                  return message.content.split('\n').map((line, index) => ({
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
                    <div
                      className={`p-4 rounded-2xl max-w-xs lg:max-w-md ${
                        message.sender === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      <MessageFormatter content={message.content} />
                    </div>
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
                src={influencer?.avatar_url || clientInfluencer.avatarUrl} 
                alt={influencer?.display_name || clientInfluencer.displayName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 rounded-2xl max-w-xs lg:max-w-md bg-secondary text-secondary-foreground">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
              </div>
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
            <div className="flex items-center space-x-3">
            <Input
              type="text"
              placeholder="Type a message..."
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
          </div>
        </div>
      </div>

      {/* Chat Bottom Navigation - Hidden on desktop */}
      <div className="flex-shrink-0 border-t border-border bg-background xl:hidden relative z-30">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={onGoBack}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Back</span>
          </button>
          
          <button
            onClick={() => { setFeatureMessage('Voice calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
          >
            <Phone className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Call</span>
          </button>
          
          <button
            onClick={() => { setFeatureMessage('Video calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
          >
            <Video className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Video</span>
          </button>
          
          <button
            onClick={() => { setFeatureMessage('More chat features are coming soon!'); setShowFeatureModal(true); }}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">More</span>
          </button>
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
                  src={influencer?.avatar_url || clientInfluencer.avatarUrl} 
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