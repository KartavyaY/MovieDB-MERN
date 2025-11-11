import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './styles/stylesheet.module.css'

const LoginForm = ({ onToggleForm, onClose }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signin, signinWithGoogle, error, setError } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      await signin(email, password)
      onClose()
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signinWithGoogle()
      onClose()
    } catch (error) {
      console.error('Google sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles['auth-form']}>
      <h2>Sign In</h2>
      
      {error && (
        <div className={styles['error-message']}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className={styles['auth-button']}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className={styles['divider']}>or</div>

      <button 
        onClick={handleGoogleSignIn}
        className={styles['google-button']}
        disabled={isLoading}
      >
        <img 
          src="/images/google-icon.svg" 
          alt="Google" 
          style={{ width: "20px", height: "20px" }}
        />
        Continue with Google
      </button>

      <p className={styles['auth-switch']}>
        Don't have an account?{' '}
        <button onClick={onToggleForm} className={styles['link-button']}>
          Sign Up
        </button>
      </p>
    </div>
  )
}

export default LoginForm