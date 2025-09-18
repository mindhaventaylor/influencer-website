import React from 'react';
import { MessageCircle, Settings, User } from 'lucide-react';

interface BottomNavigationProps {
  currentScreen?: string;
  onGoToChat?: () => void;
  onGoToSettings?: () => void;
  onGoToProfile?: () => void;
}

const BottomNavigation = ({ 
  currentScreen, 
  onGoToChat, 
  onGoToSettings, 
  onGoToProfile 
}: BottomNavigationProps) => {
  return (
    <footer className="flex justify-around px-6 pt-4 pb-7 border-t border-gray-800 bg-gray-900" style={{ paddingBottom: 'calc(1.75rem + env(safe-area-inset-bottom))' }}>
      <button 
        className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
          currentScreen === 'chat' 
            ? 'text-red-500 bg-red-500/10' 
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
        }`}
        onClick={onGoToChat}
      >
        <MessageCircle className={`h-6 w-6 ${currentScreen === 'chat' ? 'text-red-500' : ''}`} />
        <span className="text-xs font-medium">Chat</span>
      </button>
      
      <button 
        className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
          currentScreen === 'profile' 
            ? 'text-red-500 bg-red-500/10' 
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
        }`}
        onClick={onGoToProfile}
      >
        <User className={`h-6 w-6 ${currentScreen === 'profile' ? 'text-red-500' : ''}`} />
        <span className="text-xs font-medium">Profile</span>
      </button>
      
      <button 
        className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
          currentScreen === 'settings' 
            ? 'text-red-500 bg-red-500/10' 
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
        }`}
        onClick={onGoToSettings}
      >
        <Settings className={`h-6 w-6 ${currentScreen === 'settings' ? 'text-red-500' : ''}`} />
        <span className="text-xs font-medium">Settings</span>
      </button>
    </footer>
  );
};

export default BottomNavigation;