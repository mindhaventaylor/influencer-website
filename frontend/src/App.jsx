import { useState, useEffect } from 'react';
import './App.css';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import OnboardingProfile from './components/Auth/OnboardingProfile';
import ChatList from './components/Chat/ChatList';
import ChatThread from './components/Chat/ChatThread';
import SettingsScreen from './components/Settings/SettingsScreen';
import { supabase } from './lib/supabaseClient';

function App() {
  const [currentScreen, setCurrentScreen] = useState("OnboardingProfile"); // Initial screen changed
  const [user, setUser] = useState(null);
  const [influencerId, setInfluencerId] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({ email: session.user.email, token: session.access_token });
        // Don't automatically navigate to ChatList here if we are in the middle of onboarding
        if (currentScreen !== "SignUp") {
            setCurrentScreen("ChatList");
        }
      } else {
        setUser(null);
        setCurrentScreen("SignIn");
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({ email: session.user.email, token: session.access_token });
        // Don't automatically navigate to ChatList here if we are in the middle of onboarding
        if (currentScreen !== "SignUp") {
            setCurrentScreen("ChatList");
        }
      } else {
        setUser(null);
        setCurrentScreen("SignIn");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignInSuccess = (userData) => {
    setUser(userData);
    setCurrentScreen("ChatList");
  };

  const handleSignUpSuccess = (userData) => {
    setUser(userData);
    setCurrentScreen("ChatList"); // Go to chat list after successful sign up
  };

  const handleOnboardingNext = (data) => {
    setProfileData(data);
    setCurrentScreen("SignUp");
  };
  
  const handleViewChat = (id) => {
    setInfluencerId(id);
    setCurrentScreen("ChatThread");
  };

  const handleGoToSettings = () => {
    setCurrentScreen("SettingsScreen");
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
      setCurrentScreen("OnboardingProfile");
    } else if (currentScreen === "ChatThread" || currentScreen === "SettingsScreen") {
      setCurrentScreen("ChatList");
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
      screenComponent = <OnboardingProfile onNext={handleOnboardingNext} />;
      break;
    case "ChatList":
      screenComponent = <ChatList onViewChat={handleViewChat} onGoToSettings={handleGoToSettings} />;
      break;
    case "ChatThread":
      screenComponent = <ChatThread onGoBack={handleGoBack} influencerId={influencerId} userToken={user?.token} />;
      break;
    case "SettingsScreen":
      screenComponent = <SettingsScreen onGoBack={handleGoBack} onGoToChat={handleGoToChat} onSignOut={handleSignOut} />;
      break;
    default:
      screenComponent = <SignIn onSignInSuccess={handleSignInSuccess} onGoToSignUp={() => setCurrentScreen("OnboardingProfile")} />;
  }

  return (
    <div className="App">
      {screenComponent}
    </div>
  );
}

export default App;