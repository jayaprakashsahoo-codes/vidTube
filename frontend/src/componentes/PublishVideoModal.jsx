import React, { useState } from 'react';
import { publishVideoApi } from '../utils/api';
import { X, Upload, Film, Image } from 'lucide-react';

const PublishVideoModal = ({ isOpen, onClose, onSuccess = () => {} }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.videoFile) data.append('videoFile', formData.videoFile);
      if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

      const response = await publishVideoApi(data);
      if (typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
      onClose();
      // Reset form
      setFormData({ title: '', description: '', videoFile: null, thumbnail: null });
      if (response?.data?._id) {
        window.location.href = `/video/${response.data._id}`;
      }
    } catch (err) {
      setError(err.message || 'An error occurred while publishing the video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161e22] rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-[#222d34] relative text-[#f9f8ff]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#959ca3] hover:text-white hover:bg-[#1c262b] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-white/5 text-zinc-400 border border-white/10">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Upload New Video</h2>
            <p className="text-xs text-[#959ca3]">Share video content with your audience</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-900/40 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#959ca3] mb-1.5">
              Title <span className="text-zinc-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#222d34] bg-[#0e1518] text-[#f9f8ff] text-xs focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 outline-none transition-all"
              placeholder="Enter video title..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#959ca3] mb-1.5">
              Description <span className="text-zinc-400">*</span>
            </label>
            <textarea
              name="description"
              required
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#222d34] bg-[#0e1518] text-[#f9f8ff] text-xs focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 outline-none transition-all resize-none"
              placeholder="Describe what your video is about..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#959ca3] mb-1.5 flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-zinc-400" />
                <span>Video File *</span>
              </label>
              <input
                type="file"
                name="videoFile"
                accept="video/*"
                required
                onChange={handleChange}
                className="w-full text-xs text-[#959ca3]
                  file:mr-3 file:py-2 file:px-3
                  file:rounded-xl file:border-0
                  file:text-xs file:font-semibold
                  file:bg-[#1c262b] file:text-zinc-400
                  hover:file:bg-[#26333a]
                  transition-all cursor-pointer border border-[#222d34] rounded-2xl p-1 bg-[#0e1518]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#959ca3] mb-1.5 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-zinc-400" />
                <span>Thumbnail *</span>
              </label>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                required
                onChange={handleChange}
                className="w-full text-xs text-[#959ca3]
                  file:mr-3 file:py-2 file:px-3
                  file:rounded-xl file:border-0
                  file:text-xs file:font-semibold
                  file:bg-[#1c262b] file:text-zinc-400
                  hover:file:bg-[#26333a]
                  transition-all cursor-pointer border border-[#222d34] rounded-2xl p-1 bg-[#0e1518]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#222d34]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[#959ca3] hover:text-white hover:bg-[#1c262b] transition-colors border border-[#222d34]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{loading ? 'Uploading...' : 'Publish Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishVideoModal;
