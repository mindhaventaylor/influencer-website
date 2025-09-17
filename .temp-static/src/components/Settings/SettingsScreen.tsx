import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExternalLink } from 'lucide-react';
import BottomNavigation from '@/components/ui/BottomNavigation';

const SettingsScreen = ({ onGoToChat, onGoToProfile, onSignOut, onGoToDisclaimer, onGoToPrivacyPolicy, onGoToTermsAndConditions }) => {

  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      <header className="flex items-center p-4 border-b border-gray-800" style={{ backgroundColor: '#212121' }}>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-white mb-6">Legal</h2>
        <div className="space-y-5">
          <button onClick={onGoToTermsAndConditions} className="flex justify-between items-center text-white w-full">
            <span className="text-lg">Terms of Service</span>
            <ExternalLink className="h-6 w-6" />
          </button>
          <button onClick={onGoToPrivacyPolicy} className="flex justify-between items-center text-white w-full">
            <span className="text-lg">Privacy Policy</span>
            <ExternalLink className="h-6 w-6" />
          </button>
          <button onClick={onGoToDisclaimer} className="flex justify-between items-center text-white w-full">
            <span className="text-lg">Disclaimer</span>
            <ExternalLink className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700">Log Out</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be signed out of your account and redirected to the login screen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSignOut} className="bg-red-600 hover:bg-red-700">Log Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <BottomNavigation 
        currentScreen="settings" 
        onGoToChat={onGoToChat} 
        onGoToSettings={() => {}}
        onGoToProfile={onGoToProfile}
      />
    </div>
  );
};

export default SettingsScreen;