import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Loader2, ListVideo, FolderPlus, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getUserPlaylistsApi, addVideoToPlaylistApi, removeVideoFromPlaylistApi, createPlaylistApi } from '../utils/api';

const SaveToPlaylistModal = ({ videoId, isOpen, onClose }) => {
  const { userData } = useSelector((state) => state.auth);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen && userData?._id) {
      fetchPlaylists();
      setToastMsg('');
    }
  }, [isOpen, userData]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await getUserPlaylistsApi(userData._id);
      setPlaylists(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isVideoInPlaylist = (playlist) => {
    if (!playlist || !Array.isArray(playlist.videos)) return false;
    const targetId = String(videoId);
    return playlist.videos.some((v) => {
      if (!v) return false;
      const id = typeof v === 'object' && v._id ? String(v._id) : String(v);
      return id === targetId;
    });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 2500);
  };

  const handleTogglePlaylist = async (playlist) => {
    const inPlaylist = isVideoInPlaylist(playlist);
    const targetVideoId = String(videoId);
    setTogglingId(playlist._id);

    // Optimistic state update for instant tick response
    const previousPlaylists = [...playlists];
    setPlaylists((prev) =>
      prev.map((p) => {
        if (String(p._id) === String(playlist._id)) {
          const currentVideos = p.videos || [];
          const updatedVideos = inPlaylist
            ? currentVideos.filter((v) => {
                const id = typeof v === 'object' && v._id ? String(v._id) : String(v);
                return id !== targetVideoId;
              })
            : [...currentVideos, videoId];

          return {
            ...p,
            videos: updatedVideos,
          };
        }
        return p;
      })
    );

    try {
      if (inPlaylist) {
        await removeVideoFromPlaylistApi(videoId, playlist._id);
        showToast(`Removed from "${playlist.name}"`);
      } else {
        await addVideoToPlaylistApi(videoId, playlist._id);
        showToast(`Added to "${playlist.name}"`);
      }
    } catch (err) {
      // Revert if API fails
      setPlaylists(previousPlaylists);
      alert(err.message || 'Failed to update playlist');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setCreating(true);
      const res = await createPlaylistApi({
        name: newTitle.trim(),
        description: newDesc.trim() || 'My custom playlist',
      });
      const createdPlaylist = res.data;
      await addVideoToPlaylistApi(videoId, createdPlaylist._id);
      createdPlaylist.videos = [videoId];

      setPlaylists((prev) => [createdPlaylist, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setShowCreate(false);
      showToast(`Created & added to "${createdPlaylist.name}"`);
    } catch (err) {
      alert(err.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#161e22] rounded-3xl border border-[#222d34] p-6 shadow-2xl text-[#f9f8ff] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#222d34] pb-4 mb-4">
          <div className="flex items-center gap-2.5 font-bold text-base text-white">
            <div className="p-2 rounded-xl bg-white/5 text-zinc-400 border border-white/10">
              <ListVideo className="w-5 h-5" />
            </div>
            <div>
              <h3 className="leading-tight">Save to Playlist</h3>
              <p className="text-[11px] font-normal text-[#959ca3]">Click to toggle video in playlist</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-[#1c262b] text-[#959ca3] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Alert Message */}
        {toastMsg && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-zinc-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <Check className="w-4 h-4 shrink-0 stroke-[3]" />
            <span className="truncate">{toastMsg}</span>
          </div>
        )}

        {/* Playlists List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-zinc-400" />
            <p className="text-xs text-[#959ca3]">Loading your playlists...</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {playlists.length === 0 ? (
              <div className="text-center py-8 px-4 bg-[#0e1518]/50 rounded-2xl border border-dashed border-[#222d34]">
                <FolderPlus className="w-8 h-8 text-[#959ca3] mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-[#f9f8ff]">No playlists created yet</p>
                <p className="text-[11px] text-[#959ca3] mt-0.5">Create your first playlist below to save this video.</p>
              </div>
            ) : (
              playlists.map((playlist) => {
                const checked = isVideoInPlaylist(playlist);
                const isToggling = togglingId === playlist._id;
                const videoCount = playlist.videos?.length || 0;

                return (
                  <button
                    key={playlist._id}
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleTogglePlaylist(playlist)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border text-left cursor-pointer active:scale-[0.99] ${
                      checked
                        ? 'bg-white/5 border-white/15 text-white shadow-sm shadow-zinc-900/20'
                        : 'bg-[#0e1518]/60 border-[#222d34] hover:bg-[#1c262b] text-[#959ca3] hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <span className="text-xs font-semibold truncate text-[#f9f8ff]">
                        {playlist.name}
                      </span>
                      <span className="text-[10px] text-[#959ca3]">
                        {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isToggling ? (
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                      ) : (
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          checked 
                            ? 'bg-white border-white text-zinc-900' 
                            : 'border-[#222d34] bg-[#0e1518]'
                        }`}>
                          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Create inline form toggle & Done button */}
        {!showCreate ? (
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => setShowCreate(true)}
              className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 bg-white/5 hover:bg-white/10 active:scale-98 rounded-2xl transition border border-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold bg-white hover:bg-zinc-100 text-zinc-900 rounded-2xl shadow-md shadow-zinc-900/20 active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="mt-4 pt-4 border-t border-[#222d34] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>New Playlist Details</span>
            </div>
            
            <input
              type="text"
              required
              autoFocus
              placeholder="Playlist name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#222d34] bg-[#0e1518] text-[#f9f8ff] outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors"
            />
            
            <input
              type="text"
              placeholder="Description (optional)..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#222d34] bg-[#0e1518] text-[#f9f8ff] outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors"
            />
            
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="w-1/2 py-2.5 text-xs font-semibold border border-[#222d34] rounded-2xl text-[#959ca3] hover:text-white hover:bg-[#1c262b] transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="w-1/2 py-2.5 text-xs font-bold bg-white hover:bg-zinc-100 text-zinc-900 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-zinc-900/20 active:scale-95 transition-all"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />}
                <span>Create & Save</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SaveToPlaylistModal;
