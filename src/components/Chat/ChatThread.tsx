import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Video, Phone, ChevronLeft } from 'lucide-react';
import MessageFormatter from '@/components/ui/MessageFormatter';
import ChatCache from '@/lib/chatCache';

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
        // influencer
        const influencerCached = await ChatCache.getInfluencerById(influencerId);
        if (mounted) setInfluencer(influencerCached);

        // messages: use cache first
        const cachedMsgs = ChatCache.peekThread(influencerId, userId);
        if (cachedMsgs) {
          if (mounted) setMessages(cachedMsgs);
          setLoading(false);
        }
        const msgs = await ChatCache.getThread(influencerId, userId);
        if (mounted) setMessages(msgs);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    // subscribe to cache updates so optimistic updates reflect across navigations
    const unsubscribe = ChatCache.subscribeThread(influencerId, userId, (msgs) => {
      if (mounted) setMessages(msgs);
    });

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

    const tempId = Date.now();
    const optimisticUserMessage = { id: tempId, sender: 'user', content: userMessageContent, created_at: new Date().toISOString() };
    ChatCache.appendToThread(influencerId, userId, optimisticUserMessage);
    setIsAiReplying(true);

    try {
      const { userMessage, aiMessage } = await ChatCache.sendMessage(influencerId, userMessageContent, userId);
      ChatCache.replaceOptimistic(influencerId, userId, tempId, userMessage, aiMessage);
    } catch (err) {
      setError(err.message);
      ChatCache.removeMessageById(influencerId, userId, tempId);
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setIsAiReplying(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen-mobile bg-black text-white">Loading messages...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen-mobile bg-black text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      <header className="flex items-center justify-between pr-4 pl-2 py-4 border-b border-gray-800" style={{ backgroundColor: '#212121' }}>
        <div className="flex items-center">
          <button aria-label="Back" onClick={onGoBack} className="text-white mr-2 p-1">
            <ChevronLeft className="h-7 w-7" />
          </button>
          {influencer && (
            <>
              <img src={influencer.avatar_url || '/path/to/default_avatar.png'} alt={influencer.display_name} className="w-10 h-10 rounded-full mr-3" />
              <h1 className="text-xl font-bold">{influencer.display_name}</h1>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            aria-label="Start video call"
            onClick={() => { setFeatureMessage('Video calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="focus:outline-none"
          >
            <Video className="h-6 w-6 text-white" />
          </button>
          <button
            aria-label="Start voice call"
            onClick={() => { setFeatureMessage('Voice calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="focus:outline-none"
          >
            <Phone className="h-6 w-6 text-white" />
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                <MessageFormatter content={message.content} />
              </div>
            </div>
          )
        ))}
        {isAiReplying && (
          <div className="flex items-end">
            <img src={influencer?.avatar_url || '/path/to/default_avatar.png'} alt={influencer?.display_name} className="w-10 h-10 rounded-full mr-4" />
            <div className="p-3 rounded-lg max-w-xs lg:max-w-md bg-gray-800 text-white">
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
      <footer className="p-4 border-t border-gray-800" style={{ backgroundColor: '#212121', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
          />
          <Button onClick={handleSendMessage} className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </footer>
      {showFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowFeatureModal(false)} />
          <div role="dialog" aria-modal="true" className="relative bg-[#121212] text-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Feature coming soon</h3>
            <p className="text-sm text-gray-300">{featureMessage}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowFeatureModal(false)} className="px-4 py-2 rounded-full bg-[#2C2C2E] hover:bg-gray-700">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatThread;


