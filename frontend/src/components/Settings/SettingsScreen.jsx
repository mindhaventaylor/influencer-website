import React from 'react';
import { Button } from '@/components/ui/button';

const SettingsScreen = ({ onGoToChat, onSignOut }) => {
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="flex items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Settings</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Manage Subscription</span>
            <span>&rarr;</span>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Delete Account</span>
            <span>&rarr;</span>
          </div>
          <Button onClick={onSignOut} className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Log Out
          </Button>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Preferences</h2>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Notifications</span>
            <span>&rarr;</span>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Chat History</span>
            <span>&rarr;</span>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Display Settings</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Support</h2>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Help & FAQs</span>
            <span>&rarr;</span>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Contact Us</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Legal</h2>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Terms of Service</span>
            <span>&rarr;</span>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span>Privacy Policy</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>
      <footer className="flex justify-around p-4 border-t border-gray-800">
        <button className="flex flex-col items-center text-gray-500" onClick={onGoToChat}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-circle-more"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            <path d="M8 12h.01" />
            <path d="M12 12h.01" />
            <path d="M16 12h.01" />
          </svg>
          <span className="text-xs">Chat</span>
        </button>
        <button className="flex flex-col items-center text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-settings"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.74v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.28a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-xs">Settings</span>
        </button>
      </footer>
    </div>
  );
};

export default SettingsScreen;


