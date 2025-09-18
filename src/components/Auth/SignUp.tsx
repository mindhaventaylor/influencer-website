import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/api';
import { getUserFriendlyError } from '@/lib/errorMessages';

const SignUp = ({ onSignUpSuccess, onGoBack, profileData }) => {
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
  const [error, setError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex flex-col items-center justify-center h-screen-mobile bg-black text-white p-4 overflow-y-auto">
      <div className="w-full flex justify-start mb-4">
        <Button variant="ghost" onClick={onGoBack} className="text-white">
          &larr;
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">Create Account</h1>
      <img src="/default_avatar.png" alt="Avatar" className="w-24 h-24 rounded-full mb-8" />
      <h2 className="text-2xl font-semibold mb-6">Welcome to Project Taylor</h2>
      <div className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <div className="text-gray-400 text-sm mt-4">When were you born? (Must be 18+)</div>
        <div className="relative">
          <Input
            type="text"
            readOnly
            placeholder="mm/dd/yyyy"
            value={dob}
            onClick={() => setShowDatePicker(true)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 cursor-pointer"
          />
          {showDatePicker && (
            <div className="absolute left-0 mt-2 z-50 w-full bg-gray-900 border border-gray-700 rounded-lg p-3">
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

        {/* Disclaimers and consent checkboxes at the bottom */}

        {signupSuccess && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-4">
            <p className="text-green-300 text-sm">
              Account created successfully! Please check your email and click the confirmation link to complete your registration.
            </p>
          </div>
        )}
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          onClick={handleSignUp}
          disabled={!isFormComplete || signupSuccess || isLoading}
          className={`w-full p-3 rounded-lg ${isFormComplete && !signupSuccess && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white font-bold flex items-center justify-center`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Account...
            </>
          ) : signupSuccess ? (
            'Account Created'
          ) : (
            'Create Account'
          )}
        </Button>
        <div className="space-y-2 text-xs text-gray-400 mt-4">
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

// Small inline date picker popup component
function DatePickerPopup({ month, day, year, onMonthChange, onDayChange, onYearChange, onCancel, onSet }) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 18; // user must be at least 18

  const years = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const days = [];
  const dim = daysInMonth(month, year);
  for (let d = 1; d <= dim; d++) days.push(d);

  return (
    <div>
      <div className="flex space-x-2 mb-3">
        <select className="p-2 bg-gray-800 border border-gray-700 rounded" value={month} onChange={(e) => onMonthChange(Number(e.target.value))}>
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select className="p-2 bg-gray-800 border border-gray-700 rounded" value={day} onChange={(e) => onDayChange(Number(e.target.value))}>
          {days.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className="p-2 bg-gray-800 border border-gray-700 rounded" value={year} onChange={(e) => onYearChange(Number(e.target.value))}>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600" onClick={onCancel}>Cancel</button>
        <button className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500" onClick={onSet}>Set</button>
      </div>
    </div>
  );
}


