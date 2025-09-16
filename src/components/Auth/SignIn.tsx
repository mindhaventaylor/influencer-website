import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../api';
import { getInfluencerInfo } from '@/lib/config';
import { getUserFriendlyError } from '../../lib/errorMessages';

interface SignInProps {
  onSignInSuccess: (user: { id: string; email: string; token: string }) => void;
  onGoToSignUp: () => void;
}

const SignIn = ({ onSignInSuccess, onGoToSignUp }: SignInProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const influencer = getInfluencerInfo();

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await api.signIn(email, password);
      if (error) throw error;
      const { session, user } = data;
      onSignInSuccess({ id: user.id, email: user.email, token: session.access_token });
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen-mobile bg-background text-foreground p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to Project {influencer.displayName}</h1>
        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary">
          <img 
            src={influencer.avatarUrl || "/default_avatar.png"} 
            alt={influencer.displayName} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-6 text-center">Sign In</h2>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-input border border-border text-foreground placeholder-muted-foreground"
          />
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-input border border-border text-foreground placeholder-muted-foreground pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          
          <div className="text-center">
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
          </div>
        </div>
        
        {/* Social Login */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full p-4 rounded-xl border-border hover:bg-secondary"
            >
              <span className="text-foreground">Sign in with Google</span>
            </Button>
            <Button
              variant="outline"
              className="w-full p-4 rounded-xl border-border hover:bg-secondary"
            >
              <span className="text-foreground">Sign in with Facebook</span>
            </Button>
          </div>
        </div>
        
        <p className="mt-6 text-center text-muted-foreground">
          Don't have an account?{" "}
          <button 
            className="text-primary hover:text-primary/80 font-medium" 
            onClick={onGoToSignUp}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;


