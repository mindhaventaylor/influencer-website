import React, { useState, useEffect } from 'react';
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
import { ExternalLink, ArrowLeft, Trash2, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SettingsScreenProps {
  onGoToChat: () => void;
  onGoToProfile: () => void;
  onSignOut: () => void;
  onGoToDisclaimer: () => void;
  onGoToPrivacyPolicy: () => void;
  onGoToTermsAndConditions: () => void;
  onGoBack: () => void;
}

const SettingsScreen = ({ 
  onGoToChat, 
  onGoToProfile, 
  onSignOut, 
  onGoToDisclaimer, 
  onGoToPrivacyPolicy, 
  onGoToTermsAndConditions,
  onGoBack
}: SettingsScreenProps) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [dataSharingConsent, setDataSharingConsent] = useState(false);
  const [personalizationConsent, setPersonalizationConsent] = useState(false);
  const [isDeletingChatHistory, setIsDeletingChatHistory] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/user/preferences?userId=${user.id}`);
        if (response.ok) {
          const { preferences } = await response.json();
          setDarkMode(preferences.dark_mode);
          setDataSharingConsent(preferences.data_sharing_consent);
          setPersonalizationConsent(preferences.personalization_consent);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Fallback to localStorage
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedDataSharing = localStorage.getItem('dataSharingConsent');
        const savedPersonalization = localStorage.getItem('personalizationConsent');
        
        if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
        if (savedDataSharing !== null) setDataSharingConsent(JSON.parse(savedDataSharing));
        if (savedPersonalization !== null) setPersonalizationConsent(JSON.parse(savedPersonalization));
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Save preferences when they change
  const savePreferences = async (preferences: any) => {
    if (!user?.id) return;
    
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          preferences,
        }),
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Fallback to localStorage
      localStorage.setItem('darkMode', JSON.stringify(preferences.darkMode));
      localStorage.setItem('dataSharingConsent', JSON.stringify(preferences.dataSharingConsent));
      localStorage.setItem('personalizationConsent', JSON.stringify(preferences.personalizationConsent));
    }
  };

  useEffect(() => {
    if (user?.id) {
      savePreferences({
        darkMode,
        dataSharingConsent,
        personalizationConsent,
      });
    }
  }, [darkMode, dataSharingConsent, personalizationConsent, user?.id]);

  const handleDeleteChatHistory = async () => {
    setIsDeletingChatHistory(true);
    try {
      const response = await fetch('/api/chat/delete-history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        alert('Chat history deleted successfully');
      } else {
        alert('Failed to delete chat history');
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
      alert('An error occurred while deleting chat history');
    } finally {
      setIsDeletingChatHistory(false);
    }
  };

  const handleContactUs = () => {
    // Open email client or contact form
    window.open('mailto:support@projecttaylor.com?subject=Support Request', '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#0F0F10' }}>
      {/* Top Navigation */}
      <div className="flex items-center px-6 py-4" style={{ backgroundColor: '#1B1B1D' }}>
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="p-2 rounded-xl"
          style={{ color: '#EDEDED' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-medium ml-4" style={{ color: '#EDEDED' }}>Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="max-w-md mx-auto lg:max-w-2xl">
          {/* Preferences Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#EDEDED' }}>Preferences</h2>
            
            <div className="space-y-4">
              {/* Chat History */}
              <div className="flex items-center justify-between py-3">
                <span style={{ color: '#EDEDED' }}>Chat History</span>
                <Button
                  onClick={handleDeleteChatHistory}
                  disabled={isDeletingChatHistory}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: '#2C2C2E', 
                    color: '#EDEDED',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {isDeletingChatHistory ? 'Deleting...' : 'Delete'}
                </Button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between py-3">
                <span style={{ color: '#EDEDED' }}>Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-red-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      darkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#EDEDED' }}>Support</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleContactUs}
                className="flex items-center justify-between py-3 w-full hover:bg-gray-800 rounded-xl transition-colors"
              >
                <span style={{ color: '#EDEDED' }}>Contact Us</span>
                <ExternalLink className="w-5 h-5" style={{ color: '#EDEDED' }} />
              </button>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#EDEDED' }}>Privacy</h2>
            
            <div className="space-y-6">
              {/* Data Sharing Consent */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm" style={{ color: '#A6A6AA' }}>
                      I consent to Project Taylor selling or sharing my personal information with third-party partners for advertising or similar purposes.
                    </p>
                  </div>
                  <button
                    onClick={() => setDataSharingConsent(!dataSharingConsent)}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                      dataSharingConsent ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        dataSharingConsent ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Personalization Consent */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm" style={{ color: '#A6A6AA' }}>
                      I consent to Project Taylor processing my information to personalize my experience and improve its AI models.
                    </p>
                  </div>
                  <button
                    onClick={() => setPersonalizationConsent(!personalizationConsent)}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                      personalizationConsent ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        personalizationConsent ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#EDEDED' }}>Legal</h2>
            
            <div className="space-y-4">
              <button
                onClick={onGoToTermsAndConditions}
                className="flex items-center justify-between py-3 w-full hover:bg-gray-800 rounded-xl transition-colors"
              >
                <span style={{ color: '#EDEDED' }}>Terms of Service</span>
                <ExternalLink className="w-5 h-5" style={{ color: '#EDEDED' }} />
              </button>

              <button
                onClick={onGoToPrivacyPolicy}
                className="flex items-center justify-between py-3 w-full hover:bg-gray-800 rounded-xl transition-colors"
              >
                <span style={{ color: '#EDEDED' }}>Privacy Policy</span>
                <ExternalLink className="w-5 h-5" style={{ color: '#EDEDED' }} />
              </button>

              <button
                onClick={onGoToDisclaimer}
                className="flex items-center justify-between py-3 w-full hover:bg-gray-800 rounded-xl transition-colors"
              >
                <span style={{ color: '#EDEDED' }}>Disclaimer</span>
                <ExternalLink className="w-5 h-5" style={{ color: '#EDEDED' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsScreen;