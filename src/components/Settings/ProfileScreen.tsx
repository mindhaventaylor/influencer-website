import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, ChevronRight } from 'lucide-react';
import BottomNavigation from '@/components/ui/BottomNavigation';

const ProfileScreen = ({ onGoToChat, onGoToSettings, onGoToDeleteAccount }) => {
  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      <header className="flex items-center justify-center py-4 px-4" style={{ backgroundColor: '#212121' }}>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-4 px-6">
          <div className="relative mb-3">
            <img 
              src="/default_avatar.png" 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover"
            />
            <button className="absolute bottom-1 right-1 bg-black bg-opacity-60 p-1.5 rounded-full">
              <Edit className="h-4 w-4 text-white" />
            </button>
          </div>
          
          <h2 className="text-xl font-bold mb-1">John Smith</h2>
          <p className="text-gray-400 mb-4 text-sm">Premium Member</p>
          
          {/* Premium Section */}
          <div className="w-full max-w-sm bg-gray-900 rounded-xl p-4 mb-4">
            <h3 className="text-lg font-bold mb-3 text-center">TaylorAI Plus</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Unlimited Chats</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Unlimited Calls</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Unlimited Images</span>
              </div>
            </div>
            
            <div className="text-center mb-3">
              <span className="text-lg font-bold">$4.99 / Month</span>
            </div>
            
            <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-full py-2 text-sm">
              Upgrade Now
            </Button>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="px-6 space-y-4">
          <button className="flex items-center justify-between w-full text-left">
            <span className="text-lg text-white">Email & Password</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          
          <button className="flex items-center justify-between w-full text-left">
            <span className="text-lg text-white">Manage Subscription</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={onGoToDeleteAccount}
          >
            <span className="text-lg text-white">Delete Account</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <BottomNavigation 
        currentScreen="profile" 
        onGoToChat={onGoToChat} 
        onGoToSettings={onGoToSettings}
        onGoToProfile={() => {}}
      />
    </div>
  );
};

export default ProfileScreen;
