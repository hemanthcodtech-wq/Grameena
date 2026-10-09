import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckSquare, Square } from 'lucide-react';
import heroImg from '../assets/hero.jpg';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
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
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B] focus:border-transparent transition-all text-sm"
                placeholder="Email Address / Mobile Number"
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
              <a href="#" className="font-bold text-[#113C2B] hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#113C2B] hover:bg-[#1A4B3A] transition-colors shadow-md"
            >
              Login <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl text-sm font-bold text-[#113C2B] bg-white hover:bg-green-50 transition-colors shadow-sm">
              <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              Continue with OTP
            </button>
          </div>

          <div className="mt-8 flex items-start p-4 bg-green-50 rounded-xl border border-green-100">
             <div className="text-green-600 mr-3 mt-1">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
             </div>
             <div>
               <p className="text-sm font-bold text-[#113C2B]">Fresh. Natural. Traditional.</p>
               <p className="text-xs text-gray-600">Good food brings people together.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
