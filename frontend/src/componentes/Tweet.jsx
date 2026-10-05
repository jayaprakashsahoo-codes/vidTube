import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  getAllTweetsApi,
  getUserTweetsApi,
  updateTweetApi,
  deleteTweetApi,
  toggleTweetLikeApi,
} from '../utils/api';
import { MessageSquare, Heart, Edit2, Trash2, User, Sparkles, Plus } from 'lucide-react';
import CreateTweetModal from './CreateTweetModal';

const Tweet = () => {
  const { status: isLoggedIn, userData } = useSelector((state) => state.auth);

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' or 'mine'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit Tweet State
  const [editingTweetId, setEditingTweetId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchTweets = async () => {
    try {
      setLoading(true);
      setError(null);

      let res;
      if (feedFilter === 'mine' && userData?._id) {
        res = await getUserTweetsApi(userData._id);
      } else {
        res = await getAllTweetsApi();
      }

      setTweets(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tweets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();

    const handleTweetCreated = () => {
      fetchTweets();
    };

    window.addEventListener('tweet-created', handleTweetCreated);
    return () => {
      window.removeEventListener('tweet-created', handleTweetCreated);
    };
  }, [feedFilter, isLoggedIn, userData]);

  const handleUpdateTweet = async (tweetId) => {
    if (!editContent.trim()) return;
    try {
      await updateTweetApi(tweetId, editContent.trim());
      setEditingTweetId(null);
      setEditContent('');
      fetchTweets();
    } catch (err) {
      alert(err.message || 'Failed to update tweet.');
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      try {
        await deleteTweetApi(tweetId);
        setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      } catch (err) {
        alert(err.message || 'Failed to delete tweet.');
      }
    }
  };

  const handleToggleLike = async (tweetId) => {
    if (!isLoggedIn) {
      alert('Please log in to like tweets.');
      return;
    }

    try {
      // Optimistic UI update
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId
            ? {
                ...t,
                isLiked: !t.isLiked,
                likesCount: Math.max(0, (t.likesCount || 0) + (t.isLiked ? -1 : 1)),
              }
            : t
        )
      );

      const res = await toggleTweetLikeApi(tweetId);
      if (res.data && typeof res.data.likesCount === 'number') {
        setTweets((prev) =>
          prev.map((t) =>
            t._id === tweetId
              ? {
                  ...t,
                  isLiked: res.data.isLiked,
                  likesCount: res.data.likesCount,
                }
              : t
          )
        );
      }
    } catch (err) {
      fetchTweets();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Sleek Compact Aesthetic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222d34]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f9f8ff] tracking-tight">
              Community Feed
            </h1>
            <p className="text-xs text-[#959ca3] mt-0.5">
              Thoughts, updates & discussions from creators
            </p>
          </div>
        </div>

        {/* Action Controls: Filter Tabs & New Post Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Feed Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#161e22] border border-[#222d34] rounded-2xl">
            <button
              onClick={() => setFeedFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                feedFilter === 'all'
                  ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={() => setFeedFilter('mine')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  feedFilter === 'mine'
                    ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Posts</span>
              </button>
            )}
          </div>

          {/* New Post Button */}
          <button
            onClick={() => {
              if (!isLoggedIn) {
                window.dispatchEvent(new CustomEvent('unauthorized-request'));
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs rounded-full transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Tweets Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : tweets.length === 0 ? (
        <div className="text-center py-14 bg-[#161e22]/50 rounded-3xl border border-[#222d34] text-[#959ca3]">
          <p className="text-sm font-semibold text-[#f9f8ff]">
            {feedFilter === 'mine' ? "You haven't posted any updates yet." : 'No community posts found.'}
          </p>
          <p className="text-xs text-[#959ca3] mt-1">
            {isLoggedIn ? 'Click "+ New Post" above to start a discussion!' : 'Log in to write a post.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {tweets.map((tweet) => {
            const author = tweet.owner || userData;
            const isOwner = userData && author && (author._id === userData._id || author.username === userData.username);
            const isEditing = editingTweetId === tweet._id;

            return (
              <div
                key={tweet._id}
                className="p-4 sm:p-5 bg-[#161e22] rounded-3xl border border-[#222d34] shadow-sm hover:border-[#222d34]/80 transition-all space-y-3"
              >
                {/* Author Info & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/c/${author?.username}`} className="w-9 h-9 rounded-2xl bg-[#0e1518] border border-[#222d34] overflow-hidden block flex-shrink-0">
                      {author?.avatar ? (
                        <img src={author.avatar} alt={author.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#959ca3]">
                          {author?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </Link>

                    <div>
                      <Link to={`/c/${author?.username}`} className="font-bold text-xs sm:text-sm text-[#f1f1f1] hover:text-white transition-colors">
                        {author?.fullName || author?.username || 'Creator'}
                      </Link>
                      <p className="text-[11px] text-[#959ca3]">
                        @{author?.username || 'user'} • {new Date(tweet.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Owner Edit/Delete Controls */}
                  {isOwner && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTweetId(tweet._id);
                          setEditContent(tweet.content);
                        }}
                        className="p-1.5 hover:bg-[#0e1518] rounded-xl text-[#959ca3] hover:text-white transition-colors"
                        title="Edit tweet"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTweet(tweet._id)}
                        className="p-1.5 hover:bg-[#0e1518] rounded-xl text-[#959ca3] hover:text-rose-400 transition-colors"
                        title="Delete tweet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Tweet Body / Inline Edit */}
                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows="3"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-[#2a3440] bg-[#0e1518] text-[#f1f1f1] outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 resize-none"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingTweetId(null)}
                        className="px-3 py-1.5 text-xs text-[#959ca3] hover:text-white hover:bg-[#0e1518] rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateTweet(tweet._id)}
                        className="px-4 py-1.5 text-xs bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-lg transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-[#f9f8ff] whitespace-pre-wrap leading-relaxed">
                    {tweet.content}
                  </p>
                )}

                {/* Like Button */}
                <div className="pt-2 border-t border-[#222d34] flex items-center">
                  <button
                    onClick={() => handleToggleLike(tweet._id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors px-3 py-1 rounded-full hover:bg-[#0e1518] ${
                      tweet.isLiked
                        ? 'text-rose-400'
                        : 'text-[#959ca3] hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${tweet.isLiked ? 'fill-current' : ''}`} />
                    <span>{tweet.likesCount > 0 ? tweet.likesCount : 'Like'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Tweet Modal */}
      <CreateTweetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTweets}
      />
    </div>
  );
};

export default Tweet;
