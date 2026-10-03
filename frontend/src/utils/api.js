const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const refreshAccessTokenApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    return null;
  }
};

/**
 * Centralized HTTP Response & Unauthorized Request Validator
 * Validates status code, attempts silent token refresh, and dispatches a global event for 401 Unauthorized responses
 */
const validateResponse = async (response, skipAuthTrigger = false) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (response.status === 401) {
    if (!skipAuthTrigger) {
      // Attempt silent token refresh
      const refreshed = await refreshAccessTokenApi();
      if (refreshed?.success) {
        // Refreshed successfully behind the scenes!
        return refreshed.data;
      }

      window.dispatchEvent(
        new CustomEvent('unauthorized-request', {
          detail: { message: data.message || 'Unauthorized access. Please log in or sign up.' },
        })
      );
    }
    throw new Error(data.message || 'Unauthorized access. Please log in or sign up.');
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const registerUserApi = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    return await validateResponse(response, true);
  } catch (error) {
    throw error;
  }
};

export const loginUserApi = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    return await validateResponse(response, true);
  } catch (error) {
    throw error;
  }
};

export const logoutUserApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return await validateResponse(response, true);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUserApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/current-user`, {
      credentials: 'include',
    });
    return await validateResponse(response, true);
  } catch (error) {
    throw error;
  }
};

export const updateAccountDetailsApi = async (accountData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/update-account`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(accountData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update account');
    return data;
  } catch (error) {
    throw error;
  }
};

export const changePasswordApi = async (passwords) => {
  try {
    const response = await fetch(`${BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(passwords),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to change password');
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUserAvatarApi = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/avatar`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update avatar');
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUserCoverImageApi = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/cover-image`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update cover image');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getUserChannelProfileApi = async (username) => {
  try {
    const response = await fetch(`${BASE_URL}/users/c/${username}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch channel profile');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getWatchHistoryApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/history`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch watch history');
    return data;
  } catch (error) {
    throw error;
  }
};

export const clearWatchHistoryApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/history`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to clear watch history');
    return data;
  } catch (error) {
    throw error;
  }
};

export const removeVideoFromWatchHistoryApi = async (videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/history/c/${videoId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to remove video from history');
    return data;
  } catch (error) {
    throw error;
  }
};

// --- Tweet APIs ---

export const getAllTweetsApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tweets`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch tweets');
    return data;
  } catch (error) {
    throw error;
  }
};

export const createTweetApi = async (content) => {
  try {
    const response = await fetch(`${BASE_URL}/tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to post tweet');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getUserTweetsApi = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/tweets/user/${userId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch tweets');
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateTweetApi = async (tweetId, content) => {
  try {
    const response = await fetch(`${BASE_URL}/tweets/${tweetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update tweet');
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteTweetApi = async (tweetId) => {
  try {
    const response = await fetch(`${BASE_URL}/tweets/${tweetId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete tweet');
    return data;
  } catch (error) {
    throw error;
  }
};

export const toggleTweetLikeApi = async (tweetId) => {
  try {
    const response = await fetch(`${BASE_URL}/likes/toggle/t/${tweetId}`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to toggle tweet like');
    return data;
  } catch (error) {
    throw error;
  }
};

// --- Subscription APIs ---

export const toggleSubscriptionApi = async (channelId) => {
  try {
    const response = await fetch(`${BASE_URL}/subscriptions/c/${channelId}`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to toggle subscription');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getChannelSubscribersApi = async (channelId) => {
  try {
    const response = await fetch(`${BASE_URL}/subscriptions/c/${channelId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch channel subscribers');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSubscribedChannelsApi = async (subscriberId) => {
  try {
    const response = await fetch(`${BASE_URL}/subscriptions/u/${subscriberId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch subscribed channels');
    return data;
  } catch (error) {
    throw error;
  }
};

// --- Dashboard APIs ---

export const getChannelStatsApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/stats`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch channel stats');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getChannelVideosApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/videos`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch channel videos');
    return data;
  } catch (error) {
    throw error;
  }
};

// --- Video APIs ---

export const getAllVideosApi = async (queryParams = '') => {
  try {
    const response = await fetch(`${BASE_URL}/videos${queryParams}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch videos');
    return data;
  } catch (error) {
    throw error;
  }
};

export const publishVideoApi = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/videos`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to publish video');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getVideoByIdApi = async (videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/videos/${videoId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch video');
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateVideoApi = async (videoId, formData) => {
  try {
    const response = await fetch(`${BASE_URL}/videos/${videoId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update video');
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteVideoApi = async (videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/videos/${videoId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete video');
    return data;
  } catch (error) {
    throw error;
  }
};

export const togglePublishStatusApi = async (videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/videos/toggle/publish/${videoId}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to toggle publish status');
    return data;
  } catch (error) {
    throw error;
  }
};

// --- Like APIs ---

export const toggleVideoLikeApi = async (videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/likes/toggle/v/${videoId}`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to toggle video like');
    return data;
  } catch (error) {
    throw error;
  }
};

export const toggleCommentLikeApi = async (commentId) => {
  try {
    const response = await fetch(`${BASE_URL}/likes/toggle/c/${commentId}`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to toggle comment like');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getLikedVideosApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/likes/videos`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch liked videos');
    return data;
  } catch (error) {
    throw error;
  }
};

// --- Comment APIs ---

export const getVideoCommentsApi = async (videoId, page = 1, limit = 10) => {
  try {
    const response = await fetch(`${BASE_URL}/comments/${videoId}?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch comments');
    return data;
  } catch (error) {
    throw error;
  }
};

export const addCommentApi = async (videoId, content) => {
  try {
    const response = await fetch(`${BASE_URL}/comments/${videoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add comment');
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCommentApi = async (commentId, content) => {
  try {
    const response = await fetch(`${BASE_URL}/comments/c/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update comment');
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCommentApi = async (commentId) => {
  try {
    const response = await fetch(`${BASE_URL}/comments/c/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete comment');
    return data;
  } catch (error) {
    throw error;
  }
};

// --- Playlist APIs ---

export const createPlaylistApi = async ({ name, description }) => {
  try {
    const response = await fetch(`${BASE_URL}/playlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create playlist');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getPlaylistByIdApi = async (playlistId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlist/${playlistId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch playlist');
    return data;
  } catch (error) {
    throw error;
  }
};

export const updatePlaylistApi = async (playlistId, { name, description }) => {
  try {
    const response = await fetch(`${BASE_URL}/playlist/${playlistId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update playlist');
    return data;
  } catch (error) {
    throw error;
  }
};

export const deletePlaylistApi = async (playlistId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlist/${playlistId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete playlist');
    return data;
  } catch (error) {
    throw error;
  }
};

export const addVideoToPlaylistApi = async (videoId, playlistId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlist/add/${videoId}/${playlistId}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add video to playlist');
    return data;
  } catch (error) {
    throw error;
  }
};

export const removeVideoFromPlaylistApi = async (videoId, playlistId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlist/remove/${videoId}/${playlistId}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to remove video from playlist');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getUserPlaylistsApi = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlist/user/${userId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch user playlists');
    return data;
  } catch (error) {
    throw error;
  }
};
