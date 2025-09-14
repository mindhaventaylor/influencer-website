'use client';

import { Phone, Video, ArrowLeft } from 'lucide-react';
import { getInfluencerInfo } from '@/lib/config';

interface MobileChatHeaderProps {
  onBack?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  showCallButtons?: boolean;
}

export default function MobileChatHeader({ 
  onBack, 
  onVoiceCall, 
  onVideoCall, 
  showCallButtons = true 
}: MobileChatHeaderProps) {
  const influencer = getInfluencerInfo();

  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <img
              src={influencer.avatarUrl}
              alt={influencer.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {influencer.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      {showCallButtons && (
        <div className="flex items-center space-x-2">
          <button
            onClick={onVoiceCall}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={onVideoCall}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
