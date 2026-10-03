import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSubscribedChannelsApi, toggleSubscriptionApi } from '../utils/api';
import { Users, UserCheck, UserX } from 'lucide-react';

const Subscriptions = () => {
  const { status: isLoggedIn, userData } = useSelector((state) => state.auth);

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !userData?._id) {
      setLoading(false);
      return;
    }

    const fetchSubscribedChannels = async () => {
      try {
        setLoading(true);
        const res = await getSubscribedChannelsApi(userData._id);
        setSubscriptions(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch subscribed channels');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedChannels();
  }, [isLoggedIn, userData]);

  const handleUnsubscribe = async (channelId) => {
    if (window.confirm('Are you sure you want to unsubscribe from this channel?')) {
      try {
        await toggleSubscriptionApi(channelId);
        setSubscriptions((prev) =>
          prev.filter((item) => item.channelDetails?._id !== channelId)
        );
      } catch (err) {
        alert(err.message || 'Failed to unsubscribe.');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <UserX className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Sign in to view subscriptions</h2>
        <p className="text-sm text-zinc-500 max-w-sm mt-1">Don't miss new videos from your favorite creators.</p>
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
      <div className="flex items-center gap-3">
        <Users className="w-7 h-7 text-zinc-800 dark:text-zinc-200" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Subscriptions</h1>
          <p className="text-sm text-zinc-500">Channels you are currently subscribed to.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!error && subscriptions.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          You haven't subscribed to any channels yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subscriptions.map((item) => {
            const channel = item.channelDetails;
            if (!channel) return null;

            return (
              <div
                key={channel._id}
                className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center space-y-3"
              >
                <Link to={`/c/${channel.username}`} className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden block">
                  {channel.avatar ? (
                    <img src={channel.avatar} alt={channel.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-500">
                      {channel.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className="min-w-0 w-full">
                  <Link to={`/c/${channel.username}`} className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 truncate block">
                    {channel.fullName}
                  </Link>
                  <p className="text-xs text-zinc-500 truncate">@{channel.username}</p>
                </div>

                <button
                  onClick={() => handleUnsubscribe(channel._id)}
                  className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Subscribed</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
