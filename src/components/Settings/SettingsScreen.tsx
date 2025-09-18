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
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
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
          setDataSharingConsent(preferences.data_sharing_consent);
          setPersonalizationConsent(preferences.personalization_consent);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Fallback to localStorage
        const savedDataSharing = localStorage.getItem('dataSharingConsent');
        const savedPersonalization = localStorage.getItem('personalizationConsent');
        
        if (savedDataSharing !== null) setDataSharingConsent(JSON.parse(savedDataSharing));
        if (savedPersonalization !== null) setPersonalizationConsent(JSON.parse(savedPersonalization));
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Save preferences when they change
  const savePreferences = async (preferences: {
    dataSharingConsent: boolean;
    personalizationConsent: boolean;
  }) => {
    if (!user?.id) return;
    
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          preferences: {
            darkMode: theme === 'dark',
            dataSharingConsent: preferences.dataSharingConsent,
            personalizationConsent: preferences.personalizationConsent,
          },
        }),
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Fallback to localStorage
      localStorage.setItem('dataSharingConsent', JSON.stringify(preferences.dataSharingConsent));
      localStorage.setItem('personalizationConsent', JSON.stringify(preferences.personalizationConsent));
    }
  };

  useEffect(() => {
    if (user?.id) {
      savePreferences({
        dataSharingConsent,
        personalizationConsent,
      });
    }
  }, [theme, dataSharingConsent, personalizationConsent, user?.id]);

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="flex items-center px-6 py-4 bg-card">
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="p-2 rounded-xl text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-medium ml-4 text-card-foreground">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="max-w-md mx-auto lg:max-w-2xl">
          {/* Preferences Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-foreground">Preferences</h2>
            
            <div className="space-y-4">
              {/* Chat History */}
              <div className="flex items-center justify-between py-3">
                <span className="text-foreground">Chat History</span>
                <Button
                  onClick={handleDeleteChatHistory}
                  disabled={isDeletingChatHistory}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground"
                >
                  {isDeletingChatHistory ? 'Deleting...' : 'Delete'}
                </Button>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between py-3">
                <span className="text-foreground">Theme</span>
                <ThemeToggle size="sm" />
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-muted-foreground">Support</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleContactUs}
                className="flex items-center justify-between py-3 w-full hover:bg-secondary rounded-xl transition-colors"
              >
                <span className="text-foreground">Contact Us</span>
                <ExternalLink className="w-5 h-5" text-muted-foreground />
              </button>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4" text-muted-foreground>Privacy</h2>
            
            <div className="space-y-6">
              {/* Data Sharing Consent */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm" text-muted-foreground>
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
                    <p className="text-sm" text-muted-foreground>
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
            <h2 className="text-lg font-bold mb-4" text-muted-foreground>Legal</h2>
            
            <div className="space-y-4">
              <button
                onClick={onGoToTermsAndConditions}
                className="flex items-center justify-between py-3 w-full hover:bg-secondary rounded-xl transition-colors"
              >
                <span text-muted-foreground>Terms of Service</span>
                <ExternalLink className="w-5 h-5" text-muted-foreground />
              </button>

              <button
                onClick={onGoToPrivacyPolicy}
                className="flex items-center justify-between py-3 w-full hover:bg-secondary rounded-xl transition-colors"
              >
                <span text-muted-foreground>Privacy Policy</span>
                <ExternalLink className="w-5 h-5" text-muted-foreground />
              </button>

              <button
                onClick={onGoToDisclaimer}
                className="flex items-center justify-between py-3 w-full hover:bg-secondary rounded-xl transition-colors"
              >
                <span text-muted-foreground>Disclaimer</span>
                <ExternalLink className="w-5 h-5" text-muted-foreground />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsScreen;