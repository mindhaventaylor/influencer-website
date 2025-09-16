import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OnboardingProfile = ({ onNext, onGoBack }) => {
  const [displayName, setDisplayName] = useState('');
  const [genderIdentity, setGenderIdentity] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [error, setError] = useState(null);

  const handleNext = () => {
    if (!displayName) {
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
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header with back button */}
      <div className="flex items-center p-4 border-b border-border">
        <button 
          onClick={onGoBack}
          className="p-2 rounded-full hover:bg-secondary transition-colors mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Create Your Profile</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary">
          <img src="/default_avatar.png" alt="Profile Placeholder" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-lg font-semibold mb-6 text-center">Add a Profile Picture</h2>
      <div className="w-full max-w-sm space-y-4">
        <div className="text-muted-foreground text-sm mb-2">
          What should we call you?
        </div>
        <Input
          type="text"
          placeholder="Enter your display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-4 rounded-xl bg-input border border-border text-foreground placeholder-muted-foreground"
        />
        <div className="text-muted-foreground text-sm mb-2">
          What is your gender identity?
        </div>
        <Select value={genderIdentity} onValueChange={setGenderIdentity}>
          <SelectTrigger className="w-full p-4 rounded-xl bg-input border border-border text-foreground">
            <SelectValue placeholder="Select your gender identity" />
          </SelectTrigger>
          <SelectContent className="bg-card border border-border">
            <SelectItem value="woman" className="text-card-foreground hover:bg-secondary">Woman</SelectItem>
            <SelectItem value="man" className="text-card-foreground hover:bg-secondary">Man</SelectItem>
            <SelectItem value="non-binary" className="text-card-foreground hover:bg-secondary">Non-binary</SelectItem>
            <SelectItem value="genderfluid" className="text-card-foreground hover:bg-secondary">Genderfluid</SelectItem>
            <SelectItem value="agender" className="text-card-foreground hover:bg-secondary">Agender</SelectItem>
            <SelectItem value="other" className="text-card-foreground hover:bg-secondary">Other</SelectItem>
            <SelectItem value="prefer-not-to-say" className="text-card-foreground hover:bg-secondary">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-muted-foreground text-sm mb-2 mt-4">
          What are your preferred pronouns?
        </div>
        <Select value={pronouns} onValueChange={setPronouns}>
          <SelectTrigger className="w-full p-4 rounded-xl bg-input border border-border text-foreground">
            <SelectValue placeholder="Select your preferred pronouns" />
          </SelectTrigger>
          <SelectContent className="bg-card border border-border">
            <SelectItem value="she/her" className="text-card-foreground hover:bg-secondary">She/Her</SelectItem>
            <SelectItem value="he/him" className="text-card-foreground hover:bg-secondary">He/Him</SelectItem>
            <SelectItem value="they/them" className="text-card-foreground hover:bg-secondary">They/Them</SelectItem>
            <SelectItem value="she/they" className="text-card-foreground hover:bg-secondary">She/They</SelectItem>
            <SelectItem value="he/they" className="text-card-foreground hover:bg-secondary">He/They</SelectItem>
            <SelectItem value="any" className="text-card-foreground hover:bg-secondary">Any pronouns</SelectItem>
            <SelectItem value="ask" className="text-card-foreground hover:bg-secondary">Ask me</SelectItem>
          </SelectContent>
        </Select>
        {error && <p className="text-destructive text-sm text-center">{error}</p>}
        <Button
          onClick={handleNext}
          className="w-full p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          Continue
        </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProfile;


