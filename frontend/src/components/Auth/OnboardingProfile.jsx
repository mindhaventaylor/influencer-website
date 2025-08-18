import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const OnboardingProfile = ({ onNext }) => {
  const [displayName, setDisplayName] = useState('');
  const [genderIdentity, setGenderIdentity] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [error, setError] = useState(null);

  const handleNext = () => {
    if (!displayName) {
      setError('Please enter a display name.');
      return;
    }
    onNext({ displayName, genderIdentity, pronouns });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Create Your Profile</h1>
      <img src="/default_avatar.png" alt="Profile Placeholder" className="w-24 h-24 rounded-full mb-8" />
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
          onClick={handleNext}
          className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default OnboardingProfile;


