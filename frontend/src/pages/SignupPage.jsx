import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, CheckSquare, Square } from 'lucide-react';
import heroImg from '../assets/hero.jpg';
import logo from '../assets/logo.png';

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
  const navigate = useNavigate();
  
  const [interests, setInterests] = useState({
    pickles: true,
    oils: true,
    snacks: true,
    traditional: false
  });

  const toggleInterest = (key) => setInterests({...interests, [key]: !interests[key]});

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (!agreeTerms) {
      return setError('Please agree to the Terms & Conditions');
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/signup`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
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
        <div className="w-full md:w-1/2 p-8 md:p-10 relative z-10 bg-[#FDF9F1] overflow-y-auto max-h-[95vh]">
          <div className="flex justify-end mb-6">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-[#113C2B] font-bold text-sm ml-2 flex items-center hover:underline">
              Login <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <h2 className="text-3xl font-serif font-bold text-[#113C2B] mb-2">Create Your Account</h2>
          <p className="text-gray-600 mb-6 text-sm">Join Grameena Bharatham and enjoy the authentic taste of Andhra.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            
            {/* Form Inputs */}
            {[
              { name: 'name', type: 'text', placeholder: 'Full Name', icon: User, required: true },
              { name: 'phone', type: 'tel', placeholder: 'Mobile Number', icon: Phone, required: true },
              { name: 'email', type: 'email', placeholder: 'Email Address (Optional)', icon: Mail, required: false },
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
                placeholder="Password"
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
                I agree to the <a href="#" className="font-bold underline">Terms & Conditions</a> and <a href="#" className="font-bold underline">Privacy Policy</a>
              </span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 mt-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#113C2B] hover:bg-[#1A4B3A] transition-colors shadow-md"
            >
              Create Account <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm mb-4">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
            Continue with Google
          </button>
          
          <div className="flex items-start p-3 bg-green-50 rounded-xl border border-green-100">
             <div className="text-green-600 mr-2 mt-0.5">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
             </div>
             <div>
               <p className="text-xs font-bold text-[#113C2B]">Fresh. Natural. Traditional.</p>
               <p className="text-[10px] text-gray-600">Good food brings people together.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
