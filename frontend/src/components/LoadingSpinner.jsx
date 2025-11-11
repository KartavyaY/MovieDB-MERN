import styles from './styles/stylesheet.module.css'

const LoadingSpinner = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className={styles['loading-container']} style={{ display: 'flex' }}>
      <div className={styles['loading-spinner']}></div>
      <div className={styles['loading-text']}>Searching...</div>
    </div>
  )
}

export default LoadingSpinner