import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userAPI } from '../config/api';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Create user profile in backend
      await userAPI.updateProfile({ displayName: displayName || email });
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const signin = async (email, password) => {
    try {
      setError(null);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const signinWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Configure the provider to avoid COOP issues
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const { user } = await signInWithPopup(auth, provider);
      
      // Create/update user profile in backend
      await userAPI.updateProfile({
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      return user;
    } catch (error) {
      // Ignore COOP-related errors since they don't affect functionality
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request') {
        setError(error.message);
      }
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUserProfile(response.data.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If profile doesn't exist, create it
      if (error.response?.status === 404 && currentUser) {
        try {
          await userAPI.updateProfile({
            displayName: currentUser.displayName || currentUser.email,
            photoURL: currentUser.photoURL
          });
          fetchUserProfile(); // Retry
        } catch (createError) {
          console.error('Error creating user profile:', createError);
        }
      }
    }
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    try {
      setError(null);
      const response = await userAPI.updateProfile(data);
      setUserProfile(response.data.data.user);
      return response.data.data.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Watchlist functions
  const addToWatchlist = async (movieId) => {
    try {
      await userAPI.addToWatchlist(movieId);
      // Refresh user profile to update watchlist
      await fetchUserProfile();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      await userAPI.removeFromWatchlist(movieId);
      // Refresh user profile to update watchlist
      await fetchUserProfile();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Check if movie is in user's watchlist
  const isInWatchlist = (movieId) => {
    if (!userProfile?.watchlist) return false;
    return userProfile.watchlist.some(movie => movie.id === parseInt(movieId));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from backend
        await fetchUserProfile();
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signup,
    signin,
    signinWithGoogle,
    logout,
    updateUserProfile,
    fetchUserProfile,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};