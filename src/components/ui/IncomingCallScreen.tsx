'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { getClientInfluencerInfo } from '@/lib/clientConfig';

interface IncomingCallScreenProps {
  callType: 'voice' | 'video';
  callerName?: string;
  onAcceptCall: () => void;
  onDeclineCall: () => void;
}

export default function IncomingCallScreen({ 
  callType, 
  callerName, 
  onAcceptCall, 
  onDeclineCall 
}: IncomingCallScreenProps) {
  const [callDuration, setCallDuration] = useState(0);
  const influencer = getClientInfluencerInfo();

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Background with gradient */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-red-500/5 rounded-full animate-pulse [animation-delay:1s]"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-red-500/15 rounded-full animate-pulse [animation-delay:2s]"></div>
        </div>

        {/* Main content */}
        <div className="text-center z-10">
          {/* Caller avatar */}
          <div className="w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden border-4 border-red-500 shadow-2xl animate-pulse">
            <img 
              src={influencer.avatarUrl} 
              alt={callerName || influencer.displayName}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Caller info */}
          <h2 className="text-3xl font-bold mb-2 text-white">{callerName || influencer.displayName}</h2>
          <p className="text-xl text-gray-400 mb-1">
            {callType === 'video' ? 'Incoming video call' : 'Incoming voice call'}
          </p>
          <p className="text-lg text-gray-500">{formatDuration(callDuration)}</p>
        </div>
      </div>

      {/* Call controls */}
      <div className="p-8 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-center space-x-8">
          {/* Decline button */}
          <button
            onClick={onDeclineCall}
            className="p-6 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg"
          >
            <PhoneOff size={32} className="text-white" />
          </button>

          {/* Accept button */}
          <button
            onClick={onAcceptCall}
            className="p-6 rounded-full bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-lg"
          >
            {callType === 'video' ? (
              <Video size={32} className="text-white" />
            ) : (
              <Phone size={32} className="text-white" />
            )}
          </button>
        </div>
        
        {/* Call type indicator */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            {callType === 'video' ? 'Tap to accept video call' : 'Tap to accept voice call'}
          </p>
        </div>
      </div>
    </div>
  );
}
