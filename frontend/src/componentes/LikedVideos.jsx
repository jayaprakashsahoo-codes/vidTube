import React, { useState, useEffect } from 'react';
import { ThumbsUp, Trash2, Play, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoCard from './VideoCard';
import { getLikedVideosApi, toggleVideoLikeApi } from '../utils/api';

const LikedVideos = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLikedVideosApi();
      const rawData = res.data || [];
      const videos = rawData
        .map(item => item?.likedVideo || item?.video || item)
        .filter(v => v && (v._id || typeof v === 'string'));
      setLikedVideos(videos);
    } catch (err) {
      setError(err.message || 'Failed to load liked videos');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (videoId, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await toggleVideoLikeApi(videoId);
      setLikedVideos(prev => prev.filter(v => v._id !== videoId));
    } catch (err) {
      alert(err.message || 'Failed to update like status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6 animate-in fade-in duration-300">
      {/* Sleek Compact Aesthetic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222d34]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
            <ThumbsUp className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f9f8ff] tracking-tight">
              Liked Videos
            </h1>
            <p className="text-xs text-[#959ca3] mt-0.5">
              Collection of videos you've marked with a thumbs up
            </p>
          </div>
        </div>
        
        <div className="self-start sm:self-center px-3.5 py-1.5 rounded-full bg-[#161e22] border border-[#222d34] text-xs font-semibold text-[#959ca3]">
          {likedVideos.length} {likedVideos.length === 1 ? 'Video' : 'Videos'}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-xs text-[#959ca3] mt-3">Loading your liked collection...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-center text-rose-400 text-xs font-medium">
          <p>{error}</p>
          <button 
            onClick={fetchLikedVideos}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && likedVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-[#161e22]/60 rounded-3xl border border-[#222d34]">
          <div className="p-3.5 rounded-2xl bg-[#0e1518] text-[#959ca3] border border-[#222d34] mb-3">
            <ThumbsUp className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-base font-bold text-[#f9f8ff]">No Liked Videos Yet</h3>
          <p className="text-xs text-[#959ca3] max-w-sm mt-1">
            Explore videos across the platform and hit the like button to save them here for easy access.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-2xl text-xs font-bold transition shadow-md shadow-zinc-900/20 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Explore Videos</span>
          </Link>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && !error && likedVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {likedVideos.map((video) => (
            <div key={video._id} className="relative group">
              <VideoCard video={video} />
              
              {/* Quick Unlike Overlay Button */}
              <button
                onClick={(e) => handleUnlike(video._id, e)}
                title="Remove from Liked Videos"
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/75 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md shadow-md z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
