import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckSquare, 
  Square,
  KeyRound,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import heroImg from '../assets/hero.jpg';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GOOGLE_CLIENT_ID = '385501792305-vkk6934iddufuu3c55klcp54jqs24mt9.apps.googleusercontent.com';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setError('');
    setGoogleLoading(true);

    try {
      // In signup: directly continue!
      const res = await axios.post(
        `${API_URL}/api/auth/google`,
        { credential: response.credential, mode: 'signup' }
      );

      login(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/account/dashboard');
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.response?.data?.error || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const setupGoogle = () => {
      if (!window.google?.accounts) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });
      } catch (err) {
        console.warn('Google id initialize error in signup:', err);
      }
    };

    if (window.google?.accounts) {
      setupGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts) {
          setupGoogle();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const triggerGooglePrompt = () => {
    setError('');
    // 1. If OAuth2 token client is supported, trigger Google Account Selection Popup directly
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.error('Google token error:', tokenResponse);
              return;
            }
            if (tokenResponse.access_token) {
              setGoogleLoading(true);
              try {
                const res = await axios.post(
                  `${API_URL}/api/auth/google`,
                  { credential: tokenResponse.access_token, mode: 'signup' }
                );
                login(res.data.user, res.data.token);
                if (res.data.user.role === 'admin') {
                  navigate('/admin');
                } else {
                  navigate('/account/dashboard');
                }
              } catch (err) {
                setError(err.response?.data?.error || 'Google sign-up failed.');
              } finally {
                setGoogleLoading(false);
              }
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('requestAccessToken in signup failed:', err);
      }
    }

    // 2. Fallback to ID prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In is initializing. Please wait a moment and click again.');
    }
  };
  
  const [interests, setInterests] = useState({
    pickles: true,
    oils: true,
    snacks: true,
    traditional: false
  });

  const toggleInterest = (key) => setInterests({...interests, [key]: !interests[key]});

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Step 1: Submit signup form & trigger OTP email
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
      return setError('All fields are required.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (!agreeTerms) {
      return setError('Please agree to the Terms & Conditions.');
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/signup`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      // Show OTP verification modal
      setShowOtpModal(true);
      setOtp('');
      setOtpError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification code. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      return setOtpError('Please enter a valid 6-digit verification code.');
    }

    setOtpLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp: otp.trim()
      });

      // Login customer in AuthContext
      login(res.data.user, res.data.token);
      setShowOtpModal(false);
      navigate('/account/dashboard');
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Resend OTP
  const handleResendOtp = async () => {
    setResending(true);
    setResendMessage('');
    setOtpError('');
    try {
      await axios.post(`${API_URL}/api/auth/resend-otp`, { email: formData.email });
      setResendMessage('A fresh verification code was sent to your email.');
      setTimeout(() => setResendMessage(''), 4000);
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Could not resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F1] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-[#FDF9F1] w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Decorative Leaves (Corner) */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-green-500 opacity-20 rounded-br-full z-0 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-600 opacity-20 rounded-tl-full z-0 blur-xl"></div>

        {/* Left Side - Image & Branding */}
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full overflow-hidden z-10 hidden md:block">
          <img src={heroImg} alt="Rural Andhra" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-[#FDF9F1]/80"></div>
          
          <div className="relative z-20 flex flex-col items-center justify-start pt-12 px-8 h-full text-center">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg mb-2">
               <img src={logo} alt="Grameena Bharatham" className="h-16 md:h-20 w-auto object-contain" />
            </div>
            <p className="text-[#113C2B] font-serif italic text-lg font-bold drop-shadow-sm mb-auto">The Taste of Rural Andhra</p>
            
            <div className="mt-auto pb-12 w-full text-left">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight drop-shadow-md">
                Tradition<br/>in Every<br/>Bite
              </h2>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 relative z-10 bg-[#FDF9F1] overflow-y-auto max-h-[95vh]">
          <div className="flex justify-end mb-6">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-[#113C2B] font-bold text-sm ml-2 flex items-center hover:underline">
              Login <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <h2 className="text-3xl font-serif font-bold text-[#113C2B] mb-2">Create Your Account</h2>
          <p className="text-gray-600 mb-6 text-sm">Join Grameena Bharatham and verify your email to get started.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}
            
            {/* Form Inputs */}
            {[
              { name: 'name', type: 'text', placeholder: 'Full Name', icon: User, required: true },
              { name: 'phone', type: 'tel', placeholder: 'Mobile Number (10 digits)', icon: Phone, required: true },
              { name: 'email', type: 'email', placeholder: 'Email Address (OTP will be sent here)', icon: Mail, required: true },
            ].map((field, idx) => (
               <div className="relative" key={idx}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <field.icon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all text-sm"
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full pl-12 pr-12 py-2.5 bg-white border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all text-sm"
                placeholder="Password (minimum 6 chars)"
                value={formData.password}
                onChange={handleChange}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                className="w-full pl-12 pr-12 py-2.5 bg-white border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Interests */}
            <div>
               <p className="text-sm font-bold text-[#113C2B] mb-2">Choose Your Interests (Optional)</p>
               <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'pickles', label: 'Pickles', icon: '🌶️' },
                    { id: 'oils', label: 'Cold Pressed Oils', icon: '💧' },
                    { id: 'snacks', label: 'Snacks', icon: '🥨' },
                    { id: 'traditional', label: 'Traditional Foods', icon: '🍲' }
                  ].map(interest => (
                    <button 
                      key={interest.id}
                      type="button" 
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-bold transition-colors ${
                        interests[interest.id] ? 'bg-green-50 border-green-200 text-[#113C2B]' : 'bg-white border-[#e8dfc8] text-gray-500'
                      }`}
                    >
                      <span className="flex items-center gap-2"><span className="text-base">{interest.icon}</span> {interest.label}</span>
                      {interests[interest.id] && <CheckSquare className="w-4 h-4 text-green-600" />}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex items-center text-xs mt-4">
              <button type="button" onClick={() => setAgreeTerms(!agreeTerms)} className="flex items-center text-[#113C2B]">
                {agreeTerms ? <CheckSquare className="w-4 h-4 mr-2 text-green-600" /> : <Square className="w-4 h-4 mr-2" />}
              </button>
              <span className="text-gray-600">
                I agree to the <Link to="/policy/terms" className="font-bold underline">Terms & Conditions</Link> and <Link to="/policy/privacy" className="font-bold underline">Privacy Policy</Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 mt-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#113C2B] hover:bg-[#1A4B3A] transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Sending Verification Code...' : 'Create Account & Verify OTP'} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button 
            type="button"
            onClick={triggerGooglePrompt}
            disabled={googleLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm mb-4 disabled:opacity-50"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-3 text-[#113C2B]" />
                Creating account with Google...
              </>
            ) : (
              <>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
                Continue with Google
              </>
            )}
          </button>
          
          <div className="flex items-start p-3 bg-green-50 rounded-xl border border-green-100">
             <div className="text-green-600 mr-2 mt-0.5">
               <ShieldCheck className="w-4 h-4" />
             </div>
             <div>
               <p className="text-xs font-bold text-[#113C2B]">Safe & Authentic</p>
               <p className="text-[10px] text-gray-600">We verify every customer to ensure genuine quality and order safety.</p>
             </div>
          </div>

        </div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#eedfc0] text-center relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#113C2B] text-[#F8B319] flex items-center justify-center mx-auto mb-4 shadow-md">
                <KeyRound className="w-7 h-7" />
              </div>

              <h3 className="font-serif font-bold text-2xl text-[#113C2B]">Verify Your Email</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                We've sent a 6-digit verification code to:
                <br />
                <span className="font-bold text-[#113C2B] text-sm">{formData.email}</span>
              </p>

              {otpError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
                  {otpError}
                </div>
              )}

              {resendMessage && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{resendMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 px-4 bg-[#FDF9F1] border-2 border-[#113C2B]/30 rounded-2xl focus:outline-none focus:border-[#113C2B] text-[#113C2B] font-bold"
                  />
                  <p className="text-[11px] text-gray-400 mt-2">Enter the 6-digit code received on your email</p>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full py-3 px-4 bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm & Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="text-gray-500 hover:text-gray-800 font-semibold"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[#d97706] hover:text-[#b45309] font-bold flex items-center gap-1 disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SignupPage;
