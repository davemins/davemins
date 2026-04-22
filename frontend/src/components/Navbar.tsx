import { NavLink, useLocation } from 'react-router-dom'
import { isValidLang, LANGS } from '../i18n'
import type { Lang } from '../i18n'
import styles from './Navbar.module.css'

const NAV_ITEMS = [
  { path: 'who', label: 'who' },
  { path: 'what', label: 'what' },
  { path: 'how', label: 'how' },
]

function Navbar() {
  const location = useLocation()
  const parts = location.pathname.split('/')
  const rawLang = parts[1]
  const currentLang: Lang = isValidLang(rawLang) ? rawLang : 'ko'

  const switchLangPath = (lang: Lang) => {
    const next = [...parts]
    next[1] = lang
    return next.join('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to={`/${currentLang}`} className={styles.logo}>
          davemins
        </NavLink>
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={`/${currentLang}/${path}`}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {label}
            </NavLink>
          ))}
          <div className={styles.langs}>
            {LANGS.map(lang => (
              <NavLink
                key={lang}
                to={switchLangPath(lang)}
                className={({ isActive }) =>
                  isActive ? `${styles.langBtn} ${styles.langActive}` : styles.langBtn
                }
              >
                {lang}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
