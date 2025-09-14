import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../api';
import { getInfluencerInfo } from '@/lib/config';

interface SignInProps {
  onSignInSuccess: (user: { id: string; email: string; token: string }) => void;
  onGoToSignUp: () => void;
}

const SignIn = ({ onSignInSuccess, onGoToSignUp }: SignInProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const influencer = getInfluencerInfo();

  const handleSignIn = async () => {
    try {
      const { data, error } = await api.signIn(email, password);
      if (error) throw error;
      const { session, user } = data;
      onSignInSuccess({ id: user.id, email: user.email, token: session.access_token });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen-mobile bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Welcome to {influencer.displayName} AI</h1>
      <img src={influencer.avatarUrl || "/default_avatar.png"} alt={influencer.displayName} className="w-24 h-24 rounded-full mb-8" />
      <h2 className="text-2xl font-semibold mb-6">Sign In</h2>
      <div className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <div className="relative w-full">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          onClick={handleSignIn}
          className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          Sign In
        </Button>
      </div>
      <p className="mt-6 text-gray-400">
        Don't Have An Account?{" "}
        <span className="text-blue-500 cursor-pointer" onClick={onGoToSignUp}>
          Sign Up
        </span>
      </p>
      <p className="text-gray-400 text-sm mt-2">Must be 18+</p>
    </div>
  );
};

export default SignIn;


