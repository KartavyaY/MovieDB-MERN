import { useState, useEffect } from 'react'
import { movieAPI } from '../config/api'
import styles from './styles/stylesheet.module.css'

const GenreFilter = ({ isVisible, onClose, onApplyFilters, selectedGenres = [] }) => {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tempSelectedGenres, setTempSelectedGenres] = useState([...selectedGenres])

  // Fetch genres from API
  useEffect(() => {
    const fetchGenres = async () => {
      if (!isVisible) return
      
      setLoading(true)
      setError('')
      try {
        const response = await movieAPI.getGenres()
        setGenres(response.data.data || [])
      } catch (err) {
        console.error('Error fetching genres:', err)
        setError('Failed to load genres')
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [isVisible])

  // Reset temp selection when modal opens
  useEffect(() => {
    if (isVisible) {
      setTempSelectedGenres([...selectedGenres])
    }
  }, [isVisible, selectedGenres])

  if (!isVisible) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const toggleGenre = (genre) => {
    setTempSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre)
      } else {
        return [...prev, genre]
      }
    })
  }

  const handleApplyFilters = () => {
    console.log('GenreFilter: Applying filters with genres:', tempSelectedGenres)
    onApplyFilters(tempSelectedGenres)
    onClose()
  }

  const handleClearAll = () => {
    setTempSelectedGenres([])
  }

  const handleSelectAll = () => {
    setTempSelectedGenres([...genres])
  }

  return (
    <div className={styles['filter-modal-overlay']} onClick={handleOverlayClick}>
      <div className={styles['filter-modal']}>
        <div className={styles['filter-header']}>
          <h2 className={styles['filter-title']}>Filter</h2>
          <button 
            className={styles['close-button']} 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className={styles['error-message']}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles['loading-container']} style={{ display: 'flex' }}>
            <div className={styles['loading-spinner']}></div>
            <div className={styles['loading-text']}>Loading genres...</div>
          </div>
        ) : (
          <>
            <div className={styles['filter-actions']}>
              <button 
                className={styles['filter-action-button']} 
                onClick={handleSelectAll}
                disabled={tempSelectedGenres.length === genres.length}
              >
                Select All
              </button>
              <button 
                className={styles['filter-action-button']} 
                onClick={handleClearAll}
                disabled={tempSelectedGenres.length === 0}
              >
                Clear All
              </button>
            </div>

            <div className={styles['filter-content']}>
              <div className={styles['genre-grid']}>
                {genres.map((genre) => (
                  <div
                    key={genre}
                    className={`${styles['genre-checkbox-item']} ${
                      tempSelectedGenres.includes(genre) ? styles['selected'] : ''
                    }`}
                    onClick={() => toggleGenre(genre)}
                  >
                    <div className={styles['checkbox']}>
                      {tempSelectedGenres.includes(genre) && (
                        <span className={styles['checkmark']}>✓</span>
                      )}
                    </div>
                    <span className={styles['genre-label']}>{genre}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles['filter-footer']}>
              <div className={styles['selected-count']}>
                {tempSelectedGenres.length} of {genres.length} selected
              </div>
              <div className={styles['filter-buttons']}>
                <button 
                  className={styles['filter-apply-button']} 
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default GenreFilter