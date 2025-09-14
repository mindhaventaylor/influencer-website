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
import { supabase } from '@/lib/supabaseClient';

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
  const currentScreenRef = useRef(currentScreen);

  // Update ref when currentScreen changes
  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    const getSession = async () => {
      console.log('Getting session, current screen:', currentScreenRef.current);
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session result:', session ? 'authenticated' : 'not authenticated');
      if (session) {
        setUser({ id: session.user.id, email: session.user.email!, token: session.access_token });
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, 'session:', session ? 'authenticated' : 'not authenticated');
      if (session) {
        setUser({ id: session.user.id, email: session.user.email!, token: session.access_token });
        // Only redirect to ChatList if we're on SignIn screen
        if (currentScreenRef.current === "SignIn") {
          console.log('Auth state change: Redirecting to ChatList from SignIn');
          setCurrentScreen("ChatList");
        }
      } else {
        setUser(null);
        // Only redirect to SignIn if we're not in the middle of signup process
        if (currentScreenRef.current !== "SignUp" && currentScreenRef.current !== "OnboardingProfile") {
          console.log('Auth state change: Redirecting to SignIn, current screen:', currentScreenRef.current);
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
    await supabase.auth.signOut();
    setUser(null);
    setCurrentScreen("SignIn");
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
    <div className="App h-screen-mobile overflow-hidden">
      {screenComponent}
    </div>
  );
}
