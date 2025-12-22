import axios from 'axios';

// Create axios instance with default config
export const api = axios.create({
  baseURL: 'http://localhost:4000', // Base URL from existing fetch calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');

    console.log(token);

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = token;
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

      // Handle 401 Unauthorized - redirect to login
      // if (error.response.status === 401) {
      //   // Clear token and redirect to login
      //   localStorage.removeItem('token');
      //   window.location.href = Quries.CLIENT.AUTH.LOGIN;
      // }
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
    // НЕ устанавливаем Content-Type вручную - пусть браузер сделает это сам
    const response = await api.post(url, formData, {
      headers: {
        // Убираем Content-Type, браузер сам установит multipart/form-data с boundary
      },
    });
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