import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import MessageFormatter from '@/components/ui/MessageFormatter';
import api from '../../api';

const ChatThread = ({ onGoBack, influencerId, userToken, userId }) => {
  const [messages, setMessages] = useState([]);
  const [influencer, setInfluencer] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: messagesData, error: messagesError }, { data: influencerData, error: influencerError }] = await Promise.all([
          api.getChatThread(influencerId, userId),
          api.getInfluencerById(influencerId)
        ]);
        if (messagesError) throw messagesError;
        if (influencerError) throw influencerError;
        setMessages(messagesData);
        setInfluencer(influencerData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (influencerId && userId) {
      fetchData();
    }
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
    setMessages(prevMessages => [...prevMessages, optimisticUserMessage]);
    setIsAiReplying(true);

    try {
      const aiMessage = await api.postMessage(influencerId, userMessageContent, userToken);
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (err) {
      setError(err.message);
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setIsAiReplying(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Loading messages...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="flex items-center p-4 border-b border-gray-800">
        <Button variant="ghost" onClick={onGoBack} className="text-white mr-2">
          &larr;
        </Button>
        {influencer && (
          <>
            <img src={influencer.avatar_url || '/path/to/default_avatar.png'} alt={influencer.display_name} className="w-10 h-10 rounded-full mr-4" />
            <h1 className="text-xl font-bold">{influencer.display_name}</h1>
          </>
        )}
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
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
      <footer className="p-4 border-t border-gray-800">
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
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 mr-2"
          />
          <Button onClick={handleSendMessage} className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ChatThread;


