import styles from './styles/stylesheet.module.css'

const EmptyState = () => {
  return (
    <div className={styles['empty-state']}>
      <div className={styles['empty-icon']}>📺</div>
      <div className={styles['empty-title']}>Your Watch List is Empty</div>
      <div className={styles['empty-description']}>
        Start adding movies and TV series to your watch list by clicking the "Watch Later" button on any card.
      </div>
    </div>
  )
}

export default EmptyState