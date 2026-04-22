import { useWho } from '../hooks/useWho'
import styles from './WhoPage.module.css'

function WhoPage() {
  const { data, loading } = useWho()

  if (loading) return null

  return (
    <main className={styles.main}>
      <section className={styles.profile}>
        <h1 className={styles.name}>{data?.name}</h1>
        <p className={styles.role}>{data?.role}</p>
        <p className={styles.bio}>{data?.bio}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>skills</h2>
        <ul className={styles.skills}>
          {data?.skills.map((skill) => (
            <li key={skill} className={styles.skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>links</h2>
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
