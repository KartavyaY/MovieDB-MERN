import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Card from './components/Card'
import SearchContainer from './components/SearchContainer'
import LoadingSpinner from './components/LoadingSpinner'
import EmptyState from './components/EmptyState'
import AuthModal from './components/AuthModal'
import GenreFilter from './components/GenreFilter'
import Carousel from './components/Carousel'
import { movieAPI } from './config/api'
import styles from './components/styles/stylesheet.module.css'

// Main App component wrapped in auth
const AppContent = () => {
  // State management
  const [movies, setMovies] = useState([])
  const [filteredMovies, setFilteredMovies] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false)
  const [isGenreFilterVisible, setIsGenreFilterVisible] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [error, setError] = useState(null)

  // Auth context
  const { currentUser, userProfile, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth()

  // Fetch movies from API
  const fetchMovies = async (filters = {}, genreFilters = null) => {
    try {
      setError(null)
      
      const response = await movieAPI.getMovies(filters)
      const movieData = response.data.data.movies
      
      // Use passed genreFilters or current selectedGenres
      const genres = genreFilters !== null ? genreFilters : selectedGenres

      // Helper to sort movies by how many selected genres they include
      const sortByMatchCount = (list, genresList) => {
        if (!genresList || genresList.length === 0) return list
        return list
          .map(m => ({
            movie: m,
            __matchCount: (m.genre || []).filter(g => genresList.includes(g)).length
          }))
          .filter(x => x.__matchCount > 0)
          .sort((a, b) => b.__matchCount - a.__matchCount)
          .map(x => x.movie)
      }

      // Apply genre filters if any are selected and not on mylist
      if (genres.length > 0 && currentFilter !== 'mylist') {
        // Filter by selected genres (movies that have at least one of the selected genres)
        const genreFilteredMovies = movieData.filter(movie => {
          const movieGenres = movie.genre || []
          return movieGenres.some(genre => genres.includes(genre))
        })

        const sorted = sortByMatchCount(genreFilteredMovies, genres)
        setMovies(movieData)
        setFilteredMovies(sorted)
      } else {
        setMovies(movieData)
        setFilteredMovies(movieData)
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
      setError('Failed to load movies. Please try again.')
    } finally {
      setIsInitialLoading(false)
    }
  }

  // Search movies
  const searchMovies = async (query, filters = {}, genreFilters = null) => {
    try {
      setError(null)
      setIsLoading(true)
      
      if (!query.trim()) {
        await fetchMovies(filters, genreFilters)
        return
      }

      const response = await movieAPI.searchMovies(query, filters)
      let movieData = response.data.data.movies
      
      // Use passed genreFilters or current selectedGenres
      const genres = genreFilters !== null ? genreFilters : selectedGenres

      // When filtering by genres, prioritize movies with more matches
      if (genres.length > 0) {
        const withMatches = movieData
          .map(m => ({
            movie: m,
            __matchCount: (m.genre || []).filter(g => genres.includes(g)).length
          }))
          .filter(x => x.__matchCount > 0)
          .sort((a, b) => b.__matchCount - a.__matchCount)
          .map(x => x.movie)

        movieData = withMatches
      }

      setFilteredMovies(movieData)
    } catch (error) {
      console.error('Error searching movies:', error)
      setError('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchMovies()
  }, [])
  const handleFilterChange = async (filter) => {
    setCurrentFilter(filter)
    clearSearch()

    if (filter === 'mylist') {
      // Use user's watchlist
      if (userProfile?.watchlist) {
        setFilteredMovies(userProfile.watchlist)
      } else {
        setFilteredMovies([])
      }
    } else {
      // Fetch from API with filter
      const filters = {}
      if (filter !== 'all') {
        filters.tag = filter
      }
      await fetchMovies(filters)
    }
  }

  // Handle search functionality
  const handleSearchChange = (event) => {
    const term = event.target.value
    setSearchTerm(term)

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (term.trim()) {
      setIsLoading(true)
      const newTimeout = setTimeout(async () => {
        const filters = {}
        if (currentFilter !== 'all' && currentFilter !== 'mylist') {
          filters.tag = currentFilter
        }
        await searchMovies(term, filters)
      }, 500)
      setSearchTimeout(newTimeout)
    } else {
      // If search is cleared, reload current filter
      handleFilterChange(currentFilter)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setIsLoading(false)
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  }

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible)
    if (isSearchVisible) {
      clearSearch()
    }
  }

  const hideSearch = () => {
    setIsSearchVisible(false)
    clearSearch()
  }

  // Handle My List functionality
  const toggleWatchLater = async (movieId) => {
    if (!currentUser) {
      setIsAuthModalVisible(true)
      return
    }

    try {
      if (isInWatchlist(movieId)) {
        await removeFromWatchlist(movieId)
      } else {
        await addToWatchlist(movieId)
      }

      // If we're viewing My List, update the filtered movies
      if (currentFilter === 'mylist') {
        handleFilterChange('mylist')
      }
    } catch (error) {
      console.error('Error updating watchlist:', error)
      setError('Failed to update watchlist. Please try again.')
    }
  }

  const showAuth = () => {
    setIsAuthModalVisible(true)
  }

  const hideAuth = () => {
    setIsAuthModalVisible(false)
  }

  // Genre filter functions
  const showGenreFilter = () => {
    setIsGenreFilterVisible(true)
  }

  const hideGenreFilter = () => {
    setIsGenreFilterVisible(false)
  }

  const applyGenreFilters = async (genres) => {
    setSelectedGenres(genres)
    
    // Refresh current view with genre filters applied immediately
    if (searchTerm.trim()) {
      // If we're currently searching, re-run search with new genre filters
      const filters = {}
      if (currentFilter !== 'all' && currentFilter !== 'mylist') {
        filters.tag = currentFilter
      }
      await searchMovies(searchTerm, filters, genres)
    } else {
      // If not searching, refresh the current filter with new genre filters
      const filters = {}
      if (currentFilter !== 'all' && currentFilter !== 'mylist') {
        filters.tag = currentFilter
      }
      
      if (currentFilter === 'mylist') {
        // For watchlist, filter user's watchlist by genres
        if (userProfile?.watchlist) {
          if (genres.length > 0) {
            const genreFilteredWatchlist = userProfile.watchlist
              .map(m => ({ movie: m, __matchCount: (m.genre || []).filter(g => genres.includes(g)).length }))
              .filter(x => x.__matchCount > 0)
              .sort((a, b) => b.__matchCount - a.__matchCount)
              .map(x => x.movie)

            setFilteredMovies(genreFilteredWatchlist)
          } else {
            setFilteredMovies(userProfile.watchlist)
          }
        } else {
          setFilteredMovies([])
        }
      } else {
        // For regular categories, fetch with genre filters
        await fetchMovies(filters, genres)
      }
    }
  }

  // Handle filter changes

  return (
    <>
      <Navbar 
        onFilterChange={handleFilterChange}
        onToggleSearch={toggleSearch}
        onShowAuth={showAuth}
      />
      
      <SearchContainer
        isVisible={isSearchVisible}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClear={clearSearch}
        onHide={hideSearch}
      />

      {/* Active Filters Display - only show when filters are applied */}
      {selectedGenres.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '20px 0',
          gap: '15px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            alignItems: 'center',
            maxWidth: '600px',
            justifyContent: 'center'
          }}>
            <span style={{ 
              fontSize: '14px', 
              color: '#666', 
              fontFamily: 'TASA Explorer, serif',
              marginRight: '5px'
            }}>
              Active filters:
            </span>
            {selectedGenres.map(genre => (
              <span key={genre} className={styles['capsule']}>
                {genre}
              </span>
            ))}
            <button
              onClick={() => applyGenreFilters([])}
              style={{
                background: 'none',
                border: 'none',
                color: '#0c54ed',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
                fontFamily: 'TASA Explorer, serif'
              }}
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '20px',
          background: '#ffe6e6',
          color: '#d63384',
          textAlign: 'center',
          margin: '20px auto',
          maxWidth: '500px',
          borderRadius: '10px',
          fontFamily: 'TASA Explorer, serif'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#d63384', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <LoadingSpinner isVisible={isLoading} />

      {/* Carousel - only show when not loading and not searching and on main views */}
      {!isLoading && !searchTerm.trim() && currentFilter !== 'mylist' && filteredMovies.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 50px' }}>
          <Carousel 
            movies={movies} 
            currentUser={currentUser}
            isInWatchlist={isInWatchlist}
            onToggleWatchLater={toggleWatchLater}
            onShowAuth={showAuth}
          />
        </div>
      )}

      {!isLoading && (
        <div className={styles.wrapper}>
          {currentFilter === 'mylist' && filteredMovies.length === 0 ? (
            currentUser ? (
              <EmptyState />
            ) : (
              <div className={styles['empty-state']}>
                <div className={styles['empty-icon']}>🔐</div>
                <div className={styles['empty-title']}>Login Required</div>
                <div className={styles['empty-description']}>
                  Please log in to view and manage your personal watch list.
                </div>
                <button onClick={showAuth} className={styles['auth-button']} style={{ marginTop: '20px' }}>
                  Sign In
                </button>
              </div>
            )
          ) : (
            filteredMovies.map(movie => (
              <Card
                key={movie.id}
                movie={movie}
                isInMyList={currentUser ? isInWatchlist(movie.id) : false}
                onToggleWatchLater={toggleWatchLater}
              />
            ))
          )}
        </div>
      )}

      <AuthModal 
        isVisible={isAuthModalVisible}
        onClose={hideAuth}
      />

      <GenreFilter
        isVisible={isGenreFilterVisible}
        onClose={hideGenreFilter}
        onApplyFilters={applyGenreFilters}
        selectedGenres={selectedGenres}
      />

      {/* Fixed Floating Action Button for Filter */}
      <button 
        className={`${styles['fab-filter']} ${selectedGenres.length > 0 ? styles['fab-active'] : ''}`}
        onClick={showGenreFilter}
        title="Filter by Genres"
      >
        <img src="https://icons.iconarchive.com/icons/custom-icon-design/mono-general-4/512/filter-icon.png" alt="Filter" className={styles['fab-icon']} />
        {selectedGenres.length > 0 && (
          <span className={styles['fab-badge']}>{selectedGenres.length}</span>
        )}
      </button>
    </>
  )
}

// Root App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
