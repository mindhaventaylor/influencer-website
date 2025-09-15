'use client';

import { useState } from 'react';
import { Home, MessageCircle, User, Settings, Phone, Video } from 'lucide-react';

interface MobileNavigationProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  onCall: (type: 'voice' | 'video') => void;
}

export default function MobileNavigation({ 
  currentScreen, 
  onScreenChange, 
  onCall 
}: MobileNavigationProps) {
  const [showCallOptions, setShowCallOptions] = useState(false);

  const navigationItems = [
    { id: 'ChatList', icon: Home, label: 'Home' },
    { id: 'ChatThread', icon: MessageCircle, label: 'Chat' },
    { id: 'ProfileScreen', icon: User, label: 'Profile' },
    { id: 'SettingsScreen', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Call Options Modal */}
      {showCallOptions && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-card rounded-2xl p-6 mx-4 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-center mb-6">Call Options</h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  onCall('voice');
                  setShowCallOptions(false);
                }}
                className="w-full flex items-center justify-center space-x-3 bg-primary text-primary-foreground rounded-xl py-4 px-6 hover:bg-primary/90 transition-colors"
              >
                <Phone className="w-6 h-6" />
                <span className="text-lg font-medium">Voice Call</span>
              </button>
              <button
                onClick={() => {
                  onCall('video');
                  setShowCallOptions(false);
                }}
                className="w-full flex items-center justify-center space-x-3 bg-primary text-primary-foreground rounded-xl py-4 px-6 hover:bg-primary/90 transition-colors"
              >
                <Video className="w-6 h-6" />
                <span className="text-lg font-medium">Video Call</span>
              </button>
              <button
                onClick={() => setShowCallOptions(false)}
                className="w-full bg-secondary text-secondary-foreground rounded-xl py-3 px-6 hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onScreenChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* Call Button */}
          <button
            onClick={() => setShowCallOptions(true)}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-primary hover:text-primary/80 transition-colors"
          >
            <Phone className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Call</span>
          </button>
        </div>
      </div>
    </>
  );
}

