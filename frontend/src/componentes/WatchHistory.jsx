import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getWatchHistoryApi, clearWatchHistoryApi, removeVideoFromWatchHistoryApi } from '../utils/api';
import VideoCard from './VideoCard';
import { History, UserX, Trash2 } from 'lucide-react';

const WatchHistory = () => {
  const { status: isLoggedIn } = useSelector((state) => state.auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getWatchHistoryApi();
      setHistory(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch watch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    fetchHistory();
  }, [isLoggedIn]);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire watch history?')) return;
    try {
      setClearing(true);
      await clearWatchHistoryApi();
      setHistory([]);
    } catch (err) {
      alert(err.message || 'Failed to clear watch history');
    } finally {
      setClearing(false);
    }
  };

  const handleRemoveItem = async (videoId) => {
    try {
      setHistory((prev) => prev.filter((item) => item._id !== videoId));
      await removeVideoFromWatchHistoryApi(videoId);
    } catch (err) {
      alert(err.message || 'Failed to remove video from watch history');
      fetchHistory();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <UserX className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Keep track of what you watch</h2>
        <p className="text-sm text-zinc-500 max-w-sm mt-1">Watch history isn't saved when signed out. Sign in to see your recently watched videos.</p>
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
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <History className="w-7 h-7 text-zinc-800 dark:text-zinc-200" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Watch History</h1>
            <p className="text-sm text-zinc-500">Videos you've previously watched on VidTube.</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={clearing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer w-fit"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{clearing ? 'Clearing...' : 'Clear all watch history'}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!error && history.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          Your watch history is clear. Videos you watch will show up here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {history.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onRemoveFromHistory={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
