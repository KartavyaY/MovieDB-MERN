require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

// Import movie data from the frontend data file
const movieData = require('../../frontend/src/data/movies.js').movies;

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-browser', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing movies
    await Movie.deleteMany({});
    console.log('🗑️  Cleared existing movie data');

    // Insert new movie data
    const movies = await Movie.insertMany(movieData);
    console.log(`📚 Inserted ${movies.length} movies into database`);

    // Create text indexes for search
    await Movie.collection.createIndex({
      name: 'text',
      about: 'text',
      genre: 'text'
    });
    console.log('🔍 Created text search indexes');

    // Display some stats
    const movieCount = await Movie.countDocuments({ tag: 'movie' });
    const tvCount = await Movie.countDocuments({ tag: 'tvseries' });
    
    console.log(`\n📊 Seeding Summary:`);
    console.log(`   Total Movies: ${movieCount}`);
    console.log(`   Total TV Series: ${tvCount}`);
    console.log(`   Total Items: ${movieCount + tvCount}`);
    
    // Get genre statistics
    const genreStats = await Movie.aggregate([
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`\n🎭 Genre Distribution:`);
    genreStats.forEach(genre => {
      console.log(`   ${genre._id}: ${genre.count}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('📤 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;