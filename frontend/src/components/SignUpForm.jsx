import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './styles/stylesheet.module.css'

const SignUpForm = ({ onToggleForm, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signup, signinWithGoogle, error, setError } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.displayName) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      await signup(formData.email, formData.password, formData.displayName)
      onClose()
    } catch (error) {
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      await signinWithGoogle()
      onClose()
    } catch (error) {
      console.error('Google sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles['auth-form']}>
      <h2>Create Account</h2>
      
      {error && (
        <div className={styles['error-message']}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Enter your name"
            disabled={isLoading}
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className={styles['auth-button']}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className={styles['divider']}>or</div>

      <button 
        onClick={handleGoogleSignUp}
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
        Already have an account?{' '}
        <button onClick={onToggleForm} className={styles['link-button']}>
          Sign In
        </button>
      </p>
    </div>
  )
}

export default SignUpForm