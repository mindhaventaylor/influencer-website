import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '@/api';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { getClientInfluencerInfo } from '@/lib/clientConfig';

interface SignUpProps {
  onSignUpSuccess: (user: { id: string; email: string; token: string }) => void;
  onGoBack: () => void;
  profileData?: any;
}

const SignUp = ({ onSignUpSuccess, onGoBack, profileData }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(1);
  const [pickerDay, setPickerDay] = useState(1);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear() - 18);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToConsent, setAgreedToConsent] = useState(false);
  const [agreedToSharing, setAgreedToSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const influencer = getClientInfluencerInfo();

  // Consider the form complete when email, password, date of birth, and all three consents are provided
  const isFormComplete = email && password && dob && agreedToTerms && agreedToConsent && agreedToSharing;

  const handleSignUp = async () => {
    setError(null);
    setIsLoading(true);
    
    if (!dob) {
      setError('Please provide your date of birth.');
      setIsLoading(false);
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions.');
      setIsLoading(false);
      return;
    }
    if (!agreedToConsent) {
      setError('You must consent to processing your information.');
      setIsLoading(false);
      return;
    }
    if (!agreedToSharing) {
      setError('You must consent to sharing your information.');
      setIsLoading(false);
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
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 SignUp data being sent:', {
        email,
        username: profileData?.username || '',
        display_name: profileData?.display_name || '',
        profileData
      });
      
      const { data, error } = await api.signUp({ 
        email, 
        password,
        username: profileData?.username || '',
        display_name: profileData?.display_name || ''
      });
      if (error) throw error;
      
      const { session, user } = data;
      
      // Check if user needs email confirmation
      if (session && user) {
        // User is immediately signed in (email confirmation disabled)
        console.log('✅ Signup successful, user immediately signed in');
        onSignUpSuccess({ id: user.id, email: user.email, token: session.access_token });
      } else if (user && !session) {
        // User created but needs email confirmation
        console.log('📧 User created, email confirmation required');
        setSignupSuccess(true);
        setError(null);
        // Don't call onSignUpSuccess, let them stay on signup page
      } else {
        console.error('❌ Unexpected signup response:', { session: !!session, user: !!user });
        throw new Error("Unexpected signup response");
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-mobile bg-black flex flex-col p-6">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="text-white hover:bg-gray-800 p-2 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white ml-4">Create Account</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-red-500">
              <img 
                src={influencer.avatarUrl} 
                alt={influencer.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome to {influencer.displayName}</h2>
            <p className="text-gray-400">Join the conversation</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth (Must be 18+)</label>
              <div className="relative">
                <Input
                  type="text"
                  readOnly
                  placeholder="mm/dd/yyyy"
                  value={dob}
                  onClick={() => setShowDatePicker(true)}
                  className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
                {showDatePicker && (
                  <div className="absolute left-0 mt-2 z-50 w-full bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl">
                    <DatePickerPopup
                      month={pickerMonth}
                      day={pickerDay}
                      year={pickerYear}
                      onMonthChange={setPickerMonth}
                      onDayChange={setPickerDay}
                      onYearChange={setPickerYear}
                      onCancel={() => setShowDatePicker(false)}
                      onSet={() => {
                        const mm = String(pickerMonth).padStart(2, '0');
                        const dd = String(pickerDay).padStart(2, '0');
                        const formatted = `${mm}/${dd}/${pickerYear}`;
                        setDob(formatted);
                        setShowDatePicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {signupSuccess && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                Account created successfully! Please check your email and click the confirmation link to complete your registration.
              </div>
            )}
            
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleSignUp}
              disabled={!isFormComplete || signupSuccess || isLoading}
              className={`w-full p-4 rounded-xl font-semibold transition-all duration-200 ${
                isFormComplete && !signupSuccess && !isLoading 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : signupSuccess ? (
                'Account Created'
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} 
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-xs leading-relaxed">
                  I have read and agree to {influencer.displayName}'s{' '}
                  <a href="#" className="text-red-400 hover:text-red-300">Terms & Conditions</a>,{' '}
                  <a href="#" className="text-red-400 hover:text-red-300">Privacy Policy</a>, and{' '}
                  <a href="#" className="text-red-400 hover:text-red-300">Disclaimer</a>
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="consent" 
                  checked={agreedToConsent}
                  onCheckedChange={(checked) => setAgreedToConsent(checked as boolean)} 
                  className="mt-0.5"
                />
                <Label htmlFor="consent" className="text-xs leading-relaxed">
                  I consent to {influencer.displayName} processing my information to personalize my experience and improve its AI models.
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="sharing" 
                  checked={agreedToSharing}
                  onCheckedChange={(checked) => setAgreedToSharing(checked as boolean)} 
                  className="mt-0.5"
                />
                <Label htmlFor="sharing" className="text-xs leading-relaxed">
                  I consent to {influencer.displayName} selling or sharing my personal information with third-party partners for advertising or similar purposes.
                </Label>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onGoBack}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

// Small inline date picker popup component
function DatePickerPopup({ month, day, year, onMonthChange, onDayChange, onYearChange, onCancel, onSet }: {
  month: number;
  day: number;
  year: number;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number) => void;
  onYearChange: (year: number) => void;
  onCancel: () => void;
  onSet: () => void;
}) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 18; // user must be at least 18

  const years = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  const daysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
  const days = [];
  const dim = daysInMonth(month, year);
  for (let d = 1; d <= dim; d++) days.push(d);

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <select 
          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
          value={month} 
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select 
          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
          value={day} 
          onChange={(e) => onDayChange(Number(e.target.value))}
        >
          {days.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select 
          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
          value={year} 
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button 
          onClick={onSet}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
        >
          Set
        </Button>
      </div>
    </div>
  );
}