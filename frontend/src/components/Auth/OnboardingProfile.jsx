import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '../../api';

const OnboardingProfile = ({ onOnboardingComplete, userToken }) => {
  const [displayName, setDisplayName] = useState('');
  const [genderIdentity, setGenderIdentity] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [error, setError] = useState(null);

  const handleFinishProfile = async () => {
    try {
      // Assuming an API endpoint to update user profile exists
      // This would typically be a PUT or POST to /api/users/profile
      // For now, we'll simulate it or assume it's handled by Supabase RLS on user update
      // If a dedicated backend endpoint is needed, it should be added to the backend server.ts
      
      // For simplicity, let's assume we directly update the user metadata via Supabase client if needed
      // Or, if the backend handles this, we'd call api.updateUserProfile({ displayName, genderIdentity, pronouns }, userToken);

      // For now, just call the completion callback
      onOnboardingComplete();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Create Your Profile</h1>
      <img src="/path/to/your/profile_placeholder.png" alt="Profile Placeholder" className="w-24 h-24 rounded-full mb-8" />
      <h2 className="text-2xl font-semibold mb-6">Add a Profile Picture</h2>
      <div className="w-full max-w-sm space-y-4">
        <Input
          type="text"
          placeholder="Enter your display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <div className="text-gray-400 text-sm mt-4">
          What should Taylor call you?
        </div>
        <Input
          type="text"
          placeholder="Enter your gender identity"
          value={genderIdentity}
          onChange={(e) => setGenderIdentity(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <div className="text-gray-400 text-sm mt-4">
          What is your gender identity?
        </div>
        <Input
          type="text"
          placeholder="Enter your preferred pronouns"
          value={pronouns}
          onChange={(e) => setPronouns(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <div className="text-gray-400 text-sm mt-4">
          What are your preferred pronouns
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          onClick={handleFinishProfile}
          className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          Finish Profile
        </Button>
      </div>
    </div>
  );
};

export default OnboardingProfile;


