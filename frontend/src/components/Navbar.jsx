import styles from './styles/stylesheet.module.css'
import { useAuth } from '../contexts/AuthContext'

const Navbar = ({ onFilterChange, onToggleSearch, onShowAuth }) => {
    const { currentUser, userProfile, logout } = useAuth()

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <>
        <nav className={styles.navbar}>
            <ul className={styles['navbar-links']}>
                <li>
                    <div id="homebtn" onClick={() => onFilterChange('all')}>Home</div>
                </li>
                <li>
                    <div id="moviebtn" onClick={() => onFilterChange('movie')}>Movies</div>
                </li>
                <li>
                    <div id="tvbtn" onClick={() => onFilterChange('tvseries')}>TV Series</div>
                </li>
                <li>
                    <div id="mylistbtn" onClick={() => onFilterChange('mylist')}>My List</div>
                </li>
                <li>
                    <div id="search-icon" onClick={onToggleSearch}>
                        <img src="/images/search-logo.png" alt="Search" style={{width: "23px", margin: "-3px 2px"}} />
                    </div>
                </li>
                <li>
                    {currentUser ? (
                        <div className={styles['user-profile']}>
                            {(userProfile?.photoURL || currentUser?.photoURL) ? (
                                <img 
                                    src={userProfile?.photoURL || currentUser?.photoURL} 
                                    alt={userProfile?.displayName || currentUser?.displayName}
                                    className={styles['user-avatar']}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={styles['user-avatar']} style={{
                                backgroundColor: '#0c54ed',
                                color: 'white',
                                display: (userProfile?.photoURL || currentUser?.photoURL) ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                                {(userProfile?.displayName || currentUser?.displayName || currentUser?.email)?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className={styles['user-name']}>
                                {(userProfile?.displayName || currentUser?.displayName || currentUser?.email)?.split(' ')[0]}
                            </span>
                            <button onClick={handleLogout} className={styles['logout-button']}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button onClick={onShowAuth} className={styles['login-button']}>
                            Login
                        </button>
                    )}
                </li>
            </ul>
        </nav>
        </>
    )
}

export default Navbar