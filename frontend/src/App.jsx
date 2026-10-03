import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './componentes/Navbar';
import VideoCard from './componentes/VideoCard';
import VideoDetails from './componentes/VideoDetails';
import User from './componentes/User';
import ChannelProfile from './componentes/ChannelProfile';
import WatchHistory from './componentes/WatchHistory';
import Dashboard from './componentes/Dashboard';
import Subscriptions from './componentes/Subscriptions';
import Tweet from './componentes/Tweet';
import LikedVideos from './componentes/LikedVideos';
import Playlists from './componentes/Playlists';
import AuthLandingPage from './componentes/AuthLandingPage';
import { getAllVideosApi, getCurrentUserApi } from './utils/api';
import { login, logout } from './redux/slices/authSlice';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const queryStr = searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : '';
        const response = await getAllVideosApi(queryStr);
        setVideos(response.data?.docs || response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load videos.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {searchQuery && (
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Search results for <span className="font-bold text-zinc-900 dark:text-zinc-100">"{searchQuery}"</span>
          </p>
          <Link
            to="/"
            className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 font-semibold"
          >
            Clear Search
          </Link>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-600 dark:text-zinc-400" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 dark:text-red-400 py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-red-200 dark:border-red-900/40">
          {error}
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="text-center text-zinc-500 py-24 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">No videos found</p>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery ? 'Try searching for a different keyword' : 'Be the first creator to upload a video!'}
          </p>
        </div>
      )}

      {/* Clean Video Grid */}
      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status: isLoggedIn } = useSelector((state) => state.auth);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isGuest, setIsGuest] = useState(() => sessionStorage.getItem('guestMode') === 'true');

  useEffect(() => {
    getCurrentUserApi()
      .then((res) => {
        if (res?.data) {
          dispatch(login({ userData: res.data }));
        }
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, [dispatch]);

  const handleContinueAsGuest = () => {
    sessionStorage.setItem('guestMode', 'true');
    setIsGuest(true);
    navigate('/');
  };

  const isAuthRoute = ['/welcome', '/register', '/signup', '/login'].includes(location.pathname);
  const shouldShowAuthLanding = !checkingAuth && !isLoggedIn && (!isGuest || isAuthRoute);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1518]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (shouldShowAuthLanding) {
    const initialMode = location.pathname === '/login' ? 'login' : 'register';
    return (
      <AuthLandingPage
        initialMode={initialMode}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1518] text-[#f9f8ff] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className={`flex-1 w-full py-6 ${location.pathname.startsWith('/video/') ? 'px-4 sm:px-8 max-w-[2000px] mx-auto' : 'max-w-7xl mx-auto px-4 sm:px-8'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          <Route path="/c/:username" element={<ChannelProfile />} />
          <Route path="/history" element={<WatchHistory />} />
          <Route path="/settings" element={<User />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/tweets" element={<Tweet />} />
          <Route path="/liked-videos" element={<LikedVideos />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
