'use client';

import { useState, useEffect, useRef } from 'react';
import SignIn from '@/components/Auth/SignIn';
import SignUp from '@/components/Auth/SignUp';
import OnboardingProfile from '@/components/Auth/OnboardingProfile';
import ChatList from '@/components/Chat/ChatList';
import ChatThread from '@/components/Chat/ChatThread';
import SettingsScreen from '@/components/Settings/SettingsScreen';
import ProfileScreen from '@/components/Settings/ProfileScreen';
import DeleteAccountScreen from '@/components/Settings/DeleteAccountScreen';
import DisclaimerScreen from '@/components/Settings/DisclaimerScreen';
import PrivacyPolicyScreen from '@/components/Settings/PrivacyPolicyScreen';
import TermsAndConditionsScreen from '@/components/Settings/TermsAndConditionsScreen';
import MobileNavigation from '@/components/ui/MobileNavigation';
import MobileCallScreen from '@/components/ui/MobileCallScreen';
import { supabase } from '@/lib/supabaseClient';
import api from '@/api';

interface User {
  id: string;
  email: string;
  token: string;
}

interface ProfileData {
  username: string;
  display_name: string;
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState("SignIn"); // Start with login page
  const [user, setUser] = useState<User | null>(null);
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [callState, setCallState] = useState<{ isActive: boolean; type: 'voice' | 'video' | null }>({
    isActive: false,
    type: null
  });
  const currentScreenRef = useRef(currentScreen);
  const conversationCreatedRef = useRef<Set<string>>(new Set());

  // Update ref when currentScreen changes
  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  // Function to create conversation for user automatically
  const createConversationForUser = async (userId: string) => {
    // Prevent duplicate conversation creation attempts
    if (conversationCreatedRef.current.has(userId)) {
      console.log('⏭️ Conversation already created for user:', userId);
      return null;
    }

    try {
      console.log('🔄 Creating conversation for user:', userId);
      conversationCreatedRef.current.add(userId);
      const result = await api.createConversationForUser(userId);
      console.log('✅ Conversation created successfully for user:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to create conversation for user:', error);
      // Remove from set on error so we can retry later
      conversationCreatedRef.current.delete(userId);
      // Don't throw here - conversation creation failure shouldn't break login
      return null;
    }
  };

  useEffect(() => {
    const getSession = async () => {
      console.log('Getting session, current screen:', currentScreenRef.current);
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session result:', session ? 'authenticated' : 'not authenticated');
      if (session) {
        setUser({ id: session.user.id, email: session.user.email!, token: session.access_token });
        
        // Create conversation for existing session (user already logged in)
        console.log('Existing session found, creating conversation automatically...');
        await createConversationForUser(session.user.id);
        
        // Only redirect to ChatList if we're on SignIn screen
        if (currentScreenRef.current === "SignIn") {
          console.log('Redirecting to ChatList from SignIn');
          setCurrentScreen("ChatList");
        }
      } else {
        setUser(null);
        // Only redirect to SignIn if we're not in the middle of signup process
        if (currentScreenRef.current !== "SignUp" && currentScreenRef.current !== "OnboardingProfile") {
          console.log('Redirecting to SignIn, current screen:', currentScreenRef.current);
          setCurrentScreen("SignIn");
        }
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, 'session:', session ? 'authenticated' : 'not authenticated');
      
      if (session) {
        setUser({ id: session.user.id, email: session.user.email!, token: session.access_token });
        
        // Automatically create conversation for user on login
        if (event === 'SIGNED_IN') {
          console.log('🔄 User signed in, creating conversation automatically...');
          await createConversationForUser(session.user.id);
        }
        
        // Only redirect to ChatList if we're on SignIn screen
        if (currentScreenRef.current === "SignIn") {
          console.log('🔄 Auth state change: Redirecting to ChatList from SignIn');
          setCurrentScreen("ChatList");
        }
      } else {
        // User is signed out
        console.log('🔄 User signed out, clearing state...');
        setUser(null);
        
        // Clear conversation tracking
        conversationCreatedRef.current.clear();
        console.log('🧹 Cleared all conversation tracking');
        
        // Only redirect to SignIn if we're not in the middle of signup process
        if (currentScreenRef.current !== "SignUp" && currentScreenRef.current !== "OnboardingProfile") {
          console.log('🔄 Auth state change: Redirecting to SignIn, current screen:', currentScreenRef.current);
          setCurrentScreen("SignIn");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array - only run once on mount

  const handleSignInSuccess = (userData: User) => {
    setUser(userData);
    setCurrentScreen("ChatList");
  };

  const handleSignUpSuccess = (userData: User) => {
    setUser(userData);
    setCurrentScreen("ChatList"); // Go to chat list after successful sign up
  };

  const handleOnboardingNext = (data: ProfileData) => {
    setProfileData(data);
    setCurrentScreen("SignUp");
  };
  
  const handleViewChat = (id: string) => {
    if (!user || !user.token) {
      console.error('User not authenticated, redirecting to sign in');
      setCurrentScreen("SignIn");
      return;
    }
    setInfluencerId(id);
    setCurrentScreen("ChatThread");
  };

  const handleGoToSettings = () => {
    if (!user || !user.token) {
      console.error('User not authenticated, redirecting to sign in');
      setCurrentScreen("SignIn");
      return;
    }
    setCurrentScreen("SettingsScreen");
  };

  const handleGoToProfile = () => {
    if (!user || !user.token) {
      console.error('User not authenticated, redirecting to sign in');
      setCurrentScreen("SignIn");
      return;
    }
    setCurrentScreen("ProfileScreen");
  };

  const handleGoToDeleteAccount = () => {
    setCurrentScreen("DeleteAccountScreen");
  };

  const handleGoToDisclaimer = () => {
    setCurrentScreen("DisclaimerScreen");
  };

  const handleGoToPrivacyPolicy = () => {
    setCurrentScreen("PrivacyPolicyScreen");
  };

  const handleGoToTermsAndConditions = () => {
    setCurrentScreen("TermsAndConditionsScreen");
  };

  const handleGoToChat = () => {
    setCurrentScreen("ChatList");
  };

  const handleSignOut = async () => {
    try {
      console.log('🔄 Signing out user...');
      await supabase.auth.signOut();
      console.log('✅ User signed out successfully');
      
      // Clear user state
      setUser(null);
      
      // Clear conversation tracking for this user
      if (user) {
        conversationCreatedRef.current.delete(user.id);
        console.log('🧹 Cleared conversation tracking for user:', user.id);
      }
      
      // Redirect to sign in
      setCurrentScreen("SignIn");
      console.log('🔄 Redirected to SignIn screen');
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      // Still clear local state even if signOut fails
      setUser(null);
      setCurrentScreen("SignIn");
    }
  };

  const handleGoBack = () => {
    if (currentScreen === "SignUp") {
      setCurrentScreen("SignIn");
    } else if (currentScreen === "ChatThread" || currentScreen === "SettingsScreen" || currentScreen === "ProfileScreen") {
      setCurrentScreen("ChatList");
    } else if (currentScreen === "DeleteAccountScreen") {
      setCurrentScreen("ProfileScreen");
    } else if (currentScreen === "DisclaimerScreen" || currentScreen === "PrivacyPolicyScreen" || currentScreen === "TermsAndConditionsScreen") {
      setCurrentScreen("SettingsScreen");
    } else {
        setCurrentScreen("SignIn");
    }
  };

  // Call handlers
  const handleCall = (type: 'voice' | 'video') => {
    setCallState({ isActive: true, type });
  };

  const handleEndCall = () => {
    setCallState({ isActive: false, type: null });
  };

  const handleResumeChat = () => {
    setCallState({ isActive: false, type: null });
    setCurrentScreen("ChatThread");
  };

  let screenComponent;
  switch (currentScreen) {
    case "SignIn":
      screenComponent = <SignIn onSignInSuccess={handleSignInSuccess} onGoToSignUp={() => setCurrentScreen("OnboardingProfile")} />;
      break;
    case "SignUp":
      screenComponent = <SignUp onSignUpSuccess={handleSignUpSuccess} onGoBack={handleGoBack} profileData={profileData} />;
      break;
    case "OnboardingProfile":
      screenComponent = <OnboardingProfile onNext={handleOnboardingNext} onGoBack={() => setCurrentScreen("SignIn")} />;
      break;
    case "ChatList":
      screenComponent = <ChatList onViewChat={handleViewChat} onGoToSettings={handleGoToSettings} onGoToProfile={handleGoToProfile} />;
      break;
    case "ChatThread":
      screenComponent = <ChatThread onGoBack={handleGoBack} influencerId={influencerId} userToken={user?.token} userId={user?.id} />;
      break;
    case "SettingsScreen":
      screenComponent = <SettingsScreen onGoBack={handleGoBack} onGoToChat={handleGoToChat} onGoToProfile={handleGoToProfile} onSignOut={handleSignOut} onGoToDisclaimer={handleGoToDisclaimer} onGoToPrivacyPolicy={handleGoToPrivacyPolicy} onGoToTermsAndConditions={handleGoToTermsAndConditions} />;
      break;
    case "ProfileScreen":
      screenComponent = <ProfileScreen onGoToChat={handleGoToChat} onGoToSettings={handleGoToSettings} onGoToDeleteAccount={handleGoToDeleteAccount} />;
      break;
    case "DeleteAccountScreen":
      screenComponent = <DeleteAccountScreen onGoBack={handleGoBack} onGoToChat={handleGoToChat} onGoToSettings={handleGoToSettings} onGoToProfile={handleGoToProfile} />;
      break;
    case "DisclaimerScreen":
      screenComponent = <DisclaimerScreen onGoBack={handleGoBack} onGoToPrivacyPolicy={handleGoToPrivacyPolicy} onGoToTermsAndConditions={handleGoToTermsAndConditions} />;
      break;
    case "PrivacyPolicyScreen":
      screenComponent = <PrivacyPolicyScreen onGoBack={handleGoBack} />;
      break;
    case "TermsAndConditionsScreen":
      screenComponent = <TermsAndConditionsScreen onGoBack={handleGoBack} onGoToPrivacyPolicy={handleGoToPrivacyPolicy} />;
      break;
    default:
      screenComponent = <SignIn onSignInSuccess={handleSignInSuccess} onGoToSignUp={() => setCurrentScreen("OnboardingProfile")} />;
  }

  return (
    <div className="App h-screen-mobile overflow-hidden bg-background">
      {/* Call Screen Overlay */}
      {callState.isActive && callState.type && (
        <MobileCallScreen
          callType={callState.type}
          onEndCall={handleEndCall}
          onResumeChat={handleResumeChat}
        />
      )}
      
      {/* Main App Content */}
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          {screenComponent}
        </div>
        
        {/* Mobile Navigation - only show when authenticated */}
        {user && !callState.isActive && (
          <MobileNavigation
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
            onCall={handleCall}
          />
        )}
      </div>
    </div>
  );
}
