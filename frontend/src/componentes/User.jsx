import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getCurrentUserApi,
  updateAccountDetailsApi,
  changePasswordApi,
  updateUserAvatarApi,
  updateUserCoverImageApi,
} from '../utils/api';
import { login } from '../redux/slices/authSlice';
import { User as UserIcon, Camera, Key, Mail, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';

const User = () => {
  const dispatch = useDispatch();
  const { status: isLoggedIn, userData } = useSelector((state) => state.auth);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Status & Feedback States
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingCover, setLoadingCover] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || '');
      setEmail(userData.email || '');
    } else if (isLoggedIn) {
      getCurrentUserApi()
        .then((res) => {
          if (res.data) {
            dispatch(login({ userData: res.data }));
            setFullName(res.data.fullName || '');
            setEmail(res.data.email || '');
          }
        })
        .catch(console.error);
    }
  }, [userData, isLoggedIn, dispatch]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <UserIcon className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Sign in required</h2>
        <p className="text-sm text-zinc-500 max-w-sm mt-1">Please sign in to access and manage your account settings.</p>
      </div>
    );
  }

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setError(msg);
      setMessage(null);
    } else {
      setMessage(msg);
      setError(null);
    }
    setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 4000);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      setLoadingAccount(true);
      const res = await updateAccountDetailsApi({ fullName, email });
      dispatch(login({ userData: res.data }));
      showNotification('Account details updated successfully!');
    } catch (err) {
      showNotification(err.message || 'Failed to update account details', true);
    } finally {
      setLoadingAccount(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setLoadingPassword(true);
      await changePasswordApi({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      showNotification('Password changed successfully!');
    } catch (err) {
      showNotification(err.message || 'Failed to change password', true);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    try {
      setLoadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await updateUserAvatarApi(formData);
      dispatch(login({ userData: res.data }));
      setAvatarFile(null);
      showNotification('Avatar updated successfully!');
    } catch (err) {
      showNotification(err.message || 'Failed to update avatar', true);
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e) => {
    e.preventDefault();
    if (!coverFile) return;
    try {
      setLoadingCover(true);
      const formData = new FormData();
      formData.append('coverImage', coverFile);
      const res = await updateUserCoverImageApi(formData);
      dispatch(login({ userData: res.data }));
      setCoverFile(null);
      showNotification('Cover image updated successfully!');
    } catch (err) {
      showNotification(err.message || 'Failed to update cover image', true);
    } finally {
      setLoadingCover(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Account Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your personal profile, credentials, and imagery.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Account Info Form */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <UserIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Personal Information</h2>
        </div>

        <form onSubmit={handleUpdateAccount} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loadingAccount}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all disabled:opacity-50"
            >
              {loadingAccount ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <Key className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Security & Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Old Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title={showOldPassword ? "Hide password" : "Show password"}
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-red-500" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-red-500" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loadingPassword}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-red-600/25 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loadingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Avatar & Cover Image Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar Upload */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Camera className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Avatar Image</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
              {userData?.avatar ? (
                <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">U</div>
              )}
            </div>

            <form onSubmit={handleAvatarUpload} className="flex-1 space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950/40 dark:file:text-purple-300 hover:file:bg-purple-100"
              />
              <button
                type="submit"
                disabled={loadingAvatar || !avatarFile}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all"
              >
                {loadingAvatar ? 'Uploading...' : 'Upload Avatar'}
              </button>
            </form>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Camera className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Cover Image</h2>
          </div>

          <div className="h-16 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative">
            {userData?.coverImage ? (
              <img src={userData.coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">No cover image</div>
            )}
          </div>

          <form onSubmit={handleCoverUpload} className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-950/40 dark:file:text-teal-300 hover:file:bg-teal-100"
            />
            <button
              type="submit"
              disabled={loadingCover || !coverFile}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all"
            >
              {loadingCover ? 'Uploading...' : 'Upload Cover'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default User;
