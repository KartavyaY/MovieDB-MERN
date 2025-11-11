import { useState } from 'react'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import styles from './styles/stylesheet.module.css'

const AuthModal = ({ isVisible, onClose }) => {
  const [isLogin, setIsLogin] = useState(true)

  if (!isVisible) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className={styles['auth-modal-overlay']} onClick={handleOverlayClick}>
      <div className={styles['auth-modal']}>
        <button 
          className={styles['close-button']} 
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        
        {isLogin ? (
          <LoginForm onToggleForm={toggleForm} onClose={onClose} />
        ) : (
          <SignUpForm onToggleForm={toggleForm} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

export default AuthModal