import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { getClientInfluencerInfo } from '@/lib/clientConfig';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OnboardingProfileProps {
  onNext: (data: any) => void;
  onGoBack: () => void;
  onSkip: () => void;
}

const OnboardingProfile = ({ onNext, onGoBack, onSkip }: OnboardingProfileProps) => {
  const [displayName, setDisplayName] = useState('');
  const [genderIdentity, setGenderIdentity] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [error, setError] = useState<string | null>(null);

  const influencer = getClientInfluencerInfo();

  const handleNext = () => {
    if (!displayName.trim()) {
      setError('Please enter a display name.');
      return;
    }
    // Generate a username from display name (lowercase, no spaces)
    const username = displayName.toLowerCase().replace(/\s+/g, '');
    const dataToPass = { 
      username, 
      display_name: displayName,
      genderIdentity, 
      pronouns 
    };
    console.log('🔄 OnboardingProfile data being passed:', dataToPass);
    onNext(dataToPass);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#0F0F10' }}>
      {/* Top Navigation */}
      <div className="flex items-center px-6 py-4" style={{ backgroundColor: '#1B1B1D' }}>
        <Button 
          variant="ghost" 
          onClick={onGoBack}
          className="p-2 rounded-xl"
          style={{ color: '#EDEDED' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-medium ml-4" style={{ color: '#EDEDED' }}>Create Your Profile</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl w-full">
          {/* Hero Image */}
          <div className="w-36 h-36 mx-auto mb-6 rounded-3xl overflow-hidden shadow-lg">
            <img 
              src={influencer.avatarUrl} 
              alt={influencer.displayName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Subtitle */}
          <h2 className="text-lg font-medium mb-8 text-center" style={{ color: '#EDEDED' }}>
            Personalize your experience
          </h2>

          {/* Form */}
          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#B8B8B8' }}>
                What should Taylor call you?
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border-0 text-white"
                style={{ 
                  backgroundColor: '#232325',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            {/* Gender Identity */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#B8B8B8' }}>
                What is your gender identity?
              </label>
              <Select value={genderIdentity} onValueChange={setGenderIdentity}>
                <SelectTrigger className="w-full h-12 px-4 rounded-2xl border-0 text-white" style={{ 
                  backgroundColor: '#232325',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  <SelectValue placeholder="Select your gender identity" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-700">
                  <SelectItem value="woman" className="text-white hover:bg-gray-700">Woman</SelectItem>
                  <SelectItem value="man" className="text-white hover:bg-gray-700">Man</SelectItem>
                  <SelectItem value="non-binary" className="text-white hover:bg-gray-700">Non-binary</SelectItem>
                  <SelectItem value="genderfluid" className="text-white hover:bg-gray-700">Genderfluid</SelectItem>
                  <SelectItem value="agender" className="text-white hover:bg-gray-700">Agender</SelectItem>
                  <SelectItem value="bigender" className="text-white hover:bg-gray-700">Bigender</SelectItem>
                  <SelectItem value="demigender" className="text-white hover:bg-gray-700">Demigender</SelectItem>
                  <SelectItem value="genderqueer" className="text-white hover:bg-gray-700">Genderqueer</SelectItem>
                  <SelectItem value="two-spirit" className="text-white hover:bg-gray-700">Two-Spirit</SelectItem>
                  <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say" className="text-white hover:bg-gray-700">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pronouns */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#B8B8B8' }}>
                What are your preferred pronouns?
              </label>
              <Select value={pronouns} onValueChange={setPronouns}>
                <SelectTrigger className="w-full h-12 px-4 rounded-2xl border-0 text-white" style={{ 
                  backgroundColor: '#232325',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  <SelectValue placeholder="Select your preferred pronouns" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-700">
                  <SelectItem value="she/her" className="text-white hover:bg-gray-700">She/Her</SelectItem>
                  <SelectItem value="he/him" className="text-white hover:bg-gray-700">He/Him</SelectItem>
                  <SelectItem value="they/them" className="text-white hover:bg-gray-700">They/Them</SelectItem>
                  <SelectItem value="she/they" className="text-white hover:bg-gray-700">She/They</SelectItem>
                  <SelectItem value="he/they" className="text-white hover:bg-gray-700">He/They</SelectItem>
                  <SelectItem value="ze/zir" className="text-white hover:bg-gray-700">Ze/Zir</SelectItem>
                  <SelectItem value="ze/hir" className="text-white hover:bg-gray-700">Ze/Hir</SelectItem>
                  <SelectItem value="xe/xem" className="text-white hover:bg-gray-700">Xe/Xem</SelectItem>
                  <SelectItem value="ve/ver" className="text-white hover:bg-gray-700">Ve/Ver</SelectItem>
                  <SelectItem value="ey/em" className="text-white hover:bg-gray-700">Ey/Em</SelectItem>
                  <SelectItem value="any" className="text-white hover:bg-gray-700">Any pronouns</SelectItem>
                  <SelectItem value="ask" className="text-white hover:bg-gray-700">Ask me</SelectItem>
                  <SelectItem value="prefer-not-to-say" className="text-white hover:bg-gray-700">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {typeof error === 'string' ? error : error.message || 'An error occurred'}
              </div>
            )}

            {/* Finish Profile Button */}
            <Button
              onClick={handleNext}
              className="w-full h-12 rounded-3xl font-semibold"
              style={{ 
                backgroundColor: '#2C2C2E', 
                color: '#EDEDED',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              Finish Profile
            </Button>

            {/* Skip Button */}
            <button
              onClick={onSkip}
              className="w-full text-center py-3 font-medium transition-colors"
              style={{ color: '#E84A4A' }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProfile;


