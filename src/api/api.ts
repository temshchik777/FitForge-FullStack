import axios from 'axios';

// Create axios instance with default config
export const api = axios.create({
  baseURL: 'http://localhost:4000', // Base URL from existing fetch calls
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
    // Handle common errors here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);

      // Handle 401 Unauthorized - cleanup token and redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        if (window.location.pathname !== LOGIN_PATH) {
          window.location.href = LOGIN_PATH;
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
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
    // НЕ устанавливаем Content-Type вручную — пусть браузер выставит boundary сам
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