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
import { ExternalLink, ChevronRight, Bell, Shield, HelpCircle, LogOut, User, MessageCircle } from 'lucide-react';
import BottomNavigation from '@/components/ui/BottomNavigation';

interface SettingsScreenProps {
  onGoToChat: () => void;
  onGoToProfile: () => void;
  onSignOut: () => void;
  onGoToDisclaimer: () => void;
  onGoToPrivacyPolicy: () => void;
  onGoToTermsAndConditions: () => void;
}

const SettingsScreen = ({ 
  onGoToChat, 
  onGoToProfile, 
  onSignOut, 
  onGoToDisclaimer, 
  onGoToPrivacyPolicy, 
  onGoToTermsAndConditions 
}: SettingsScreenProps) => {

  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      {/* Header */}
      <header className="flex items-center p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={onGoToChat} 
              className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <span className="text-white">Chat</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button 
              onClick={onGoToProfile} 
              className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-white">Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* App Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">App Settings</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="text-white">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-white">Privacy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <span className="text-white">Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Legal</h2>
          <div className="space-y-3">
            <button 
              onClick={onGoToTermsAndConditions} 
              className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-5 h-5 text-gray-400" />
                <span className="text-white">Terms of Service</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button 
              onClick={onGoToPrivacyPolicy} 
              className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-5 h-5 text-gray-400" />
                <span className="text-white">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button 
              onClick={onGoToDisclaimer} 
              className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-5 h-5 text-gray-400" />
                <span className="text-white">Disclaimer</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Out Button */}
      <div className="p-6 border-t border-gray-800">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                You will be signed out of your account and redirected to the login screen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={onSignOut}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default SettingsScreen;