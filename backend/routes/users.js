const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movie');
const { verifyToken } = require('../middleware/auth');

// POST /api/users/profile - Create/Update user profile
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: uid,
        email: email || req.body.email,
        displayName: displayName || req.body.displayName,
        photoURL: photoURL || req.body.photoURL
      });
    } else {
      // Update existing user
      user.email = email || req.body.email;
      user.displayName = displayName || req.body.displayName;
      user.photoURL = photoURL || req.body.photoURL;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          watchlistCount: user.watchlist.length
        }
      }
    });

  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    });
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .populate('watchlist');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          watchlist: user.watchlist,
          preferences: user.preferences,
          watchlistCount: user.watchlist.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// GET /api/users/watchlist - Get user's watchlist
router.get('/watchlist', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .populate('watchlist');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        watchlist: user.watchlist
      }
    });

  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist'
    });
  }
});

// POST /api/users/watchlist - Add movie to watchlist
router.post('/watchlist', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }

    // Check if movie exists
    const movie = await Movie.findOne({ id: parseInt(movieId) });
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Find or create user
    let user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      user = new User({
        firebaseUid: req.user.uid,
        email: req.user.email,
        displayName: req.user.displayName || 'User',
        photoURL: req.user.photoURL,
        watchlist: []
      });
    }

    // Check if movie is already in watchlist
    if (user.watchlist.includes(movie._id)) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in watchlist'
      });
    }

    // Add movie to watchlist
    user.watchlist.push(movie._id);
    await user.save();

    res.json({
      success: true,
      data: {
        message: 'Movie added to watchlist',
        watchlistCount: user.watchlist.length
      }
    });

  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add movie to watchlist'
    });
  }
});

// DELETE /api/users/watchlist/:movieId - Remove movie from watchlist
router.delete('/watchlist/:movieId', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.params;

    // Check if movie exists
    const movie = await Movie.findOne({ id: parseInt(movieId) });
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Find user
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove movie from watchlist
    user.watchlist = user.watchlist.filter(id => !id.equals(movie._id));
    await user.save();

    res.json({
      success: true,
      data: {
        message: 'Movie removed from watchlist',
        watchlistCount: user.watchlist.length
      }
    });

  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove movie from watchlist'
    });
  }
});

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const { favoriteGenres, theme } = req.body;

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (favoriteGenres) user.preferences.favoriteGenres = favoriteGenres;
    if (theme && ['light', 'dark', 'auto'].includes(theme)) {
      user.preferences.theme = theme;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        message: 'Preferences updated',
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

module.exports = router;