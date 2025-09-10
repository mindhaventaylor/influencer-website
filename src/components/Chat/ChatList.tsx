import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Phone } from 'lucide-react';
import ChatCache from '@/lib/chatCache';
import BottomNavigation from '@/components/ui/BottomNavigation';

const ChatList = ({ onViewChat, onGoToSettings, onGoToProfile }) => {
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        const cached = ChatCache.peekInfluencers();
        if (cached && cached.length > 0) {
          if (!mounted) return;
          setInfluencer(cached[0]);
          setLoading(false);
          return;
        }
        const list = await ChatCache.getInfluencers();
        if (!mounted) return;
        if (list && list.length > 0) {
          setInfluencer(list[0]);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen-mobile bg-black text-white">Loading influencers...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen-mobile bg-black text-red-500">Error: {error}</div>;
  }
  
  if (!influencer) {
    return <div className="flex items-center justify-center h-screen-mobile bg-black text-white">No influencer found.</div>;
  }

  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      <header className="flex items-center justify-center py-2 px-3" style={{ backgroundColor: '#212121' }}>
        <h1 className="text-xl font-bold">Chat</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-1 space-y-4">
        <img 
          src={influencer.avatar_url || '/path/to/default_avatar.png'} 
          alt={influencer.display_name} 
          className="w-full max-w-[16rem] rounded-2xl aspect-[3/4] object-cover"
        />
        <div className="text-center">
          <h2 className="text-2xl font-bold">{influencer.display_name}</h2>
        </div>
        <Button 
          className="w-full max-w-[16rem] bg-[#2C2C2E] hover:bg-gray-700 rounded-full py-4 text-lg text-white"
          onClick={() => onViewChat(influencer.id)}
        >
          Start Chat
        </Button>
        <div className="flex justify-center space-x-12">
          <button
            aria-label="Start video call"
            onClick={() => { setFeatureMessage('Video calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="focus:outline-none"
          >
            <Video className="h-9 w-9 text-white" />
          </button>
          <button
            aria-label="Start voice call"
            onClick={() => { setFeatureMessage('Voice calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="focus:outline-none"
          >
            <Phone className="h-7.5 w-7.5 text-white" />
          </button>
        </div>
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
      <BottomNavigation 
        currentScreen="chat" 
        onGoToChat={() => {}} 
        onGoToSettings={onGoToSettings}
        onGoToProfile={onGoToProfile}
      />
    </div>
  );
};

export default ChatList;