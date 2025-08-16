import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../api';

const SignUp = ({ onSignUpSuccess, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToConsent, setAgreedToConsent] = useState(false);
  const [agreedToSharing, setAgreedToSharing] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    setError(null);
    if (!agreedToTerms || !agreedToConsent || !agreedToSharing) {
      setError('You must agree to all terms and conditions.');
      return;
    }
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 18) {
      setError('You must be at least 18 years old to sign up.');
      return;
    }

    try {
      const { data, error } = await api.signUp({ 
        email, 
        password, 
        username, 
        display_name: displayName 
      });
      if (error) throw error;
      
      const { session, user } = data;
      onSignUpSuccess({ email: user.email, token: session.access_token });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full flex justify-start mb-4">
        <Button variant="ghost" onClick={onGoBack} className="text-white">
          &larr;
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">Create Account</h1>
      <img src="/path/to/your/avatar.png" alt="Avatar" className="w-24 h-24 rounded-full mb-8" />
      <h2 className="text-2xl font-semibold mb-6">Welcome to Project Taylor</h2>
      <div className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <Input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <Input
          type="text"
          placeholder="Enter your display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <div className="relative w-full max-w-sm">
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
        <div className="text-gray-400 text-sm mt-4">
          When were you born? (Must be 18+)
        </div>
        <Input
          type="text"
          placeholder="mm/dd/yyyy"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />

        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-start space-x-2">
            <Checkbox id="terms" onCheckedChange={setAgreedToTerms} />
            <Label htmlFor="terms" className="text-xs">
              I have read and agree to Project Taylor's <a href="#" className="text-red-500">Terms & Conditions</a>, <a href="#" className="text-red-500">Privacy Policy</a>, and <a href="#" className="text-red-500">Disclaimer</a>
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="consent" onCheckedChange={setAgreedToConsent} />
            <Label htmlFor="consent" className="text-xs">
              I consent to Project Taylor processing my information to personalize my experience and improve its AI models.
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="sharing" onCheckedChange={setAgreedToSharing} />
            <Label htmlFor="sharing" className="text-xs">
              I consent to Project Taylor selling or sharing my personal information with third-party partners for advertising or similar purposes.
            </Label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          onClick={handleSignUp}
          className="w-full p-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold"
        >
          Create Account
        </Button>
      </div>
      <p className="mt-6 text-gray-400">
        Already Have an Account?{' '}
        <span className="text-blue-500 cursor-pointer" onClick={onGoBack}>
          Log in
        </span>
      </p>
    </div>
  );
};

export default SignUp;


