import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Card from './components/Card'
import SearchContainer from './components/SearchContainer'
import LoadingSpinner from './components/LoadingSpinner'
import EmptyState from './components/EmptyState'
import AuthModal from './components/AuthModal'
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
  const [error, setError] = useState(null)

  // Auth context
  const { currentUser, userProfile, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth()

  // Fetch movies from API
  const fetchMovies = async (filters = {}) => {
    try {
      setError(null)
      const response = await movieAPI.getMovies(filters)
      const movieData = response.data.data.movies
      setMovies(movieData)
      setFilteredMovies(movieData)
    } catch (error) {
      console.error('Error fetching movies:', error)
      setError('Failed to load movies. Please try again.')
    } finally {
      setIsInitialLoading(false)
    }
  }

  // Search movies
  const searchMovies = async (query, filters = {}) => {
    try {
      setError(null)
      setIsLoading(true)
      
      if (!query.trim()) {
        await fetchMovies(filters)
        return
      }

      const response = await movieAPI.searchMovies(query, filters)
      const movieData = response.data.data.movies
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

  // Handle filter changes
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

  if (isInitialLoading) {
    return <LoadingSpinner isVisible={true} />
  }

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
