import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserChannelProfileApi, getAllVideosApi, toggleSubscriptionApi } from '../utils/api';
import VideoCard from './VideoCard';
import { Users, Video as VideoIcon, UserCheck, UserPlus } from 'lucide-react';

const ChannelProfile = () => {
  const { username } = useParams();
  const { status: isLoggedIn, userData } = useSelector((state) => state.auth);

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [togglingSub, setTogglingSub] = useState(false);

  useEffect(() => {
    const fetchChannelAndVideos = async () => {
      try {
        setLoading(true);
        const res = await getUserChannelProfileApi(username);
        const channelData = res.data;
        setChannel(channelData);
        setIsSubscribed(channelData.isSubscribed || false);
        setSubscribersCount(channelData.subscribersCount || 0);

        if (channelData?._id) {
          const videoRes = await getAllVideosApi(`?userId=${channelData._id}`);
          setVideos(videoRes.data?.docs || videoRes.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load channel profile');
      } finally {
        setLoading(false);
      }
    };

    fetchChannelAndVideos();
  }, [username]);

  const handleToggleSubscription = async () => {
    if (!isLoggedIn) {
      alert('Please log in to subscribe.');
      return;
    }
    if (!channel?._id) return;

    try {
      setTogglingSub(true);
      // Optimistic update
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((prev) => (isSubscribed ? prev - 1 : prev + 1));

      await toggleSubscriptionApi(channel._id);
    } catch (err) {
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((prev) => (isSubscribed ? prev + 1 : prev - 1));
      alert(err.message || 'Failed to toggle subscription.');
    } finally {
      setTogglingSub(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900/30">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Channel Not Found</h2>
        <p className="text-sm text-red-500 max-w-md">{error || `No user found with username @${username}`}</p>
      </div>
    );
  }

  const isOwner = isLoggedIn && userData && userData._id === channel._id;

  return (
    <div className="space-y-6 pb-12">
      {/* Cover Image Banner */}
      <div className="h-44 sm:h-64 w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl overflow-hidden relative shadow-inner">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt={channel.fullName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center opacity-80" />
        )}
      </div>

      {/* Channel Info Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 sm:px-4 -mt-12 sm:-mt-16 z-10 relative">
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-black bg-zinc-300 dark:bg-zinc-800 overflow-hidden shadow-lg flex-shrink-0">
            {channel.avatar ? (
              <img src={channel.avatar} alt={channel.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-500">
                {channel.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">{channel.fullName}</h1>
            <p className="text-sm text-zinc-500">@{channel.username}</p>
            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-2">
              <span>{subscribersCount} Subscribers</span>
              <span>•</span>
              <span>{channel.channelsSubscribedToCount || 0} Subscribed</span>
            </div>
          </div>
        </div>

        {/* Subscribe Button (Hidden if viewing own channel) */}
        {!isOwner && (
          <button
            onClick={handleToggleSubscription}
            disabled={togglingSub}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all active:scale-95 ${
              isSubscribed
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25'
            }`}
          >
            {isSubscribed ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Subscribe</span>
              </>
            )}
          </button>
        )}
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Channel Videos List */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <VideoIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <span>Uploaded Videos</span>
        </h2>

        {videos.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
            This channel has not uploaded any videos yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelProfile;
