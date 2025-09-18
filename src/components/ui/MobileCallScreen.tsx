'use client';

import { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, Volume2, VolumeX, Video, VideoOff, PhoneOff, MessageCircle } from 'lucide-react';
import { getClientInfluencerInfo } from '@/lib/clientConfig';

interface MobileCallScreenProps {
  callType: 'voice' | 'video';
  onEndCall: () => void;
  onResumeChat: () => void;
}

export default function MobileCallScreen({ callType, onEndCall, onResumeChat }: MobileCallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
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
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      {/* Video/Audio Area */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black">
        {callType === 'video' ? (
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Main video feed */}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-red-500 shadow-2xl">
                  <img 
                    src={influencer.avatarUrl} 
                    alt={influencer.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-white">{influencer.displayName}</h2>
                <p className="text-xl text-gray-400 mb-1">{formatDuration(callDuration)}</p>
                <p className="text-sm text-gray-500">Video Call</p>
              </div>
            </div>
            
            {/* Self-view (small video in corner) */}
            <div className="absolute top-6 right-6 w-24 h-32 bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-600">
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-gray-300 text-sm">You</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden border-4 border-red-500 shadow-2xl bg-gray-800 flex items-center justify-center">
                <img 
                  src={influencer.avatarUrl} 
                  alt={influencer.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-3xl font-bold mb-2 text-white">{influencer.displayName}</h2>
              <p className="text-xl text-gray-400 mb-1">{formatDuration(callDuration)}</p>
              <p className="text-sm text-gray-500">Voice Call</p>
              
              {/* Audio waveform animation */}
              <div className="flex items-center justify-center space-x-1 mt-6">
                <div className="w-1 h-8 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-12 bg-red-500 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-1 h-10 bg-red-500 rounded-full animate-pulse [animation-delay:0.3s]"></div>
                <div className="w-1 h-8 bg-red-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                <div className="w-1 h-14 bg-red-500 rounded-full animate-pulse [animation-delay:0.5s]"></div>
                <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse [animation-delay:0.6s]"></div>
                <div className="w-1 h-10 bg-red-500 rounded-full animate-pulse [animation-delay:0.7s]"></div>
                <div className="w-1 h-8 bg-red-500 rounded-full animate-pulse [animation-delay:0.8s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-center space-x-6 mb-6">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all duration-200 ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-all duration-200 ${
              isSpeakerOn 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isSpeakerOn ? <Volume2 size={24} className="text-white" /> : <VolumeX size={24} className="text-white" />}
          </button>

          {/* Video Button (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-all duration-200 ${
                isVideoOn 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isVideoOn ? <Video size={24} className="text-white" /> : <VideoOff size={24} className="text-white" />}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg"
          >
            <PhoneOff size={24} className="text-white" />
          </button>
        </div>

        {/* Resume Chat Button */}
        <button
          onClick={onResumeChat}
          className="w-full py-4 px-6 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all duration-200 border border-gray-700 flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Resume Chat</span>
        </button>
      </div>
    </div>
  );
}