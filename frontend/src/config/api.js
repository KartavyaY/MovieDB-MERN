import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - user may need to login');
    }
    return Promise.reject(error);
  }
);

// Movie API endpoints
export const movieAPI = {
  // Get all movies with filters
  getMovies: (params = {}) => api.get('/movies', { params }),
  
  // Get single movie
  getMovie: (id) => api.get(`/movies/${id}`),
  
  // Search movies
  searchMovies: (query, filters = {}) => 
    api.get('/movies/search', { params: { q: query, ...filters } }),
  
  // Get movie statistics
  getStats: () => api.get('/movies/stats'),
  
  // Get genres
  getGenres: () => api.get('/movies/genres'),
};

// User API endpoints
export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Create/update user profile
  updateProfile: (data) => api.post('/users/profile', data),
  
  // Get watchlist
  getWatchlist: () => api.get('/users/watchlist'),
  
  // Add to watchlist
  addToWatchlist: (movieId) => api.post('/users/watchlist', { movieId }),
  
  // Remove from watchlist
  removeFromWatchlist: (movieId) => api.delete(`/users/watchlist/${movieId}`),
  
  // Update preferences
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
};

export default api;