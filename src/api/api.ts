import axios from 'axios';

// Create axios instance with default config
// Resolve base URL from env for production; fallback to local dev
const API_BASE = (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000';
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

const LOGIN_PATH = '/login';

// Decode JWT exp and check freshness; be defensive on malformed tokens
const isTokenExpired = (token: string): boolean => {
  try {
    const raw = token.startsWith('Bearer ')
      ? token.slice(7)
      : token;
    const payloadPart = raw.split('.')[1];
    if (!payloadPart) return true;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    const expMs = payload?.exp ? payload.exp * 1000 : null;
    if (!expMs) return false;
    return Date.now() >= expMs;
  } catch (e) {
    console.warn('JWT decode failed', e);
    return true;
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const storedToken = localStorage.getItem('token');

    // Drop expired token early to avoid unnecessary 401
    if (storedToken && isTokenExpired(storedToken)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }

    // Normalize token to always include Bearer prefix (passport-jwt expects it)
    if (storedToken && !isTokenExpired(storedToken)) {
      const bearerToken = storedToken.startsWith('Bearer ')
        ? storedToken
        : `Bearer ${storedToken}`;

      if (!config.headers) config.headers = {} as any;
      config.headers.Authorization = bearerToken;
    }

    // Ensure proper Content-Type depending on payload
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (isFormData) {
      // Let the browser/axios set multipart/form-data with boundary automatically
      if (config.headers) {
        // Remove any preset content-type that would break FormData
        delete (config.headers as any)['Content-Type'];
        delete (config.headers as any)['content-type'];
      }
    } else {
      // Default JSON for non-FormData payloads
      if (config.headers) {
        (config.headers as any)['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const config: any = error?.config || {};

    // Auto-retry for transient network errors (status 0 / no response)
    const isTransientNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'));
    if (isTransientNetworkError) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const maxRetries = 2;
      if (config.__retryCount <= maxRetries) {
        const delay = 200 * config.__retryCount; // simple backoff
        return new Promise((resolve) => setTimeout(resolve, delay)).then(() => api(config));
      }
    }

    // Handle common errors
    if (error.response) {
      console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        if (window.location.pathname !== LOGIN_PATH) {
          window.location.href = LOGIN_PATH;
        }
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiService = {
  // GET request
  get: async (url: string) => {
    const response = await api.get(url);
    return response.data;
  },

  // POST request
  post: async (url: string, data: any) => {
    const response = await api.post(url, data);
    return response.data;
  },

  // POST request with FormData (for file uploads)
  postFormData: async (url: string, formData: FormData) => {
    const response = await api.post(url, formData);
    return response.data;
  },

  // PUT request
  put: async (url: string, data: any) => {
    const response = await api.put(url, data);
    return response.data;
  },

  // PATCH request
  patch: async (url: string, data?: any) => {
    const response = await api.patch(url, data);
    return response.data;
  },

  // DELETE request
  delete: async (url: string, data?: any) => {
    const response = await api.delete(url, { data });
    return response.data;
  }
};

export default api;