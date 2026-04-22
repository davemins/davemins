import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

const NAV_ITEMS = [
  { to: '/who', label: 'who' },
  { to: '/what', label: 'what' },
  { to: '/how', label: 'how' },
]

function Navbar() {
  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.logo}>
        davemins
      </NavLink>
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Navbar
