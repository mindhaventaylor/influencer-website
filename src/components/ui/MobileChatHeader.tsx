'use client';

import { Phone, Video, ArrowLeft } from 'lucide-react';
import { getClientInfluencerInfo } from '@/lib/clientConfig';

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
  const influencer = getClientInfluencerInfo();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center space-x-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img 
            src={influencer.avatarUrl} 
            alt={influencer.displayName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-white font-medium">{influencer.displayName}</h2>
          <p className="text-gray-400 text-sm">Online</p>
        </div>
      </div>

      {showCallButtons && (
        <div className="flex items-center space-x-2">
          {onVoiceCall && (
            <button
              onClick={onVoiceCall}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <Phone size={20} />
            </button>
          )}
          {onVideoCall && (
            <button
              onClick={onVideoCall}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <Video size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}