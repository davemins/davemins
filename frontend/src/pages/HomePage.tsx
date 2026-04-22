import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const LINKS = [
  { to: '/who', label: 'who', desc: '어떤 사람인지' },
  { to: '/what', label: 'what', desc: '무엇을 만들었는지' },
  { to: '/how', label: 'how', desc: '어떻게 생각하는지' },
]

function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <h1 className={styles.name}>davemins</h1>
        <p className={styles.tagline}>영상, 디자인, 코드로<br />이야기를 만듭니다.</p>
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
