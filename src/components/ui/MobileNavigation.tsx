'use client';

import { useState } from 'react';
import { Home, MessageCircle, User, Settings, Phone, Video } from 'lucide-react';

interface MobileNavigationProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  onCall: (type: 'voice' | 'video') => void;
  onGoToChat: () => void;
}

export default function MobileNavigation({ 
  currentScreen, 
  onScreenChange, 
  onCall,
  onGoToChat
}: MobileNavigationProps) {
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [constructionMessage, setConstructionMessage] = useState('');

  const navigationItems = [
    { id: 'ChatList', icon: Home, label: 'Home', key: 'nav-home' },
    { id: 'ProfileScreen', icon: User, label: 'Profile', key: 'nav-profile' },
    { id: 'SettingsScreen', icon: Settings, label: 'Settings', key: 'nav-settings' },
  ];

  return (
    <>
      {/* Call Options Modal */}
      {showCallOptions && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center">
          <div className="bg-card rounded-2xl p-6 mx-4 w-full max-w-sm border border-border">
            <h3 className="text-lg font-semibold text-center mb-6 text-card-foreground">Call Options</h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setConstructionMessage('Voice calling is under construction — we\'re working on it!');
                  setShowUnderConstruction(true);
                  setShowCallOptions(false);
                }}
                className="w-full flex items-center justify-center space-x-3 bg-primary text-primary-foreground rounded-xl py-4 px-6 hover:bg-primary/90 transition-colors"
                style={{ backgroundColor: 'hsl(0 84% 60%)', color: 'hsl(0 0% 100%)' }}
              >
                <Phone className="w-6 h-6" />
                <span className="text-lg font-medium">Voice Call</span>
              </button>
              <button
                onClick={() => {
                  setConstructionMessage('Video calling is under construction — we\'re working on it!');
                  setShowUnderConstruction(true);
                  setShowCallOptions(false);
                }}
                className="w-full flex items-center justify-center space-x-3 bg-primary text-primary-foreground rounded-xl py-4 px-6 hover:bg-primary/90 transition-colors"
                style={{ backgroundColor: 'hsl(0 84% 60%)', color: 'hsl(0 0% 100%)' }}
              >
                <Video className="w-6 h-6" />
                <span className="text-lg font-medium">Video Call</span>
              </button>
              <button
                onClick={() => setShowCallOptions(false)}
                className="w-full bg-secondary text-secondary-foreground rounded-xl py-3 px-6 hover:bg-secondary/80 transition-colors"
                style={{ backgroundColor: 'hsl(0 0% 90%)', color: 'hsl(0 0% 0%)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Under Construction Modal */}
      {showUnderConstruction && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center">
          <div className="relative bg-card text-card-foreground rounded-2xl p-6 max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Under Construction</h3>
            <p className="text-sm text-muted-foreground mb-4">{constructionMessage}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowUnderConstruction(false)} 
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
              >
                OK
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
                key={item.key}
                onClick={() => item.onClick ? item.onClick() : onScreenChange(item.id)}
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
        </div>
      </div>
    </>
  );
}

