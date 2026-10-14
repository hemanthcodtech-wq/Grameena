import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckSquare, Square, AlertCircle, Loader2, KeyRound, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import heroImg from '../assets/hero.jpg';
import logo from '../assets/logo.png';

import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = '385501792305-vkk6934iddufuu3c55klcp54jqs24mt9.apps.googleusercontent.com';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP Login States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState('email'); // 'email' or 'verify'
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setError('');
    setGoogleLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/google`,
        { credential: response.credential, mode: 'login' }
      );

      login(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/account/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.response?.data?.notRegistered) {
        setError('No account found with this Google email. Please click "Sign Up" to create an account.');
      } else {
        setError(err.response?.data?.error || 'Google login failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    let tokenClient = null;

    const setupGoogle = () => {
      if (!window.google?.accounts) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });

        const btnContainer = document.getElementById('google-login-btn-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        }
      } catch (err) {
        console.warn('Google id initialize error:', err);
      }

      try {
        if (window.google.accounts.oauth2) {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.error('Google token error:', tokenResponse);
                setError('Google sign-in was cancelled or failed.');
                return;
              }
              if (tokenResponse.access_token) {
                setGoogleLoading(true);
                setError('');
                try {
                  const res = await axios.post(
                    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/google`,
                    { credential: tokenResponse.access_token, mode: 'login' }
                  );
                  login(res.data.user, res.data.token);
                  if (res.data.user.role === 'admin') {
                    navigate('/admin');
                  } else {
                    navigate('/account/dashboard');
                  }
                } catch (err) {
                  console.error('Backend Google auth error:', err);
                  if (err.response?.data?.notRegistered) {
                    setError('No account found with this Google email. Please click "Sign Up" to create an account.');
                  } else {
                    setError(err.response?.data?.error || 'Google login failed. Please try again.');
                  }
                } finally {
                  setGoogleLoading(false);
                }
              }
            }
          });
        }
      } catch (err) {
        console.warn('Google oauth2 initTokenClient error:', err);
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
                  `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/google`,
                  { credential: tokenResponse.access_token, mode: 'login' }
                );
                login(res.data.user, res.data.token);
                if (res.data.user.role === 'admin') {
                  navigate('/admin');
                } else {
                  navigate('/account/dashboard');
                }
              } catch (err) {
                if (err.response?.data?.notRegistered) {
                  setError('No account found with this Google email. Please click "Sign Up" to create an account.');
                } else {
                  setError(err.response?.data?.error || 'Google login failed.');
                }
              } finally {
                setGoogleLoading(false);
              }
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('requestAccessToken failed:', err);
      }
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In is initializing. Please wait a moment and click again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, { email, password });
      login(res.data.user, res.data.token);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/account/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Open the OTP Modal
  const handleOpenOtpModal = () => {
    setOtpError('');
    setOtpSuccessMessage('');
    setOtpCode('');
    // Prefill with existing email if user typed one
    if (email && email.includes('@')) {
      setOtpEmail(email);
    }
    setOtpStep('email');
    setShowOtpModal(true);
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpEmail || !otpEmail.trim()) {
      setOtpError('Please enter your registered email address.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    setOtpSuccessMessage('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/send-login-otp`,
        { email: otpEmail.trim() }
      );
      setOtpSuccessMessage(res.data.message || `OTP sent to ${otpEmail}`);
      setOtpStep('verify');
      setResendCooldown(30);
    } catch (err) {
      if (err.response?.data?.notRegistered) {
        setOtpError('No account found with this email. Please click "Sign Up" to register first.');
      } else {
        setOtpError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the full 6-digit code sent to your email.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/verify-login-otp`,
        { email: otpEmail.trim(), otp: otpCode.trim() }
      );

      login(res.data.user, res.data.token);
      setShowOtpModal(false);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/account/dashboard');
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F1] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-[#FDF9F1] w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Decorative Leaves (Corner) */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-green-500 opacity-20 rounded-br-full z-0 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-600 opacity-20 rounded-tl-full z-0 blur-xl"></div>

        {/* Left Side - Image & Branding */}
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full overflow-hidden z-10">
          <img src={heroImg} alt="Rural Andhra" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-[#FDF9F1]/80"></div>
          
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
        <div className="w-full md:w-1/2 p-8 md:p-12 relative z-10 bg-[#FDF9F1]">
          <div className="flex justify-end mb-8">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-[#113C2B] font-bold text-sm ml-2 flex items-center hover:underline">
              Sign Up <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <h2 className="text-3xl font-serif font-bold text-[#113C2B] mb-2">Welcome Back!</h2>
          <p className="text-gray-600 mb-8 text-sm">Login to continue your traditional food journey with us.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-semibold rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B] focus:border-transparent transition-all text-sm"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-12 py-3 bg-white border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B] focus:border-transparent transition-all text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button 
                type="button" 
                onClick={() => setRememberMe(!rememberMe)} 
                className="flex items-center text-[#113C2B] font-medium"
              >
                {rememberMe ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                Remember me
              </button>
              <Link to="/contact" className="font-bold text-[#113C2B] hover:underline">Need Help?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#113C2B] hover:bg-[#1A4B3A] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                <>
                  Login with Password <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <button 
              type="button"
              onClick={triggerGooglePrompt}
              disabled={googleLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-3 text-[#113C2B]" />
                  Checking Google account...
                </>
              ) : (
                <>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
                  Continue with Google
                </>
              )}
            </button>

            {/* Continue with OTP Button */}
            <button 
              type="button"
              onClick={handleOpenOtpModal}
              className="w-full flex items-center justify-center py-3 px-4 border border-[#113C2B]/30 rounded-xl text-sm font-bold text-[#113C2B] bg-white hover:bg-[#113C2B]/5 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <KeyRound className="w-5 h-5 mr-3 text-[#113C2B]" />
              Continue with OTP
            </button>
          </div>

          <div className="mt-8 flex items-start p-4 bg-green-50 rounded-xl border border-green-100">
             <div className="text-green-600 mr-3 mt-1">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
             </div>
             <div>
               <p className="text-sm font-bold text-[#113C2B]">Fresh. Natural. Traditional.</p>
               <p className="text-xs text-gray-600">Passwordless access with email verification OTP.</p>
             </div>
          </div>

        </div>
      </div>

      {/* OTP Login Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#eedfc0] text-center relative"
            >
              <button 
                onClick={() => setShowOtpModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-[#113C2B] text-[#F8B319] flex items-center justify-center mx-auto mb-4 shadow-md">
                <KeyRound className="w-7 h-7" />
              </div>

              {otpStep === 'email' ? (
                /* STEP 1: Enter Email */
                <>
                  <h3 className="font-serif font-bold text-2xl text-[#113C2B]">Login with OTP</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Enter your registered email address. We'll send you a 6-digit verification code to sign in instantly.
                  </p>

                  {otpError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-left">
                      {otpError}
                    </div>
                  )}

                  <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                    <div className="relative text-left">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Your Registered Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          required
                          autoFocus
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-[#FDF9F1] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B] text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#113C2B] hover:bg-[#1A4B3A] transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#F8B319]" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send Verification Code <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* STEP 2: Enter 6-digit OTP */
                <>
                  <h3 className="font-serif font-bold text-2xl text-[#113C2B]">Enter Verification Code</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    We've sent a 6-digit verification code to:
                    <br />
                    <span className="font-bold text-[#113C2B] text-sm">{otpEmail}</span>
                  </p>

                  {otpSuccessMessage && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{otpSuccessMessage}</span>
                    </div>
                  )}

                  {otpError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-left">
                      {otpError}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        placeholder="• • • • • •"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 px-4 bg-[#FDF9F1] border-2 border-[#113C2B]/30 rounded-2xl focus:outline-none focus:border-[#113C2B] text-[#113C2B] font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading || otpCode.length !== 6}
                      className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#113C2B] hover:bg-[#1A4B3A] transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#F8B319]" />
                          Verifying Code...
                        </>
                      ) : (
                        'Verify & Enter Account'
                      )}
                    </button>

                    <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('email');
                          setOtpError('');
                          setOtpCode('');
                        }}
                        className="text-[#113C2B] font-bold hover:underline cursor-pointer"
                      >
                        Change Email
                      </button>

                      <button
                        type="button"
                        disabled={resendCooldown > 0 || otpLoading}
                        onClick={handleSendOtp}
                        className="text-[#113C2B] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
