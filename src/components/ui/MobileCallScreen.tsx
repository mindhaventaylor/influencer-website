'use client';

import { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, Volume2, VolumeX, Video, VideoOff, PhoneOff } from 'lucide-react';
import { getInfluencerInfo } from '@/lib/config';

interface MobileCallScreenProps {
  callType: 'voice' | 'video';
  onEndCall: () => void;
  onResumeChat: () => void;
}

export default function MobileCallScreen({ 
  callType, 
  onEndCall, 
  onResumeChat 
}: MobileCallScreenProps) {
  const influencer = getInfluencerInfo();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Main Video/Audio Area */}
      <div className="flex-1 relative">
        {callType === 'video' ? (
          <>
            {/* Main video feed */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20">
              <img
                src={influencer.avatarUrl}
                alt={influencer.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* User's video feed */}
            <div className="absolute top-4 right-4 w-24 h-32 bg-card rounded-lg overflow-hidden border-2 border-primary">
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">You</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Voice call - show influencer image */
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary">
                <img
                  src={influencer.avatarUrl}
                  alt={influencer.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {influencer.displayName}
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                {callType === 'voice' ? 'Voice Call' : 'Video Call'}
              </p>
              <div className="text-sm text-gray-400">
                {formatTime(callDuration)}
              </div>
            </div>
          </div>
        )}

        {/* Call Status */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="text-white">
            <div className="text-sm text-gray-300">
              {callType === 'voice' ? 'Voice Call' : 'Video Call'}
            </div>
            <div className="text-lg font-semibold">
              {formatTime(callDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bg-card/90 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center space-x-6 mb-6">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-colors ${
              isSpeakerOn ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-colors ${
                isVideoOn ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        {/* Resume Chat Button */}
        <button
          onClick={onResumeChat}
          className="w-full bg-primary text-primary-foreground rounded-xl py-3 px-6 font-medium hover:bg-primary/90 transition-colors"
        >
          Resume Chat
        </button>
      </div>
    </div>
  );
}

