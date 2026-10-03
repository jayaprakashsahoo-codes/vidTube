import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, CheckCircle2, Trash2, Share2, Check, Play } from 'lucide-react';

export const formatDuration = (seconds = 0) => {
  if (!seconds) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatViews = (views = 0) => {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  return `${views} view${views === 1 ? '' : 's'}`;
};

export const timeAgo = (date) => {
  if (!date) return 'Recently';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
};

const VideoCard = ({ video, onRemoveFromHistory }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  if (!video || !video._id) return null;

  const {
    _id,
    thumbnail,
    title = 'Untitled Video',
    duration = 0,
    views = 0,
    createdAt,
    owner = {},
  } = video;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/video/${_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsMenuOpen(false);
    }, 1200);
  };

  return (
    <div className="group flex flex-col w-full cursor-pointer transition-all duration-300 relative card-hover">
      {/* Thumbnail Container */}
      <Link to={`/video/${_id}`} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#161e22] border border-[#222d34]">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
        
        {/* Duration Badge */}
        {duration > 0 && (
          <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[11px] font-medium text-[#f9f8ff] backdrop-blur-md">
            {formatDuration(duration)}
          </span>
        )}
      </Link>

      {/* Video Details */}
      <div className="mt-3 flex gap-3 items-start px-0.5">
        {/* Channel Avatar */}
        <Link to={`/c/${owner?.username || 'channel'}`} className="shrink-0">
          <div className="h-9 w-9 overflow-hidden rounded-xl border border-[#222d34] bg-[#1c262b]">
            {owner?.avatar ? (
              <img
                src={owner.avatar}
                alt={owner.fullName || owner.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-xs uppercase text-[#959ca3]">
                {(owner?.fullName || owner?.username || 'U')[0]}
              </div>
            )}
          </div>
        </Link>

        {/* Title, Channel & Stats */}
        <div className="flex flex-col flex-1 min-w-0 pr-1">
          <Link to={`/video/${_id}`}>
            <h3 className="line-clamp-2 text-xs font-semibold leading-relaxed text-[#f9f8ff] group-hover:text-white transition-colors">
              {title}
            </h3>
          </Link>

          <Link
            to={`/c/${owner?.username || 'channel'}`}
            className="mt-1 flex items-center gap-1 text-[11px] text-[#959ca3] hover:text-white transition-colors w-fit"
          >
            <span className="truncate">{owner?.fullName || owner?.username || 'Creator'}</span>
            <CheckCircle2 className="h-3 w-3 text-[#959ca3] shrink-0" />
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] text-[#959ca3] mt-0.5">
            <span>{formatViews(views)}</span>
            <span>•</span>
            <span>{timeAgo(createdAt)}</span>
          </div>
        </div>

        {/* 3 Dots Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            className="p-1 text-[#959ca3] hover:text-white hover:bg-[#161e22] rounded-lg transition-all"
            title="More options"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-7 w-48 bg-[#161e22] border border-[#222d34] rounded-2xl shadow-2xl py-1.5 z-40 text-xs text-[#f9f8ff] animate-in fade-in duration-100">
              {onRemoveFromHistory && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onRemoveFromHistory(_id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-950/40 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove from history</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[#f9f8ff] hover:bg-[#1c262b] text-left"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-zinc-400">Link copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#959ca3]" />
                    <span>Share video</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
