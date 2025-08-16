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
  const [currentScreen, setCurrentScreen] = useState("SignIn"); // Initial screen
  const [user, setUser] = useState(null);
  const [influencerId, setInfluencerId] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({ email: session.user.email, token: session.access_token });
        setCurrentScreen("ChatList");
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({ email: session.user.email, token: session.access_token });
        setCurrentScreen("ChatList");
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
    setCurrentScreen("OnboardingProfile");
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen("ChatList");
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
    // Simple back navigation for demo purposes
    if (currentScreen === "OnboardingProfile" || currentScreen === "ChatThread" || currentScreen === "SettingsScreen") {
      setCurrentScreen("ChatList");
    } else if (currentScreen === "SignUp") {
      setCurrentScreen("SignIn");
    }
  };

  let screenComponent;
  switch (currentScreen) {
    case "SignIn":
      screenComponent = <SignIn onSignInSuccess={handleSignInSuccess} onGoToSignUp={() => {
        console.log("Navigating to SignUp");
        setCurrentScreen("SignUp");
      }} />;
      break;
    case "SignUp":
      screenComponent = <SignUp onSignUpSuccess={handleSignUpSuccess} onGoBack={handleGoBack} />;
      break;
    case "OnboardingProfile":
      screenComponent = <OnboardingProfile onOnboardingComplete={handleOnboardingComplete} />;
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
      screenComponent = <SignIn onSignInSuccess={handleSignInSuccess} onGoToSignUp={() => setCurrentScreen("SignUp")} />;
  }

  return (
    <div className="App">
      {screenComponent}
    </div>
  );
}

export default App;