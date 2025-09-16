import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Video, Phone, ChevronLeft } from 'lucide-react';
import MessageFormatter from '@/components/ui/MessageFormatter';
import ChatCache from '@/lib/chatCache';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { logError } from '@/lib/errorLogger';

const ChatThread = ({ onGoBack, influencerId, userToken, userId }) => {
  const [messages, setMessages] = useState([]);
  const [influencer, setInfluencer] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      if (!influencerId || !userId) return;
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
          const resolvedInfluencerId = influencerIdData.id;
          
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
        if (mounted) setError(err.message);
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
    scrollToBottom();
  }, [messages, isAiReplying]);

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
      const { userMessage, aiMessage } = await ChatCache.sendMessage(resolvedInfluencerId, userMessageContent, userId);
      ChatCache.replaceOptimistic(resolvedInfluencerId, userId, tempId, userMessage, aiMessage);
    } catch (err) {
      const userFriendlyError = getUserFriendlyError(err);
      setError(userFriendlyError);
      ChatCache.removeMessageById(resolvedInfluencerId, userId, tempId);
      alert(`Failed to send message: ${userFriendlyError}`);
    } finally {
      setIsAiReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background text-foreground">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-background text-destructive">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onGoBack} 
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {influencer && (
            <>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <img 
                  src={influencer.avatar_url || '/default_avatar.png'} 
                  alt={influencer.display_name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{influencer.display_name}</h1>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setFeatureMessage('Video calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            onClick={() => { setFeatureMessage('Voice calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Phone className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {messages.length === 0 ? (
          // Welcome message for new conversations
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <img 
                  src={influencer?.avatar_url || '/default_avatar.png'} 
                  alt={influencer?.display_name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to {influencer?.display_name}!</h2>
              <p className="text-muted-foreground mb-4">
                Start a conversation by typing a message below. I'm here to chat with you!
              </p>
              <div className="text-sm text-muted-foreground">
                💬 Send your first message to begin
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
                    className={`p-3 rounded-xl max-w-xs lg:max-w-md ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-3">
              <img 
                src={influencer?.avatar_url || '/default_avatar.png'} 
                alt={influencer?.display_name} 
                className="w-6 h-6 rounded-full object-cover"
              />
            </div>
            <div className="p-3 rounded-xl max-w-xs lg:max-w-md bg-secondary text-secondary-foreground">
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
      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-20 left-0 right-0 p-4 border-t border-border bg-card z-30">
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
            className="flex-1 p-4 rounded-xl bg-input border border-border text-foreground placeholder-muted-foreground"
          />
          <Button 
            onClick={handleSendMessage} 
            className="p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {showFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowFeatureModal(false)} />
          <div role="dialog" aria-modal="true" className="relative bg-card text-card-foreground rounded-xl p-6 max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">Feature coming soon</h3>
            <p className="text-sm text-muted-foreground">{featureMessage}</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowFeatureModal(false)} 
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
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


