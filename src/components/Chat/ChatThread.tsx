import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Video, Phone, ChevronLeft, MessageCircle } from 'lucide-react';
import MessageFormatter from '@/components/ui/MessageFormatter';
import ChatCache from '@/lib/chatCache';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { logError } from '@/lib/errorLogger';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');

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
        
        // Get influencer via API (uses database UUID)
        const influencerResponse = await fetch('/api/influencer/current');
        const influencerIdResponse = await fetch('/api/influencer/id');
        
        if (influencerResponse.ok && influencerIdResponse.ok) {
          const influencerData = await influencerResponse.json();
          const influencerIdData = await influencerIdResponse.json();
          
          if (mounted) setInfluencer(influencerData);
          
          // Use the resolved influencer ID (database UUID) for chat messages
          // If no influencerId was passed, use the current influencer
          const resolvedInfluencerId = influencerId || influencerIdData.id;
          
          // messages: use cache first
          const cachedMsgs = ChatCache.peekThread(resolvedInfluencerId, userId);
          if (cachedMsgs) {
            if (mounted) setMessages(cachedMsgs);
            setLoading(false);
          }
          const msgs = await ChatCache.getThread(resolvedInfluencerId, userId);
          if (mounted) setMessages(msgs);
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
    
    const setupSubscription = async () => {
      const influencerIdResponse = await fetch('/api/influencer/id');
      if (influencerIdResponse.ok) {
        const influencerIdData = await influencerIdResponse.json();
        const resolvedInfluencerId = influencerIdData.id;
        unsubscribe = ChatCache.subscribeThread(resolvedInfluencerId, userId, (msgs) => {
          if (mounted) setMessages(msgs);
        });
      }
    };
    
    setupSubscription();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [influencerId, userId]);

  useEffect(() => {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages, isAiReplying]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
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
    const optimisticUserMessage = { id: tempId, sender: 'user', content: userMessageContent, created_at: new Date().toISOString() };
    ChatCache.appendToThread(resolvedInfluencerId, userId, optimisticUserMessage);
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
      ChatCache.removeMessageById(resolvedInfluencerId, userId, tempId);
      
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
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen-mobile bg-black text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onGoBack}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          {influencer && (
            <>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500">
                <img 
                  src={influencer.avatar_url || clientInfluencer.avatarUrl} 
                  alt={influencer.display_name || clientInfluencer.displayName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{influencer.display_name || clientInfluencer.displayName}</h1>
                <p className="text-sm text-gray-400">Online</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setFeatureMessage('Video calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Video className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => { setFeatureMessage('Voice calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Phone className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ paddingBottom: '120px' }}>
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
              <h2 className="text-2xl font-semibold mb-2 text-white">Chat with {influencer?.display_name || clientInfluencer.displayName}</h2>
              <p className="text-gray-400 mb-4">
                Type your message below to start chatting!
              </p>
              <div className="text-sm text-gray-500">
                💬 Ready to chat
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.flatMap((message) => {
              if (message.content && message.content.includes('\n')) {
                return message.content.split('\n').map((line, index) => ({
                  ...message,
                  id: `${message.id}-${index}`,
                  content: line,
                }));
              }
              return message;
            }).map((message) => (
              message.content && message.content.trim() && (
                <div
                  key={message.id}
                  className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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
              )
            ))}
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
            <div className="p-4 rounded-2xl max-w-xs lg:max-w-md bg-gray-800 text-white">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-black">
        <div className="p-6">
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
              className="flex-1 p-4 rounded-2xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
            />
            <Button 
              onClick={handleSendMessage} 
              className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Bottom Navigation */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-black">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={onGoBack}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-gray-400 hover:text-white transition-colors"
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
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowFeatureModal(false)} />
          <div className="relative bg-gray-900 text-white rounded-2xl p-6 max-w-sm mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-white">Feature coming soon</h3>
            <p className="text-sm text-gray-400">{featureMessage}</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowFeatureModal(false)} 
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatThread;