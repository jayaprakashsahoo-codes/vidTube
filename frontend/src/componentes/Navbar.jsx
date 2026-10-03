import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, User, Menu, Video, Plus, X, 
  Home, MessageSquare, Users, ThumbsUp, ListVideo, 
  History, LayoutDashboard, LogOut, ChevronDown, 
  Sparkles, LogIn, Settings 
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { logoutUserApi } from '../utils/api';
import AuthModal from './AuthModal';
import PublishVideoModal from './PublishVideoModal';
import CreateTweetModal from './CreateTweetModal';

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('register');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isCreateTweetModalOpen, setIsCreateTweetModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { status: isLoggedIn, userData } = useSelector((state) => state.auth);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setSearchQuery(queryParams.get('q') || '');
  }, [location.search]);

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
    };

    window.addEventListener('unauthorized-request', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized-request', handleUnauthorized);
    };
  }, [dispatch]);

  const openAuthModal = (tab = 'register') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUserApi();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      dispatch(logout());
      setIsProfileMenuOpen(false);
      navigate('/');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Tweets', path: '/tweets', icon: MessageSquare },
    { label: 'Subscriptions', path: '/subscriptions', icon: Users },
    { label: 'Liked Videos', path: '/liked-videos', icon: ThumbsUp },
    { label: 'Playlists', path: '/playlists', icon: ListVideo },
    { label: 'Watch History', path: '/history', icon: History },
    { label: 'Creator Studio', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3 bg-[#0e1518]/95 backdrop-blur-md border-b border-[#1c262b] text-[#f9f8ff]">
        
        {/* Left section: Drawer Toggle & Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 hover:bg-[#161e22] rounded-xl transition-colors text-[#959ca3] hover:text-white"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5 fill-current text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#f9f8ff]">
              VidTube
            </span>
          </Link>
        </div>

        {/* Middle section: Clean Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 hidden sm:flex items-center">
          <div className="flex items-center w-full px-4 py-2 rounded-2xl bg-[#161e22] border border-[#222d34] focus-within:border-[#959ca3]/40 transition-all">
            <Search className="w-4 h-4 text-[#959ca3] mr-2.5 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search videos, creators..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-xs text-[#f9f8ff] placeholder-[#959ca3] font-medium"
            />
          </div>
        </form>

        {/* Right section: Upload, Notifications, User Profile */}
        <div className="flex items-center gap-3">
          {/* Create Button with Dropdown (Upload Video or Create Post) */}
          <div className="relative">
            <button 
              onClick={() => {
                if (!isLoggedIn) {
                  openAuthModal('login');
                } else {
                  setIsCreateMenuOpen(!isCreateMenuOpen);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-900 rounded-full transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create</span>
            </button>

            {/* Create Dropdown Menu */}
            {isCreateMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCreateMenuOpen(false)}
                />
                <div 
                  className="absolute right-0 mt-2 w-52 bg-[#1a2228] border border-[#2a3440] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#f1f1f1] animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsCreateMenuOpen(false)}
                >
                  <button
                    onClick={() => setIsPublishModalOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1c262b] text-left transition-colors text-white font-medium"
                  >
                    <div className="p-1.5 rounded-lg bg-white/5 text-zinc-300 border border-white/10">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="leading-tight font-semibold">Upload video</p>
                      <p className="text-[10px] text-[#959ca3]">Share a new video</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsCreateTweetModalOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1c262b] text-left transition-colors text-white font-medium"
                  >
                    <div className="p-1.5 rounded-lg bg-white/5 text-zinc-300 border border-white/10">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="leading-tight font-semibold">Create post</p>
                      <p className="text-[10px] text-[#959ca3]">Post to community</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl bg-[#161e22] border border-[#222d34] hover:bg-[#1c262b] transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1c262b] flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#222d34]">
                  {userData?.avatar ? (
                    <img src={userData.avatar} alt={userData.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-[#959ca3]" />
                  )}
                </div>

                <span className="hidden md:block text-xs font-medium text-[#f9f8ff] max-w-[100px] truncate">
                  {userData?.fullName || userData?.username}
                </span>

                <ChevronDown className="w-3.5 h-3.5 text-[#959ca3]" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#161e22] border border-[#222d34] rounded-2xl shadow-2xl py-2 z-50 text-xs text-[#f9f8ff] animate-in fade-in duration-150">
                  <div className="px-4 py-2.5 border-b border-[#222d34]">
                    <p className="font-semibold text-white truncate">{userData?.fullName || 'User'}</p>
                    <p className="text-[11px] text-[#959ca3] truncate">@{userData?.username}</p>
                  </div>

                  <Link 
                    to={`/c/${userData?.username}`} 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#1c262b] text-[#f9f8ff] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#959ca3]" />
                    <span>Your Channel</span>
                  </Link>

                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#1c262b] text-[#f9f8ff] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#959ca3]" />
                    <span>Creator Studio</span>
                  </Link>

                  <Link 
                    to="/settings" 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#1c262b] text-[#f9f8ff] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#959ca3]" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-[#222d34] my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-rose-950/40 text-rose-400 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#161e22] hover:bg-[#1c262b] border border-[#222d34] text-[#f9f8ff] transition"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Drawer Navigation Bar */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
          <div className="w-64 bg-[#0e1518] border-r border-[#1c262b] p-5 flex flex-col justify-between h-full animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#1c262b]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30">
                    <Video className="w-4 h-4 fill-current text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">VidTube</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#161e22] text-[#959ca3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="space-y-1 mt-5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-[#161e22] text-white border border-[#222d34] font-semibold' 
                          : 'text-[#959ca3] hover:bg-[#161e22]/60 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsDrawerOpen(false)}></div>
        </div>
      )}

      {/* Modals */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialTab={authModalTab}
        />
      )}

      {isPublishModalOpen && (
        <PublishVideoModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}

      {isCreateTweetModalOpen && (
        <CreateTweetModal
          isOpen={isCreateTweetModalOpen}
          onClose={() => setIsCreateTweetModalOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;