import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThumbsUp, MessageSquare, Trash2, Edit2, Send, Heart, UserPlus, UserCheck, ListVideo, Sparkles } from 'lucide-react';
import SaveToPlaylistModal from './SaveToPlaylistModal';
import {
  getVideoByIdApi,
  getAllVideosApi,
  toggleVideoLikeApi,
  getVideoCommentsApi,
  addCommentApi,
  updateCommentApi,
  deleteCommentApi,
  toggleCommentLikeApi,
  toggleSubscriptionApi,
  getUserChannelProfileApi,
} from '../utils/api';

const formatViews = (views) => {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
};

const formatLikes = (count) => {
  if (!count || count <= 0) return 'Like';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const VideoDetails = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { status: isLoggedIn, userData } = useSelector((state) => state.auth);

  // Video State
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Save to Playlist State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [togglingSub, setTogglingSub] = useState(false);

  // Comments State
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  // Fetch Video Details & Owner Sub Status
  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await getVideoByIdApi(videoId);
      const videoData = response.data;
      setVideo(videoData);
      setIsLiked(Boolean(videoData.isLiked));
      setLikeCount(Number(videoData.likesCount) || 0);

      // Fetch owner channel profile for sub status
      if (videoData.owner?.username) {
        getUserChannelProfileApi(videoData.owner.username)
          .then((channelRes) => {
            if (channelRes.data) {
              setIsSubscribed(channelRes.data.isSubscribed || false);
              setSubscribersCount(channelRes.data.subscribersCount || 0);
            }
          })
          .catch(console.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch video details.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Video Comments
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await getVideoCommentsApi(videoId);
      const docs = response.data?.docs || (Array.isArray(response.data) ? response.data : []);
      setComments(docs);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Up Next Sidebar Videos State
  const [upNextVideos, setUpNextVideos] = useState([]);
  const [upNextLoading, setUpNextLoading] = useState(false);

  // Fetch Up Next / Suggested Videos
  const fetchUpNext = async () => {
    try {
      setUpNextLoading(true);
      const res = await getAllVideosApi();
      const docs = res.data?.docs || (Array.isArray(res.data) ? res.data : []);
      const filtered = docs.filter((v) => (v._id || v) !== videoId);
      setUpNextVideos(filtered);
    } catch (err) {
      console.error('Failed to fetch up next videos:', err);
    } finally {
      setUpNextLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
    fetchUpNext();
  }, [videoId]);

  const handleToggleVideoLike = async () => {
    if (!isLoggedIn) {
      alert('Please log in to like this video.');
      return;
    }
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistic UI update
    const nextIsLiked = !previousIsLiked;
    setIsLiked(nextIsLiked);
    setLikeCount((prev) => Math.max(0, prev + (nextIsLiked ? 1 : -1)));

    try {
      const res = await toggleVideoLikeApi(videoId);
      if (res.data) {
        setIsLiked(Boolean(res.data.isLiked));
        if (typeof res.data.likesCount === 'number') {
          setLikeCount(res.data.likesCount);
        }
      }
    } catch (err) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      alert(err.message || 'Failed to toggle like.');
    }
  };

  const handleToggleSubscription = async () => {
    if (!isLoggedIn) {
      alert('Please log in to subscribe to this channel.');
      return;
    }
    if (!video?.owner?._id) return;

    try {
      setTogglingSub(true);
      // Optimistic update
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((prev) => (isSubscribed ? prev - 1 : prev + 1));

      await toggleSubscriptionApi(video.owner._id);
    } catch (err) {
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((prev) => (isSubscribed ? prev + 1 : prev - 1));
      alert(err.message || 'Failed to toggle subscription.');
    } finally {
      setTogglingSub(false);
    }
  };

  // Comment Actions
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Please log in to add a comment.');
      return;
    }
    if (!newCommentContent.trim()) return;

    try {
      setSubmittingComment(true);
      await addCommentApi(videoId, newCommentContent.trim());
      setNewCommentContent('');
      fetchComments();
    } catch (err) {
      alert(err.message || 'Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentContent.trim()) return;
    try {
      await updateCommentApi(commentId, editCommentContent.trim());
      setEditingCommentId(null);
      setEditCommentContent('');
      fetchComments();
    } catch (err) {
      alert(err.message || 'Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteCommentApi(commentId);
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } catch (err) {
        alert(err.message || 'Failed to delete comment.');
      }
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    if (!isLoggedIn) {
      alert('Please log in to like a comment.');
      return;
    }
    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likesCount: Math.max(0, (c.likesCount || 0) + (c.isLiked ? -1 : 1)),
            }
          : c
      )
    );

    try {
      const res = await toggleCommentLikeApi(commentId);
      if (res.data && typeof res.data.likesCount === 'number') {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  isLiked: res.data.isLiked,
                  likesCount: res.data.likesCount,
                }
              : c
          )
        );
      }
    } catch (err) {
      fetchComments();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-900/30">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
        <p className="text-sm text-red-500 max-w-md">{error || 'Video not found.'}</p>
      </div>
    );
  }

  const isOwner = isLoggedIn && userData && video.owner && (userData._id === video.owner._id || userData.username === video.owner.username);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
      {/* Main Video & Comments Column */}
      <div className="flex-1 min-w-0 space-y-4 w-full">
        {/* Video Player */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
          <video
            src={video.videoFile}
            poster={video.thumbnail}
            controls
            autoPlay
            className="w-full h-full object-contain"
          ></video>
        </div>

        {/* Video Title */}
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 break-words mt-2">
          {video.title}
        </h1>

        {/* YouTube Style Channel Bar (Avatar, Name, Subs, SUBSCRIBE Button on Left, Like on Right) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          {/* Channel Info & Subscribe Button */}
          <div className="flex items-center gap-3">
            <Link to={`/c/${video.owner?.username}`} className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0 block">
              {video.owner?.avatar ? (
                <img src={video.owner.avatar} alt={video.owner.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                  {video.owner?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </Link>

            <div className="mr-3">
              <Link to={`/c/${video.owner?.username}`} className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 transition-colors text-sm sm:text-base block">
                {video.owner?.fullName || video.owner?.username}
              </Link>
              <p className="text-xs text-zinc-500">{subscribersCount} subscribers</p>
            </div>

            {/* RED YOUTUBE SUBSCRIBE BUTTON */}
            {isOwner ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#161e22] text-[#f9f8ff] border border-[#222d34] hover:bg-[#1c262b] transition-colors"
              >
                Manage Video
              </Link>
            ) : (
              <button
                onClick={handleToggleSubscription}
                disabled={togglingSub}
                className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
                  isSubscribed
                    ? 'bg-[#161e22] text-[#f9f8ff] hover:bg-[#1c262b] border border-[#222d34]'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Action Buttons (Like & Save to Playlist) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleVideoLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors border bg-white/5 border-white/10 hover:bg-white/10 ${
                isLiked
                  ? 'text-blue-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{formatLikes(likeCount)}</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors border bg-white/5 border-white/10 text-[#f1f1f1] hover:bg-white/10"
              >
                <ListVideo className="w-4 h-4 text-zinc-400" />
                <span>Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Description Box */}
        <div className="p-4 bg-[#161e22] border border-[#222d34] rounded-2xl text-xs space-y-2 text-[#f9f8ff]">
          <div className="text-xs font-bold text-[#f9f8ff] flex items-center gap-2">
            <span>{video.views?.toLocaleString() || 0} views</span> •
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-[#959ca3] whitespace-pre-wrap leading-relaxed">
            {video.description}
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="pt-4 border-t border-[#222d34] space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-zinc-400" />
            <h2 className="text-base font-bold text-white">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Add Comment Input Form */}
          {isLoggedIn ? (
            <form onSubmit={handleAddComment} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#161e22] border border-[#222d34] overflow-hidden flex-shrink-0">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt={userData.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-xs">U</div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs rounded-full border border-[#2a3440] bg-[#141c20] text-[#f1f1f1] placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newCommentContent.trim()}
                  className="px-5 py-2 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-full text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              Please sign in to leave a comment.
            </p>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 dark:border-white"></div>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const isCommentOwner = isLoggedIn && userData && userData._id === comment.owner?._id;
                const isEditing = editingCommentId === comment._id;

                return (
                  <div
                    key={comment._id}
                    className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex gap-3 transition-colors"
                  >
                    <Link to={`/c/${comment.owner?.username}`} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0 block">
                      {comment.owner?.avatar ? (
                        <img
                          src={comment.owner.avatar}
                          alt={comment.owner.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                          {comment.owner?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Link to={`/c/${comment.owner?.username}`} className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 transition-colors">
                            {comment.owner?.fullName || 'Anonymous'}
                          </Link>
                          <span className="text-[11px] text-zinc-500">
                            @{comment.owner?.username} •{' '}
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'recently'}
                          </span>
                        </div>

                        {isCommentOwner && !isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditCommentContent(comment.content);
                              }}
                              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-blue-600 transition-colors"
                              title="Edit comment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-600 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateComment(comment._id)}
                              className="px-2.5 py-1 text-xs bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-200 break-words leading-relaxed">
                          {comment.content}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => handleToggleCommentLike(comment._id, comment.isLiked)}
                          className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                            comment.isLiked
                              ? 'text-red-500'
                              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                          <span>{comment.likesCount > 0 ? comment.likesCount : 'Like'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Suggested Videos Sidebar - Fits YouTube Layout */}
      <div className="w-full lg:w-[400px] xl:w-[430px] 2xl:w-[460px] shrink-0 space-y-2">
        {upNextLoading ? (
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex gap-2.5 animate-pulse p-1 w-full">
                <div className="w-44 sm:w-48 xl:w-52 aspect-video bg-[#161e22] rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3.5 bg-[#161e22] rounded w-full"></div>
                  <div className="h-3 bg-[#161e22] rounded w-3/4"></div>
                  <div className="h-2.5 bg-[#161e22] rounded w-1/2 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : upNextVideos.length === 0 ? (
          <div className="text-xs text-[#959ca3] p-6 border border-dashed border-[#222d34] rounded-2xl text-center bg-[#161e22]/50">
            No other videos available right now.
          </div>
        ) : (
          <div className="space-y-1.5">
            {upNextVideos.map((nextVid) => {
              const isNew = nextVid.createdAt && (new Date() - new Date(nextVid.createdAt)) < 7 * 24 * 60 * 60 * 1000;
              return (
                <Link
                  key={nextVid._id}
                  to={`/video/${nextVid._id}`}
                  className="flex gap-2.5 group p-1 rounded-xl hover:bg-[#161e22] transition-all border border-transparent hover:border-[#222d34]/60 w-full"
                >
                  {/* YouTube Thumbnail with Duration & New Badge */}
                  <div className="relative w-44 sm:w-48 xl:w-52 aspect-video rounded-xl bg-black overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={nextVid.thumbnail}
                      alt={nextVid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {isNew && (
                      <span className="absolute top-1 left-1 bg-white/95 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                        New
                      </span>
                    )}

                    {nextVid.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/85 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs font-mono">
                        {Math.floor(nextVid.duration / 60)}:
                        {String(Math.floor(nextVid.duration % 60)).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  {/* Right Side Video Details */}
                  <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-start">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#f1f1f1] line-clamp-2 leading-snug group-hover:text-white transition-colors">
                      {nextVid.title}
                    </h4>
                    
                    <p className="text-[11px] text-[#959ca3] mt-1 line-clamp-1 hover:text-white transition-colors font-medium">
                      {nextVid.owner?.fullName || nextVid.owner?.username || 'Creator'}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-[#959ca3] mt-0.5">
                      <span>{formatViews(nextVid.views)} views</span>
                      <span>•</span>
                      <span>{formatTimeAgo(nextVid.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Save to Playlist Modal */}
      <SaveToPlaylistModal
        videoId={videoId}
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </div>
  );
};

export default VideoDetails;
