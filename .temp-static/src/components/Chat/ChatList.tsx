import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Phone } from 'lucide-react';

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
    return (
      <div className="flex items-center justify-center h-full bg-background text-foreground">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
  
  if (!influencer) {
    return (
      <div className="flex items-center justify-center h-full bg-background text-foreground">
        <div className="text-center">
          <p className="text-lg font-semibold">No influencer found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">{influencer.display_name}</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setFeatureMessage('Video calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setFeatureMessage('Voice calling is coming soon — we\'re working on it!'); setShowFeatureModal(true); }}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-6">
        <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary">
          <img 
            src={influencer.avatar_url || '/default_avatar.png'} 
            alt={influencer.display_name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{influencer.display_name}</h2>
          <p className="text-muted-foreground">
            {influencer.is_active ? 'Ready to chat' : 'Currently unavailable'}
          </p>
        </div>
        
        <Button 
          className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-4 text-lg font-semibold"
          onClick={() => onViewChat(influencer.id)}
        >
          Start Chat
        </Button>
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
    </div>
  );
};

export default ChatList;