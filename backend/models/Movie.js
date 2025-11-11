const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  tag: {
    type: String,
    required: true,
    enum: ['movie', 'tvseries'],
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  genre: [{
    type: String,
    required: true,
    index: true
  }],
  about: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    required: true
  },
  imdb: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  tomatometer: {
    type: String,
    required: true
  },
  metacritic: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  trailer: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create text indexes for search functionality
movieSchema.index({
  name: 'text',
  about: 'text',
  genre: 'text'
});

module.exports = mongoose.model('Movie', movieSchema);