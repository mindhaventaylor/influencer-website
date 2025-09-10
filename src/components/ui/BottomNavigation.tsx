import React from 'react';
import { MessageCircle, Settings, User } from 'lucide-react';

const BottomNavigation = ({ currentScreen, onGoToChat, onGoToSettings, onGoToProfile }) => {
  return (
    <footer className="flex justify-around px-4 pt-4 pb-7 border-t border-gray-800" style={{ backgroundColor: '#212121', paddingBottom: 'calc(1.75rem + env(safe-area-inset-bottom))' }}>
      <button 
        className={`flex flex-col items-center ${currentScreen === 'chat' ? 'text-red-600' : 'text-gray-500'}`}
        onClick={onGoToChat}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="text-xs">Chat</span>
      </button>
      <button 
        className={`flex flex-col items-center ${currentScreen === 'profile' ? 'text-red-600' : 'text-gray-500'}`}
        onClick={onGoToProfile}
      >
        <User className="h-6 w-6" />
        <span className="text-xs">Profile</span>
      </button>
      <button 
        className={`flex flex-col items-center ${currentScreen === 'settings' ? 'text-red-600' : 'text-gray-500'}`}
        onClick={onGoToSettings}
      >
        <Settings className="h-6 w-6" />
        <span className="text-xs">Settings</span>
      </button>
    </footer>
  );
};

export default BottomNavigation;
