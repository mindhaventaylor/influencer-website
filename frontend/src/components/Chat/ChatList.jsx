import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import api from '../../api';

const ChatList = ({ onViewChat, onGoToSettings }) => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setLoading(true);
        const { data, error } = await api.getInfluencers();
        if (error) throw error;
        setInfluencers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencers();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Loading influencers...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Chats</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        {influencers.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">No influencers found.</div>
        ) : (
          influencers.map((influencer) => (
            <div
              key={influencer.id}
              className="flex items-center p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-900"
              onClick={() => onViewChat(influencer.id)}
            >
              <img src={influencer.avatar_url || '/path/to/default_avatar.png'}
                alt={influencer.display_name} className="w-12 h-12 rounded-full mr-4" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">{influencer.display_name}</h2>
                </div>
                <p className="text-gray-400 text-sm truncate">{influencer.bio}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <footer className="flex justify-around p-4 border-t border-gray-800">
        <button className="flex flex-col items-center text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-circle-more"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            <path d="M8 12h.01" />
            <path d="M12 12h.01" />
            <path d="M16 12h.01" />
          </svg>
          <span className="text-xs">Chat</span>
        </button>
        <button className="flex flex-col items-center text-gray-500" onClick={onGoToSettings}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-settings"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.74v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.28a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-xs">Settings</span>
        </button>
      </footer>
    </div>
  );
};

export default ChatList;


