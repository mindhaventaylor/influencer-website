import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Phone, MessageCircle, Settings, User } from 'lucide-react';
import { getClientInfluencerInfo } from '@/lib/clientConfig';

interface ChatListProps {
  onViewChat: (influencerId: string) => void;
  onGoToSettings: () => void;
  onGoToProfile: () => void;
}

const ChatList = ({ onViewChat, onGoToSettings, onGoToProfile }: ChatListProps) => {
  const [influencer, setInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');

  const clientInfluencer = getClientInfluencerInfo();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        
        // Get current influencer via API
        const response = await fetch('/api/influencer/current');
        if (!response.ok) {
          throw new Error('Failed to fetch influencer');
        }
        const currentInfluencer = await response.json();
        
        if (mounted) {
          setInfluencer(currentInfluencer);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Unknown error');
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2 text-red-400">Error</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!influencer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">No influencer found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500">
            <img 
              src={influencer.avatar_url || clientInfluencer.avatarUrl} 
              alt={influencer.display_name || clientInfluencer.displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{influencer.display_name || clientInfluencer.displayName}</h1>
            <p className="text-sm text-gray-400">
              {influencer.is_active ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setFeatureMessage('Video calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Video className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => { setFeatureMessage('Voice calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Phone className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
        <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-red-500 shadow-2xl">
          <img 
            src={influencer.avatar_url || clientInfluencer.avatarUrl} 
            alt={influencer.display_name || clientInfluencer.displayName}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 text-white">{influencer.display_name || clientInfluencer.displayName}</h2>
          <p className="text-gray-400 text-lg">
            {influencer.is_active ? 'Ready to chat' : 'Currently unavailable'}
          </p>
        </div>
        
        <Button 
          className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 text-lg font-semibold shadow-lg transition-all duration-200"
          onClick={() => onViewChat(influencer.id)}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Start Chat
        </Button>

        {/* Quick Actions */}
        <div className="flex space-x-4 w-full max-w-xs">
          <Button
            variant="outline"
            className="flex-1 p-3 rounded-xl border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={onGoToProfile}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button
            variant="outline"
            className="flex-1 p-3 rounded-xl border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={onGoToSettings}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
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

export default ChatList;