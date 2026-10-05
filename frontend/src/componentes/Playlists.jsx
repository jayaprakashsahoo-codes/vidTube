import React, { useState, useEffect } from 'react';
import { ListVideo, Plus, Trash2, Edit3, Film, Play, X, Check, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  getUserPlaylistsApi, 
  createPlaylistApi, 
  deletePlaylistApi, 
  updatePlaylistApi, 
  removeVideoFromPlaylistApi,
  getPlaylistByIdApi
} from '../utils/api';
import VideoCard from './VideoCard';

const Playlists = () => {
  const { userData } = useSelector((state) => state.auth);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Selected Playlist for viewing details
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [loadingActivePlaylist, setLoadingActivePlaylist] = useState(false);

  // Editing state
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userData?._id) {
      fetchPlaylists();
    } else {
      setLoading(false);
    }
  }, [userData]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUserPlaylistsApi(userData._id);
      setPlaylists(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      setCreating(true);
      const res = await createPlaylistApi({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim(),
      });
      setPlaylists(prev => [res.data, ...prev]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setIsCreateOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await deletePlaylistApi(playlistId);
      setPlaylists(prev => prev.filter(p => p._id !== playlistId));
      if (activePlaylist?._id === playlistId) {
        setActivePlaylist(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete playlist');
    }
  };

  const handleOpenPlaylistDetails = async (playlist) => {
    try {
      setLoadingActivePlaylist(true);
      const res = await getPlaylistByIdApi(playlist._id);
      setActivePlaylist(res.data || playlist);
    } catch (err) {
      setActivePlaylist(playlist);
    } finally {
      setLoadingActivePlaylist(false);
    }
  };

  const handleRemoveVideoFromPlaylist = async (videoId) => {
    if (!activePlaylist) return;
    try {
      await removeVideoFromPlaylistApi(videoId, activePlaylist._id);
      setActivePlaylist(prev => ({
        ...prev,
        videos: (prev.videos || []).filter(v => v._id !== videoId && v !== videoId)
      }));
      // Update in main playlists array count
      setPlaylists(prev => prev.map(p => {
        if (p._id === activePlaylist._id) {
          return {
            ...p,
            videos: (p.videos || []).filter(v => v._id !== videoId && v !== videoId)
          };
        }
        return p;
      }));
    } catch (err) {
      alert(err.message || 'Failed to remove video from playlist');
    }
  };

  const handleStartEdit = (playlist, e) => {
    e.stopPropagation();
    setEditingPlaylist(playlist);
    setEditName(playlist.name);
    setEditDesc(playlist.description || '');
  };

  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingPlaylist) return;

    try {
      setUpdating(true);
      const res = await updatePlaylistApi(editingPlaylist._id, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setPlaylists(prev => prev.map(p => p._id === editingPlaylist._id ? res.data : p));
      if (activePlaylist?._id === editingPlaylist._id) {
        setActivePlaylist(res.data);
      }
      setEditingPlaylist(null);
    } catch (err) {
      alert(err.message || 'Failed to update playlist');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Minimal Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-xl shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 shadow-xs shrink-0">
              <ListVideo className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                My Playlists
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Organize and curate your video collections
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-500 mt-4">Loading your playlists...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center text-rose-600 dark:text-rose-400">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && playlists.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60">
          <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-4">
            <Film className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No Playlists Created</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-2">
            Create playlists to organize videos by topic, mood, or series.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-2xl text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Your First Playlist
          </button>
        </div>
      )}

      {/* Playlists Grid */}
      {!loading && !error && playlists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => {
            const videoCount = playlist.videos?.length || 0;
            const firstVideo = playlist.videos?.[0];
            const thumbnailUrl = firstVideo?.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60';

            return (
              <div
                key={playlist._id}
                onClick={() => handleOpenPlaylistDetails(playlist)}
                className="group relative bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Thumbnail Preview Banner */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={thumbnailUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Playlist Overlay Icon & Count */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md">
                    <ListVideo className="w-3.5 h-3.5" />
                    <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartEdit(playlist, e)}
                      title="Edit Playlist"
                      className="p-2 rounded-xl bg-black/60 hover:bg-zinc-800 text-white backdrop-blur-md transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                      title="Delete Playlist"
                      className="p-2 rounded-xl bg-black/60 hover:bg-zinc-800 text-white backdrop-blur-md transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
                      {playlist.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                      {playlist.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span>Created {new Date(playlist.createdAt || Date.now()).toLocaleDateString()}</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      View Playlist →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Playlist Details Drawer / View Modal */}
      {activePlaylist && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{activePlaylist.name}</h2>
                <p className="text-xs text-zinc-500 mt-1">{activePlaylist.description}</p>
              </div>
              <button
                onClick={() => setActivePlaylist(null)}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Video list */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingActivePlaylist ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                </div>
              ) : !activePlaylist.videos || activePlaylist.videos.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  No videos in this playlist yet. Add videos from the video details page.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {activePlaylist.videos.map((vid) => {
                    const videoObj = typeof vid === 'object' ? vid : { _id: vid };
                    return (
                      <div key={videoObj._id} className="relative group">
                        <VideoCard video={videoObj} />
                        <button
                          onClick={() => handleRemoveVideoFromPlaylist(videoObj._id)}
                          title="Remove from Playlist"
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-zinc-800 text-white opacity-0 group-hover:opacity-100 transition z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Create New Playlist</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-zinc-500 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Favorite Music Videos"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of what this playlist contains..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newPlaylistName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Playlist</h3>
              <button onClick={() => setEditingPlaylist(null)} className="text-zinc-500 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating || !editName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
