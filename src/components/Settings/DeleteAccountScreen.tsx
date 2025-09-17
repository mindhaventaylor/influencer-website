import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft } from 'lucide-react';
import BottomNavigation from '@/components/ui/BottomNavigation';

const DeleteAccountScreen = ({ onGoBack, onGoToChat, onGoToSettings, onGoToProfile }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');

  const handleDeleteAccount = () => {
    // For now, just show an alert - no API call
    alert('Account deletion request submitted (UI only)');
  };

  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      <header className="flex items-center p-4" style={{ backgroundColor: '#212121' }}>
        <Button variant="ghost" onClick={onGoBack} className="text-white p-0 mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Delete Account</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-8">Account Deletion Request</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-white text-lg mb-3">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-800 border-none text-white placeholder-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-white text-lg mb-3">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-800 border-none text-white placeholder-gray-500"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-800 border-none text-white placeholder-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-white text-lg mb-3">Why are you deleting your account?</label>
            <Textarea
              placeholder="Type here"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-800 border-none text-white placeholder-gray-500 min-h-[120px] resize-none"
            />
          </div>
        </div>
      </div>
      
      <div className="p-6 pb-8">
        <Button 
          onClick={handleDeleteAccount}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-lg"
        >
          Delete Account
        </Button>
      </div>
      
      <BottomNavigation 
        currentScreen="profile" 
        onGoToChat={onGoToChat} 
        onGoToSettings={onGoToSettings}
        onGoToProfile={onGoToProfile}
      />
    </div>
  );
};

export default DeleteAccountScreen;
