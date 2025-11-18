import { useState, useEffect } from 'react'
import styles from './styles/stylesheet.module.css'

const Carousel = ({ movies = [], currentUser, isInWatchlist, onToggleWatchLater, onShowAuth }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Get featured movies (top 5 highest rated)
  const featuredMovies = movies
    .filter(movie => movie.poster && movie.imdb >= 8.0)
    .sort((a, b) => b.imdb - a.imdb)
    .slice(0, 5)

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredMovies.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredMovies.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, featuredMovies.length])

  // Navigate to specific slide
  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false) // Pause auto-play when user interacts
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10 seconds
  }

  // Navigate next/previous
  const nextSlide = () => {
    goToSlide((currentSlide + 1) % featuredMovies.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + featuredMovies.length) % featuredMovies.length)
  }

  if (featuredMovies.length === 0) {
    return null // Don't render carousel if no featured movies
  }

  const currentMovie = featuredMovies[currentSlide]

  return (
    <div className={styles['carousel-container']}>
      <div className={styles['carousel-slide']}>
        {/* Background image */}
        <div 
          className={styles['carousel-background']}
          style={{
            backgroundImage: `url(${currentMovie.poster})`,
          }}
        />
        
        {/* Content overlay */}
        <div className={styles['carousel-content']}>
          <div className={styles['carousel-info']}>
            <div className={styles['carousel-tag']}>
              {currentMovie.tag === 'movie' ? 'Movie' : 'TV Series'}
            </div>
            
            <h1 className={styles['carousel-title']}>{currentMovie.name}</h1>
            
            <div className={styles['carousel-meta']}>
              <div className={styles['carousel-ratings']}>
                <div className={styles['carousel-imdb']}>
                  <img src="/images/imdb-square.png" alt="IMDB" />
                  {currentMovie.imdb}/10
                </div>
                <div className={styles['carousel-tomatometer']}>
                  <img src="/images/tomatometer.png" alt="Rotten Tomatoes" />
                  {currentMovie.tomatometer}
                </div>
                <div className={styles['carousel-metacritic']}>
                  <img src="/images/metacritic.png" alt="Metacritic" />
                  {currentMovie.metacritic}
                </div>
              </div>
            </div>
            
            <div className={styles['carousel-genres']}>
              {currentMovie.genre?.slice(0, 3).map((genre) => (
                <span key={genre} className={styles['carousel-genre']}>
                  {genre}
                </span>
              ))}
            </div>
            
            <p className={styles['carousel-description']}>
              {currentMovie.about}
            </p>
            
            <div className={styles['carousel-actions']}>
              <button 
                className={styles['carousel-btn-primary']}
                onClick={() => currentMovie.trailer && window.open(currentMovie.trailer, '_blank')}
              >
                ▶ Watch Trailer
              </button>
              <button 
                className={styles['carousel-btn-secondary']}
                onClick={() => {
                  if (!currentUser) {
                    onShowAuth()
                    return
                  }
                  onToggleWatchLater(currentMovie.id)
                }}
              >
                {currentUser && isInWatchlist(currentMovie.id) ? '✓ In List' : '+ Add to List'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {featuredMovies.length > 1 && (
          <>
            <button 
              className={`${styles['carousel-nav']} ${styles['carousel-nav-prev']}`}
              onClick={prevSlide}
            >
              ‹
            </button>
            <button 
              className={`${styles['carousel-nav']} ${styles['carousel-nav-next']}`}
              onClick={nextSlide}
            >
              ›
            </button>
          </>
        )}

        {/* Dots indicator */}
        {featuredMovies.length > 1 && (
          <div className={styles['carousel-dots']}>
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`${styles['carousel-dot']} ${
                  index === currentSlide ? styles['active'] : ''
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Carousel