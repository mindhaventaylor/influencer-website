import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <div className="flex flex-col items-center justify-center h-screen-mobile bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Create Your Profile</h1>
      <img src="/default_avatar.png" alt="Profile Placeholder" className="w-24 h-24 rounded-full mb-8" />
      <h2 className="text-2xl font-semibold mb-6">Add a Profile Picture</h2>
      <div className="w-full max-w-sm space-y-4">
        <div className="text-gray-400 text-sm mb-2">
          What should Taylor call you?
        </div>
        <Input
          type="text"
          placeholder="Enter your display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <div className="text-gray-400 text-sm mb-2">
          What is your gender identity?
        </div>
        <Select value={genderIdentity} onValueChange={setGenderIdentity}>
          <SelectTrigger className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white">
            <SelectValue placeholder="Select your gender identity" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border border-gray-700">
            <SelectItem value="woman" className="text-white hover:bg-gray-700">Woman</SelectItem>
            <SelectItem value="man" className="text-white hover:bg-gray-700">Man</SelectItem>
            <SelectItem value="non-binary" className="text-white hover:bg-gray-700">Non-binary</SelectItem>
            <SelectItem value="genderfluid" className="text-white hover:bg-gray-700">Genderfluid</SelectItem>
            <SelectItem value="agender" className="text-white hover:bg-gray-700">Agender</SelectItem>
            <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
            <SelectItem value="prefer-not-to-say" className="text-white hover:bg-gray-700">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-gray-400 text-sm mb-2 mt-4">
          What are your preferred pronouns?
        </div>
        <Select value={pronouns} onValueChange={setPronouns}>
          <SelectTrigger className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white">
            <SelectValue placeholder="Select your preferred pronouns" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border border-gray-700">
            <SelectItem value="she/her" className="text-white hover:bg-gray-700">She/Her</SelectItem>
            <SelectItem value="he/him" className="text-white hover:bg-gray-700">He/Him</SelectItem>
            <SelectItem value="they/them" className="text-white hover:bg-gray-700">They/Them</SelectItem>
            <SelectItem value="she/they" className="text-white hover:bg-gray-700">She/They</SelectItem>
            <SelectItem value="he/they" className="text-white hover:bg-gray-700">He/They</SelectItem>
            <SelectItem value="any" className="text-white hover:bg-gray-700">Any pronouns</SelectItem>
            <SelectItem value="ask" className="text-white hover:bg-gray-700">Ask me</SelectItem>
          </SelectContent>
        </Select>
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


