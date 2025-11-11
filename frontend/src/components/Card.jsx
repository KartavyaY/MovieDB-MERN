
import styles from './styles/stylesheet.module.css'

const Card = ({ movie, isInMyList, onToggleWatchLater }) => {
  const buttonText = isInMyList ? 'Remove from List' : 'Watch Later'
  const buttonClass = isInMyList ? `${styles.readmore} ${styles.remove}` : styles.readmore

  return (
    <div className={styles['card-container']}>
      <div className={styles.poster}>
        <img src={movie.poster} alt={movie.name} />

        <div className={styles.rating}>
          <div className={styles.imdb}
            style={{display: "flex", alignItems: "center", gap: "15px", fontFamily: "TASA Explorer, serif"}}>
            <img src="/images/imdb-square.png" alt="" style={{width: "40px"}}/>
            {movie.imdb}/10
          </div>
          <div className={styles.tomatometer}
            style={{display: "flex", alignItems: "center", gap: "15px", fontFamily: "TASA Explorer, serif"}}>
            <img src="/images/tomatometer.png" alt="" style={{width: "40px"}}/>
            {movie.tomatometer}
          </div>
          <div className={styles.metacritic}
            style={{display: "flex", alignItems: "center", gap: "15px", fontFamily: "TASA Explorer, serif"}}>
            <img src="/images/metacritic.png" alt="" style={{width: "40px"}}/>
            {movie.metacritic}
          </div>
          <a href={movie.trailer} target="_blank" rel="noopener noreferrer" style={{textDecoration: "none"}}>
            <div className={styles['yt-link']}
              style={{display: "flex", alignItems: "center", gap: "15px", fontFamily: "TASA Explorer, serif"}}>
              <img src="/images/yt-logo.png" alt="" style={{width: "40px"}}/>Watch Trailer
            </div>
          </a>
        </div>
      </div>

      <div className={styles['capsule-container']}>
        {movie.genre.map((genre, index) => (
          <div key={index} className={styles.capsule}>{genre}</div>
        ))}
      </div>

      <div className={styles.title}>{movie.name}</div>

      <div className={styles.about}>
        {movie.about}
      </div>
      
      <div 
        className={buttonClass}
        onClick={() => onToggleWatchLater(movie.id)}
        style={{ cursor: 'pointer' }}
      >
        {buttonText}
      </div>
    </div>
  )
}

export default Card