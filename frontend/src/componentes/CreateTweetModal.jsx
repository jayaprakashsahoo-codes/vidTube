import React, { useState } from 'react';
import { X, Send, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { createTweetApi } from '../utils/api';

const CreateTweetModal = ({ isOpen, onClose, onSuccess = () => {} }) => {
  const { userData } = useSelector((state) => state.auth);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await createTweetApi(content.trim());
      setContent('');
      onSuccess(res?.data);
      window.dispatchEvent(new CustomEvent('tweet-created', { detail: res?.data }));
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to post tweet.');
    } finally {
      setLoading(false);
    }
  };

  const charLimit = 300;
  const charsLeft = charLimit - content.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#161e22] rounded-3xl border border-[#222d34] p-6 shadow-2xl text-[#f9f8ff] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#222d34] pb-4 mb-4">
          <div className="flex items-center gap-2.5 font-bold text-base text-white">
            <div className="p-2 rounded-xl bg-white/5 text-zinc-400 border border-white/10">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="leading-tight">Create Community Post</h3>
              <p className="text-[11px] font-normal text-[#959ca3]">Share your thoughts, updates, or announcements</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-[#1c262b] text-[#959ca3] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* User Info Bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-[#0e1518] border border-[#222d34] overflow-hidden flex-shrink-0">
            {userData?.avatar ? (
              <img src={userData.avatar} alt={userData.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#959ca3]">U</div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-[#f9f8ff] leading-none">
              {userData?.fullName || userData?.username || 'Creator'}
            </p>
            <p className="text-[11px] text-[#959ca3] mt-0.5">
              @{userData?.username || 'user'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              autoFocus
              rows="4"
              maxLength={charLimit}
              placeholder="What's happening in your creative journey? Share an update..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-[#222d34] bg-[#0e1518] text-[#f9f8ff] placeholder-[#959ca3] outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors resize-none leading-relaxed"
            ></textarea>
            
            <span className={`absolute bottom-3 right-3 text-[10px] font-mono ${
              charsLeft < 20 ? 'text-rose-400' : 'text-[#959ca3]'
            }`}>
              {charsLeft}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#959ca3]">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Visible to all community members</span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold border border-[#222d34] rounded-2xl text-[#959ca3] hover:text-white hover:bg-[#1c262b] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="px-5 py-2 text-xs font-bold bg-white hover:bg-zinc-100 text-zinc-900 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-zinc-900/20 active:scale-95 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{loading ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTweetModal;
