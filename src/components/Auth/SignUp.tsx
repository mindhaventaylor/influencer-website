import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '@/api';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { getClientInfluencerInfo } from '@/lib/clientConfig';
import OnboardingProfile from './OnboardingProfile';

interface SignUpProps {
  onSignUpSuccess: (user: { id: string; email: string; token: string }) => void;
  onGoBack: () => void;
  profileData?: any;
}

const SignUp = ({ onSignUpSuccess, onGoBack, profileData }: SignUpProps) => {
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Consider the form complete when email, password, confirm password, date of birth, and all three consents are provided
  const isFormComplete = email && password && confirmPassword && password === confirmPassword && dob && agreedToTerms && agreedToConsent && agreedToSharing;

  const handleProfileCreation = (profileData: any) => {
    setUserProfileData(profileData);
    setShowProfileCreation(false);
    // Continue with sign up after profile creation
    handleSignUp();
  };

  const handleSkipProfile = () => {
    setShowProfileCreation(false);
    // Continue with sign up without profile data
    handleSignUp();
  };

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
        username: userProfileData?.username || '',
        display_name: userProfileData?.display_name || ''
      });
      if (error) throw error;
      
      const { session, user } = data;
      
      // Check if user needs email confirmation
      if (session && user) {
        // User is immediately signed in (email confirmation disabled)
        console.log('✅ Signup successful, user immediately signed in');
        onSignUpSuccess({ id: user.id, email: user.email || '', token: session.access_token });
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

  // Show profile creation screen if needed
  if (showProfileCreation) {
    return (
      <OnboardingProfile
        onNext={handleProfileCreation}
        onGoBack={() => setShowProfileCreation(false)}
        onSkip={handleSkipProfile}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F10' }}>
      {/* Top Bar */}
      <div className="flex items-center px-6 py-4" style={{ backgroundColor: '#1B1B1D' }}>
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="p-2 rounded-xl"
          style={{ color: '#EDEDED' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-medium ml-4" style={{ color: '#EDEDED' }}>Create Account</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 overflow-y-auto">
        <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="w-36 h-36 mx-auto mb-4 rounded-3xl overflow-hidden shadow-lg">
              <img 
                src={influencer.avatarUrl} 
                alt={influencer.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold mb-8" style={{ color: '#EDEDED' }}>Welcome to Project Taylor</h2>
          </div>

          <div className="space-y-5">
            {/* Social Login Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 h-11 rounded-2xl border-0 transition-all flex items-center justify-center"
                style={{ 
                  backgroundColor: '#232325',
                  borderRadius: '20px'
                }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button
                type="button"
                className="flex-1 h-11 rounded-2xl border-0 transition-all flex items-center justify-center"
                style={{ 
                  backgroundColor: '#232325',
                  borderRadius: '20px'
                }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#FFFFFF" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ color: '#B8B8B8' }}>Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border-0 text-white transition-all shadow-inner"
                style={{ 
                  backgroundColor: '#232325',
                  borderRadius: '20px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ color: '#B8B8B8' }}>Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-2xl border-0 text-white transition-all shadow-inner"
                  style={{ 
                    backgroundColor: '#232325',
                    borderRadius: '20px',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: '#7C7C81' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ color: '#B8B8B8' }}>Confirm your password</label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border-0 text-white transition-all shadow-inner"
                style={{ 
                  backgroundColor: '#232325',
                  borderRadius: '20px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#EDEDED' }}>
                When were you born? <span style={{ color: '#A6A6AA' }}>(Must be 18+)</span>
              </h2>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  placeholder="mm/dd/yyyy"
                  value={dob}
                  onClick={() => setShowDatePicker(true)}
                  className="w-full h-11 px-4 rounded-2xl border-0 text-white cursor-pointer transition-all"
                  style={{ 
                    backgroundColor: '#232325',
                    borderRadius: '20px',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
                    color: '#EDEDED'
                  }}
                />
                {showDatePicker && (
                  <div className="absolute left-0 mt-2 z-50 w-full rounded-xl p-4 shadow-xl" style={{ backgroundColor: '#232325' }}>
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
              onClick={() => setShowProfileCreation(true)}
              disabled={!isFormComplete || signupSuccess || isLoading}
              className="w-full h-12 rounded-3xl border-0 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ 
                backgroundColor: '#2C2C2E',
                borderRadius: '24px',
                color: '#EDEDED',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
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

            {/* Legal & Consent Section */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-2"
                  style={{ borderColor: '#8A8A8F', backgroundColor: agreedToTerms ? '#E84A4A' : 'transparent' }}
                />
                <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: '#A6A6AA' }}>
                  I have read and agree to Project Taylor's{' '}
                  <a href="#" className="underline" style={{ color: '#E84A4A' }}>Terms & Conditions</a>,{' '}
                  <a href="#" className="underline" style={{ color: '#E84A4A' }}>Privacy Policy</a>, and{' '}
                  <a href="#" className="underline" style={{ color: '#E84A4A' }}>Disclaimer</a>.
                </label>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold" style={{ color: '#EDEDED' }}>Data & Personalization Consent</h3>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={agreedToConsent}
                    onChange={(e) => setAgreedToConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-2"
                    style={{ borderColor: '#8A8A8F', backgroundColor: agreedToConsent ? '#E84A4A' : 'transparent' }}
                  />
                  <label htmlFor="consent" className="text-xs leading-relaxed" style={{ color: '#A6A6AA' }}>
                    I consent to Project Taylor processing my information to personalize my experience and improve its AI models.
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold" style={{ color: '#EDEDED' }}>Sharing of Personal Information</h3>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="sharing"
                    checked={agreedToSharing}
                    onChange={(e) => setAgreedToSharing(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-2"
                    style={{ borderColor: '#8A8A8F', backgroundColor: agreedToSharing ? '#E84A4A' : 'transparent' }}
                  />
                  <label htmlFor="sharing" className="text-xs leading-relaxed" style={{ color: '#A6A6AA' }}>
                    I consent to Project Taylor selling or sharing my personal information with third-party partners for advertising or similar purposes.
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span style={{ color: '#A6A6AA' }}>Already have an account? </span>
            <button
              onClick={onGoBack}
              className="underline font-medium"
              style={{ color: '#E84A4A' }}
            >
              Log in
            </button>
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
          className="flex-1 p-3 bg-gray-800 border-0 rounded-lg text-white focus:ring-2 focus:ring-red-500/20" 
          value={month} 
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select 
          className="flex-1 p-3 bg-gray-800 border-0 rounded-lg text-white focus:ring-2 focus:ring-red-500/20" 
          value={day} 
          onChange={(e) => onDayChange(Number(e.target.value))}
        >
          {days.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select 
          className="flex-1 p-3 bg-gray-800 border-0 rounded-lg text-white focus:ring-2 focus:ring-red-500/20" 
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