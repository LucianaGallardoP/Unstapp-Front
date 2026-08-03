import axios from 'axios';

const clearStoredSession = () => {
  localStorage.removeItem('unstapp_token');
  localStorage.removeItem('unstapp_token_expires_at');
  localStorage.removeItem('unstapp_user_id');
  localStorage.removeItem('unstapp_user_name');
  localStorage.removeItem('unstapp_user_roles');
  localStorage.removeItem('unstapp_user_avatar_url');
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://unstapp-api-staging.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url ?? '').toLowerCase();
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/verify-first-time') || requestUrl.includes('/auth/set-initial-password') || requestUrl.includes('/auth/forgot-password') || requestUrl.includes('/auth/reset-password') || requestUrl.includes('/auth/request-password-reset') || requestUrl.includes('/auth/recover-password');

    if (status === 401 && !isAuthRequest) {
      clearStoredSession();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login?session=expired');
      }
    }

    return Promise.reject(error);
  },
);
