import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  User, Mail, Lock, Upload, Image as ImageIcon,
  Loader2, CheckCircle2, AlertCircle, ArrowRight, Video, Eye, EyeOff
} from 'lucide-react';
import { registerUserApi, loginUserApi } from '../utils/api';
import { login } from '../redux/slices/authSlice';

const AuthLandingPage = ({ onContinueAsGuest, initialMode = 'register' }) => {
  const [mode, setMode] = useState(initialMode); // 'register' or 'login'
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Register Form State
  const [regData, setRegData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Login Form State
  const [loginData, setLoginData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!avatarFile) {
      setError('Avatar image is required to register.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', regData.fullName.trim());
      formData.append('username', regData.username.trim().toLowerCase());
      formData.append('email', regData.email.trim().toLowerCase());
      formData.append('password', regData.password);
      formData.append('avatar', avatarFile);
      if (coverFile) {
        formData.append('coverImage', coverFile);
      }

      await registerUserApi(formData);
      setSuccess('Account created successfully! Switching to Sign In...');

      setTimeout(() => {
        setSuccess('');
        setMode('login');
        setLoginData({ usernameOrEmail: regData.username, password: '' });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const cleanInput = loginData.usernameOrEmail.trim();
      const isEmail = cleanInput.includes('@');
      const payload = {
        password: loginData.password,
        ...(isEmail
          ? { email: cleanInput.toLowerCase() }
          : { username: cleanInput.toLowerCase() }),
      };

      const res = await loginUserApi(payload);
      setSuccess('Logged in successfully!');

      if (res?.data?.user) {
        dispatch(login({ userData: res.data.user }));
      }

      setTimeout(() => {
        if (onContinueAsGuest) {
          onContinueAsGuest();
        } else {
          navigate('/');
        }
      }, 800);
    } catch (err) {
      setError(err.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen bg-[#0e1518] text-[#f9f8ff] flex flex-col items-center justify-center p-3 sm:p-4 font-sans relative overflow-hidden">
      {/* Subtle background ambient red glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center relative z-10 max-h-full">

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-2 text-center shrink-0">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 mb-1 transform hover:scale-105 transition-transform">
            <Video className="w-5 h-5 fill-current text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#f9f8ff]">
            VidTube
          </h1>
          <p className="text-[11px] text-[#959ca3] font-medium">
            Watch, share, and connect with content creators
          </p>
        </div>

        {/* Card Box */}
        <div className="w-full bg-[#161e22] border border-[#222d34] rounded-2xl p-4 sm:p-5 shadow-2xl transition-all overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">

          {/* Top Switcher Tabs */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#222d34]">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className={`text-sm font-bold pb-1 transition-colors relative ${
                  mode === 'register' ? 'text-white' : 'text-[#959ca3] hover:text-white'
                }`}
              >
                Sign Up
                {mode === 'register' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`text-sm font-bold pb-1 transition-colors relative ${
                  mode === 'login' ? 'text-white' : 'text-[#959ca3] hover:text-white'
                }`}
              >
                Sign In
                {mode === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start gap-2 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-3 p-2.5 rounded-xl bg-green-950/30 border border-green-900/40 flex items-start gap-2 text-zinc-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* FORM AREA */}
          {mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              {/* Image Pickers Row */}
              <div className="grid grid-cols-2 gap-2.5 mb-1">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-[#0e1518] border border-dashed border-[#222d34] flex items-center justify-center overflow-hidden transition-all group-hover:border-red-500">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#959ca3] group-hover:text-red-500 transition-colors" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      required
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] text-[#959ca3] mt-1 font-medium">
                    Avatar <span className="text-red-500">*</span>
                  </span>
                </div>

                {/* Cover Image Upload */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full h-12 rounded-xl bg-[#0e1518] border border-dashed border-[#222d34] flex items-center justify-center overflow-hidden cursor-pointer group hover:border-red-500 transition-colors">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#959ca3] group-hover:text-[#f9f8ff] transition-colors">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Banner</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] text-[#959ca3] mt-1 font-medium">
                    Cover (Optional)
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-[#959ca3]" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={regData.fullName || ''}
                    onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#0e1518] border border-[#222d34] rounded-xl text-xs text-[#f9f8ff] placeholder-[#959ca3] outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs text-[#959ca3] font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={regData.username || ''}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#0e1518] border border-[#222d34] rounded-xl text-xs text-[#f9f8ff] placeholder-[#959ca3] outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-[#959ca3]" />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={regData.email || ''}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#0e1518] border border-[#222d34] rounded-xl text-xs text-[#f9f8ff] placeholder-[#959ca3] outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-[#959ca3]" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={regData.password || ''}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full pl-9 pr-9 py-2 bg-[#0e1518] border border-[#222d34] rounded-xl text-xs text-[#f9f8ff] placeholder-[#959ca3] outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-[#959ca3] hover:text-white transition-colors cursor-pointer p-0.5"
                    title={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-red-500" />}
                  </button>
                </div>
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-3 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 py-2">
              {/* Username or Email */}
              <div>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#959ca3]" />
                  <input
                    type="text"
                    required
                    placeholder="Email or Username"
                    value={loginData.usernameOrEmail || ''}
                    onChange={(e) => setLoginData({ ...loginData, usernameOrEmail: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#0e1518] border border-[#222d34] rounded-xl text-xs text-[#f9f8ff] placeholder-[#959ca3] outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#959ca3]" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={loginData.password || ''}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0e1518] border border-[#222d34] rounded-xl text-xs text-[#f9f8ff] placeholder-[#959ca3] outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-[#959ca3] hover:text-white transition-colors cursor-pointer p-0.5"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-red-500" />}
                  </button>
                </div>
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* Toggle between Register and Login */}
          <div className="mt-3 text-center text-[11px] text-[#959ca3]">
            {mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="font-bold text-red-500 hover:text-red-400 underline ml-0.5 cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                  className="font-bold text-red-500 hover:text-red-400 underline ml-0.5 cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          {/* Continue as Guest Button */}
          <div className="mt-3 pt-2.5 border-t border-[#222d34] text-center">
            <button
              type="button"
              onClick={() => {
                if (onContinueAsGuest) {
                  onContinueAsGuest();
                } else {
                  sessionStorage.setItem('guestMode', 'true');
                  navigate('/');
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-[#959ca3] hover:text-white hover:bg-[#1c262b] rounded-xl transition-all border border-[#222d34] active:scale-95 cursor-pointer"
            >
              <span>Continue as Guest</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthLandingPage;
