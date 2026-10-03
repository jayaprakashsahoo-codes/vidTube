import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getChannelStatsApi,
  getChannelVideosApi,
  togglePublishStatusApi,
  deleteVideoApi,
} from '../utils/api';
import EditVideoModal from './EditVideoModal';
import {
  Eye,
  Users,
  ThumbsUp,
  Video,
  Edit2,
  Trash2,
  Globe,
  Lock,
  Plus,
  BarChart2,
} from 'lucide-react';

const Dashboard = () => {
  const { status: isLoggedIn } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, videosRes] = await Promise.all([
        getChannelStatsApi(),
        getChannelVideosApi(),
      ]);

      setStats(statsRes.data);
      setVideos(videosRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load creator studio data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleToggleVisibility = async (videoId) => {
    try {
      // Optimistic update
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
        )
      );
      await togglePublishStatusApi(videoId);
    } catch (err) {
      // Revert if error
      fetchData();
      alert(err.message || 'Failed to update video visibility.');
    }
  };

  const handleDeleteVideo = async (videoId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteVideoApi(videoId);
        setVideos((prev) => prev.filter((v) => v._id !== videoId));
        // Refresh stats
        const statsRes = await getChannelStatsApi();
        setStats(statsRes.data);
      } catch (err) {
        alert(err.message || 'Failed to delete video.');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <BarChart2 className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Creator Studio</h2>
        <p className="text-sm text-zinc-500 max-w-sm mt-1">Please sign in to access your channel analytics and manage your videos.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Creator Studio</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your channel performance, video library, and visibility settings.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Views</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {stats?.totalViews?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Subscribers</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {stats?.totalSubscribers?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Likes</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {stats?.totalLikes?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Uploaded Videos</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {stats?.totalVideos?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Video Library Management */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Video Library</h2>
          <span className="text-xs text-zinc-500">{videos.length} Videos Uploaded</span>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            No videos uploaded yet. Use the Upload button in the Navbar to publish your first video.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 text-xs font-semibold uppercase border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Video</th>
                  <th className="px-6 py-3.5">Visibility</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Views</th>
                  <th className="px-6 py-3.5">Likes</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {videos.map((video) => (
                  <tr key={video._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                    {/* Video Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link to={`/video/${video._id}`} className="w-24 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 block relative group">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </Link>
                        <div className="min-w-0 max-w-xs">
                          <Link to={`/video/${video._id}`} className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 truncate block text-sm">
                            {video.title}
                          </Link>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{video.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Visibility Status (Public / Private) */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleVisibility(video._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                          video.isPublished
                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/40 dark:border-green-800 dark:text-green-400 hover:bg-green-100'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 hover:bg-zinc-200'
                        }`}
                        title="Click to toggle visibility"
                      >
                        {video.isPublished ? (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Private</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>

                    {/* Views */}
                    <td className="px-6 py-4 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {video.views?.toLocaleString() || 0}
                    </td>

                    {/* Likes */}
                    <td className="px-6 py-4 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {video.likesCount || 0}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedVideo(video);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                          title="Edit Video"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video._id, video.title)}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      {selectedVideo && (
        <EditVideoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          video={selectedVideo}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
