import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Phone, MessageCircle, Settings, User } from 'lucide-react';
import { getClientInfluencerInfo } from '@/lib/clientConfig';
import { InfluencerCache } from '@/lib/influencerCache';

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
        
        // 🚀 OPTIMIZATION: Check cache first for instant loading
        const cachedData = InfluencerCache.get();
        if (cachedData) {
          console.log('🚀 Using cached influencer data for ChatList');
          if (mounted) {
            setInfluencer(cachedData.influencer);
            setLoading(false); // Stop loading immediately for cached data
          }
        } else {
          // 🚀 OPTIMIZATION: Show client config data immediately as fallback
          if (mounted) {
            setInfluencer({
              id: clientInfluencer.id,
              display_name: clientInfluencer.displayName,
              avatar_url: clientInfluencer.avatarUrl,
              bio: clientInfluencer.bio,
              is_active: true
            });
            setLoading(false); // Stop loading to show fallback data
          }
        }
        
        // Fetch fresh data in background
        try {
          const response = await fetch('/api/influencer/current');
          if (response.ok) {
            const currentInfluencer = await response.json();
            if (mounted) {
              setInfluencer(currentInfluencer);
              // Cache the fresh data
              InfluencerCache.set(currentInfluencer, { id: currentInfluencer.id });
            }
          }
        } catch (fetchError) {
          console.warn('Failed to fetch fresh influencer data:', fetchError);
          // Keep using cached or fallback data
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
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
            <div>
              <div className="w-32 h-6 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
            <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
          {/* Large Avatar Skeleton */}
          <div className="w-48 h-48 rounded-3xl bg-gray-700 animate-pulse"></div>
          
          {/* Title and Status Skeleton */}
          <div className="text-center space-y-4">
            <div className="w-48 h-8 bg-gray-700 rounded animate-pulse mx-auto"></div>
            <div className="w-32 h-6 bg-gray-700 rounded animate-pulse mx-auto"></div>
          </div>
          
          {/* Start Chat Button Skeleton */}
          <div className="w-full max-w-xs h-14 bg-gray-700 rounded-2xl animate-pulse"></div>

          {/* Quick Actions Skeleton */}
          <div className="flex space-x-4 w-full max-w-xs">
            <div className="flex-1 h-12 bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="flex-1 h-12 bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2 text-red-400">Error</p>
          <p className="text-sm text-gray-400">{typeof error === 'string' ? error : error.message || 'An error occurred'}</p>
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
              loading="lazy"
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
            loading="lazy"
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