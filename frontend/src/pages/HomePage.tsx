import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import styles from './HomePage.module.css'

function HomePage() {
  const { lang, t } = useLang()

  const LINKS = [
    { to: `/${lang}/who`, label: 'who', desc: t.home.whoDesc },
    { to: `/${lang}/what`, label: 'what', desc: t.home.whatDesc },
    { to: `/${lang}/how`, label: 'how', desc: t.home.howDesc },
  ]

  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <h1 className={styles.name}>davemins</h1>
        <p className={styles.tagline}>
          {t.home.tagline.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>
      </section>

      <nav className={styles.nav}>
        {LINKS.map(({ to, label, desc }, i) => (
          <Link key={to} to={to} className={styles.link}>
            <span className={styles.index}>0{i + 1}</span>
            <span className={styles.linkLabel}>{label}</span>
            <span className={styles.linkDesc}>{desc}</span>
            <span className={styles.arrow}>→</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}

export default HomePage
