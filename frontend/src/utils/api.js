const BASE_URL = import.meta.env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Token helpers (Supports both Authorization Header and HttpOnly cookies seamlessly)
export const getStoredAccessToken = () => {
  try {
    return localStorage.getItem('accessToken') || '';
  } catch (e) {
    return '';
  }
};

export const getStoredRefreshToken = () => {
  try {
    return localStorage.getItem('refreshToken') || '';
  } catch (e) {
    return '';
  }
};

export const setStoredTokens = (accessToken, refreshToken) => {
  try {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  } catch (e) {}
};

export const clearStoredTokens = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (e) {}
};

export const refreshAccessTokenApi = async () => {
  try {
    const refreshToken = getStoredRefreshToken();
    const headers = { 'Content-Type': 'application/json' };
    const body = refreshToken ? JSON.stringify({ refreshToken }) : undefined;

    const response = await fetch(`${BASE_URL}/users/refresh-token`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body,
    });
    if (!response.ok) {
      clearStoredTokens();
      return null;
    }
    const data = await response.json();
    if (data?.data?.accessToken) {
      setStoredTokens(data.data.accessToken, data.data.refreshToken);
    }
    return data;
  } catch (err) {
    clearStoredTokens();
    return null;
  }
};

/**
 * Enhanced fetch wrapper that:
 * 1. Automatically attaches Authorization: Bearer <token> if present
 * 2. Automatically includes credentials: 'include' for cookies
 * 3. Handles 401s by transparently refreshing the token and retrying the request once
 * 4. Dispatches 'unauthorized-request' if authentication fails completely
 */
export const requestApi = async (url, options = {}, skipAuthTrigger = false, isRetry = false) => {
  const token = getStoredAccessToken();
  const headers = { ...(options.headers || {}) };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (networkError) {
    throw new Error(networkError.message || 'Network connection error');
  }

  if (response.status === 401 && !isRetry) {
    const refreshed = await refreshAccessTokenApi();
    if (refreshed?.data?.accessToken) {
      // Retry once with new token
      return await requestApi(url, options, skipAuthTrigger, true);
    }

    if (!skipAuthTrigger) {
      clearStoredTokens();
      window.dispatchEvent(
        new CustomEvent('unauthorized-request', {
          detail: { message: 'Unauthorized access. Please log in or sign up.' },
        })
      );
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// --- User Authentication & Profile APIs ---

export const registerUserApi = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
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

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');

    // Store tokens locally so requests work flawlessly even if third-party cookies are blocked by browsers
    if (data?.data?.accessToken) {
      setStoredTokens(data.data.accessToken, data.data.refreshToken);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const logoutUserApi = async () => {
  try {
    const result = await requestApi(`${BASE_URL}/users/logout`, {
      method: 'POST',
    }, true);
    clearStoredTokens();
    return result;
  } catch (error) {
    clearStoredTokens();
    throw error;
  }
};

export const getCurrentUserApi = async () => {
  return await requestApi(`${BASE_URL}/users/current-user`, {
    method: 'GET',
  }, true);
};

export const updateAccountDetailsApi = async (accountData) => {
  return await requestApi(`${BASE_URL}/users/update-account`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(accountData),
  });
};

export const changePasswordApi = async (passwords) => {
  return await requestApi(`${BASE_URL}/users/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwords),
  });
};

export const updateUserAvatarApi = async (formData) => {
  return await requestApi(`${BASE_URL}/users/avatar`, {
    method: 'PATCH',
    body: formData,
  });
};

export const updateUserCoverImageApi = async (formData) => {
  return await requestApi(`${BASE_URL}/users/cover-image`, {
    method: 'PATCH',
    body: formData,
  });
};

export const getUserChannelProfileApi = async (username) => {
  return await requestApi(`${BASE_URL}/users/c/${username}`, {
    method: 'GET',
  });
};

export const getWatchHistoryApi = async () => {
  return await requestApi(`${BASE_URL}/users/history`, {
    method: 'GET',
  });
};

export const clearWatchHistoryApi = async () => {
  return await requestApi(`${BASE_URL}/users/history`, {
    method: 'DELETE',
  });
};

export const removeVideoFromWatchHistoryApi = async (videoId) => {
  return await requestApi(`${BASE_URL}/users/history/c/${videoId}`, {
    method: 'DELETE',
  });
};

// --- Tweet APIs ---

export const getAllTweetsApi = async () => {
  return await requestApi(`${BASE_URL}/tweets`, {
    method: 'GET',
  });
};

export const createTweetApi = async (content) => {
  return await requestApi(`${BASE_URL}/tweets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
};

export const getUserTweetsApi = async (userId) => {
  return await requestApi(`${BASE_URL}/tweets/user/${userId}`, {
    method: 'GET',
  });
};

export const updateTweetApi = async (tweetId, content) => {
  return await requestApi(`${BASE_URL}/tweets/${tweetId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
};

export const deleteTweetApi = async (tweetId) => {
  return await requestApi(`${BASE_URL}/tweets/${tweetId}`, {
    method: 'DELETE',
  });
};

export const toggleTweetLikeApi = async (tweetId) => {
  return await requestApi(`${BASE_URL}/likes/toggle/t/${tweetId}`, {
    method: 'POST',
  });
};

// --- Subscription APIs ---

export const toggleSubscriptionApi = async (channelId) => {
  return await requestApi(`${BASE_URL}/subscriptions/c/${channelId}`, {
    method: 'POST',
  });
};

export const getChannelSubscribersApi = async (channelId) => {
  return await requestApi(`${BASE_URL}/subscriptions/c/${channelId}`, {
    method: 'GET',
  });
};

export const getSubscribedChannelsApi = async (subscriberId) => {
  return await requestApi(`${BASE_URL}/subscriptions/u/${subscriberId}`, {
    method: 'GET',
  });
};

// --- Dashboard APIs ---

export const getChannelStatsApi = async () => {
  return await requestApi(`${BASE_URL}/dashboard/stats`, {
    method: 'GET',
  });
};

export const getChannelVideosApi = async () => {
  return await requestApi(`${BASE_URL}/dashboard/videos`, {
    method: 'GET',
  });
};

// --- Video APIs ---

export const getAllVideosApi = async (queryParams = '') => {
  return await requestApi(`${BASE_URL}/videos${queryParams}`, {
    method: 'GET',
  });
};

export const publishVideoApi = async (formData) => {
  return await requestApi(`${BASE_URL}/videos`, {
    method: 'POST',
    body: formData,
  });
};

export const getVideoByIdApi = async (videoId) => {
  return await requestApi(`${BASE_URL}/videos/${videoId}`, {
    method: 'GET',
  });
};

export const updateVideoApi = async (videoId, formData) => {
  return await requestApi(`${BASE_URL}/videos/${videoId}`, {
    method: 'PATCH',
    body: formData,
  });
};

export const deleteVideoApi = async (videoId) => {
  return await requestApi(`${BASE_URL}/videos/${videoId}`, {
    method: 'DELETE',
  });
};

export const togglePublishStatusApi = async (videoId) => {
  return await requestApi(`${BASE_URL}/videos/toggle/publish/${videoId}`, {
    method: 'PATCH',
  });
};

// --- Like APIs ---

export const toggleVideoLikeApi = async (videoId) => {
  return await requestApi(`${BASE_URL}/likes/toggle/v/${videoId}`, {
    method: 'POST',
  });
};

export const toggleCommentLikeApi = async (commentId) => {
  return await requestApi(`${BASE_URL}/likes/toggle/c/${commentId}`, {
    method: 'POST',
  });
};

export const getLikedVideosApi = async () => {
  return await requestApi(`${BASE_URL}/likes/videos`, {
    method: 'GET',
  });
};

// --- Comment APIs ---

export const getVideoCommentsApi = async (videoId, page = 1, limit = 10) => {
  return await requestApi(`${BASE_URL}/comments/${videoId}?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
};

export const addCommentApi = async (videoId, content) => {
  return await requestApi(`${BASE_URL}/comments/${videoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
};

export const updateCommentApi = async (commentId, content) => {
  return await requestApi(`${BASE_URL}/comments/c/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
};

export const deleteCommentApi = async (commentId) => {
  return await requestApi(`${BASE_URL}/comments/c/${commentId}`, {
    method: 'DELETE',
  });
};

// --- Playlist APIs ---

export const createPlaylistApi = async ({ name, description }) => {
  return await requestApi(`${BASE_URL}/playlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
};

export const getPlaylistByIdApi = async (playlistId) => {
  return await requestApi(`${BASE_URL}/playlist/${playlistId}`, {
    method: 'GET',
  });
};

export const updatePlaylistApi = async (playlistId, { name, description }) => {
  return await requestApi(`${BASE_URL}/playlist/${playlistId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
};

export const deletePlaylistApi = async (playlistId) => {
  return await requestApi(`${BASE_URL}/playlist/${playlistId}`, {
    method: 'DELETE',
  });
};

export const addVideoToPlaylistApi = async (videoId, playlistId) => {
  return await requestApi(`${BASE_URL}/playlist/add/${videoId}/${playlistId}`, {
    method: 'PATCH',
  });
};

export const removeVideoFromPlaylistApi = async (videoId, playlistId) => {
  return await requestApi(`${BASE_URL}/playlist/remove/${videoId}/${playlistId}`, {
    method: 'PATCH',
  });
};

export const getUserPlaylistsApi = async (userId) => {
  return await requestApi(`${BASE_URL}/playlist/user/${userId}`, {
    method: 'GET',
  });
};
