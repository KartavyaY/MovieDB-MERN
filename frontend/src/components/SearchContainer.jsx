import { useEffect, useRef } from 'react'
import styles from './styles/stylesheet.module.css'

const SearchContainer = ({ 
  isVisible, 
  searchTerm, 
  onSearchChange, 
  onClear, 
  onHide 
}) => {
  const inputRef = useRef(null)

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && 
          !event.target.closest(`.${styles['search-container']}`) && 
          !event.target.closest('#search-icon')) {
        onHide()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isVisible, onHide])

  if (!isVisible) return null

  return (
    <div className={styles['search-container']} style={{ opacity: isVisible ? 1 : 0 }}>
      <input
        ref={inputRef}
        type="text"
        className={styles['search-input']}
        placeholder="Search movies and TV series..."
        value={searchTerm}
        onChange={onSearchChange}
      />
      <button className={styles['clear-search']} onClick={onClear}>×</button>
    </div>
  )
}

export default SearchContainer