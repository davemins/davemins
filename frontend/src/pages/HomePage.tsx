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
        <p className={styles.name}>davemins</p>
        <p className={styles.tagline}>영상, 디자인, 코드로 이야기를 만듭니다.</p>
      </section>

      <nav className={styles.nav}>
        {LINKS.map(({ to, label, desc }) => (
          <Link key={to} to={to} className={styles.link}>
            <span className={styles.linkLabel}>{label}</span>
            <span className={styles.linkDesc}>{desc}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}

export default HomePage
