const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// GET /api/movies - Get all movies with optional filtering
router.get('/', async (req, res) => {
  try {
    const {
      tag, // 'movie' or 'tvseries'
      genre,
      search,
      page = 1,
      limit = 50,
      sortBy = 'id',
      sortOrder = 'asc'
    } = req.query;

    // Build query object
    let query = {};

    // Filter by tag (movie/tvseries)
    if (tag && ['movie', 'tvseries'].includes(tag)) {
      query.tag = tag;
    }

    // Filter by genre
    if (genre) {
      query.genre = { $in: [genre] };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObject = { [sortBy]: sortDirection };

    // Execute query
    const movies = await Movie.find(query)
      .sort(sortObject)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Movie.countDocuments(query);

    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies'
    });
  }
});

// GET /api/movies/stats - Get movie statistics
router.get('/stats', async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments({ tag: 'movie' });
    const totalTVSeries = await Movie.countDocuments({ tag: 'tvseries' });
    
    // Get genre distribution
    const genreStats = await Movie.aggregate([
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top rated movies
    const topRated = await Movie.find()
      .sort({ imdb: -1 })
      .limit(5)
      .select('name imdb poster tag')
      .lean();

    res.json({
      success: true,
      data: {
        totalMovies,
        totalTVSeries,
        total: totalMovies + totalTVSeries,
        genreStats: genreStats.map(g => ({ genre: g._id, count: g.count })),
        topRated
      }
    });

  } catch (error) {
    console.error('Error fetching movie stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie statistics'
    });
  }
});

// GET /api/movies/genres - Get all unique genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await Movie.distinct('genre');
    
    res.json({
      success: true,
      data: genres.sort()
    });

  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genres'
    });
  }
});

// GET /api/movies/search - Advanced search
router.get('/search', async (req, res) => {
  try {
    const { q, tag, genre, minImdb, maxImdb } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let query = {
      $text: { $search: q.trim() }
    };

    // Add additional filters
    if (tag && ['movie', 'tvseries'].includes(tag)) {
      query.tag = tag;
    }

    if (genre) {
      query.genre = { $in: [genre] };
    }

    if (minImdb || maxImdb) {
      query.imdb = {};
      if (minImdb) query.imdb.$gte = parseFloat(minImdb);
      if (maxImdb) query.imdb.$lte = parseFloat(maxImdb);
    }

    // First try MongoDB text search (uses text indexes and stemming)
    const LIMIT = parseInt(req.query.limit) || 20;
    let movies = await Movie.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(LIMIT)
      .lean();

    // If we don't have enough results from text search, supplement with
    // prioritized partial matches (name -> about -> genre). This ensures
    // prefix matches on `name` rank highest, then `about`, then `genre`.
    if (q && q.trim().length > 0 && movies.length < LIMIT) {
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const prefix = q.trim();
      const nameRegex = new RegExp('^' + escapeRegex(prefix), 'i');
      const aboutRegex = new RegExp(escapeRegex(prefix), 'i');
      const genreRegex = new RegExp('^' + escapeRegex(prefix), 'i');

      // Build base filters (reapply tag/genre filter and imdb range)
      const buildBaseFilter = () => {
        let f = {};
        if (tag && ['movie', 'tvseries'].includes(tag)) f.tag = tag;
        if (genre) f.genre = { $in: [genre] };
        if (minImdb || maxImdb) {
          f.imdb = {};
          if (minImdb) f.imdb.$gte = parseFloat(minImdb);
          if (maxImdb) f.imdb.$lte = parseFloat(maxImdb);
        }
        return f;
      };

      const baseFilter = buildBaseFilter();

      // Keep track of already-returned _id values to avoid duplicates
      const seenIds = new Set(movies.map(m => String(m._id)));
      const remaining = LIMIT - movies.length;

      // Helper to run a query and append unique results
      const appendUnique = async (qFilter, maxResults) => {
        if (maxResults <= 0) return 0;
        if (!qFilter) return 0;
        const finalFilter = { ...baseFilter, ...qFilter };
        if (seenIds.size > 0) finalFilter._id = { $nin: Array.from(seenIds) };
        const res = await Movie.find(finalFilter).limit(maxResults).lean();
        for (const r of res) {
          const idStr = String(r._id);
          if (!seenIds.has(idStr)) {
            movies.push(r);
            seenIds.add(idStr);
          }
        }
        return res.length;
      };

      // 1) Name (prefix) matches
      await appendUnique({ name: { $regex: nameRegex } }, remaining);

      // Recalculate remaining
      let stillRemaining = LIMIT - movies.length;

      // 2) About (substring) matches
      if (stillRemaining > 0) {
        await appendUnique({ about: { $regex: aboutRegex } }, stillRemaining);
      }

      stillRemaining = LIMIT - movies.length;

      // 3) Genre (array element prefix) matches
      if (stillRemaining > 0) {
        await appendUnique({ genre: { $regex: genreRegex } }, stillRemaining);
      }
    }

    res.json({
      success: true,
      data: {
        movies,
        query: q,
        resultCount: movies.length
      }
    });

  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search movies'
    });
  }
});

// GET /api/movies/:id - Get single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ id: parseInt(req.params.id) });
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      data: movie
    });

  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie'
    });
  }
});

module.exports = router;