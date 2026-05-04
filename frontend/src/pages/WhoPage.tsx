import { useWho } from '../hooks/useWho'
import { useLang } from '../contexts/LangContext'
import styles from './WhoPage.module.css'

function WhoPage() {
  const { lang } = useLang()
  const { data, loading } = useWho(lang)

  if (loading) return null

  return (
    <main className={styles.main}>
      <section className={styles.profile}>
        <h1 className={styles.name}>{data?.name}</h1>
        <div className={styles.bio}>
          {data?.bio.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>MAKES</h2>
        <ul className={styles.pills}>
          {data?.makes.map((item) => (
            <li key={item} className={styles.pill}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>EXPERIENCE</h2>
        <ul className={styles.expList}>
          {data?.experience.map((exp, i) => (
            <li key={i} className={styles.expItem}>
              <span className={styles.expTitle}>{exp.title}</span>
              <span className={styles.expSep}>·</span>
              <span className={styles.expCompany}>@{exp.company}</span>
              <span className={styles.expSep}>·</span>
              <span className={styles.expPeriod}>{exp.period}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>LINKS</h2>
        <ul className={styles.links}>
          {data?.socialLinks.map(({ platform, url }) => (
            <li key={platform}>
              <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {platform} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default WhoPage
