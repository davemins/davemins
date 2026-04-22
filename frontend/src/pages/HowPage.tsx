import { Link } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import styles from './HowPage.module.css'

function HowPage() {
  const { data, loading } = usePosts()

  if (loading) return null

  return (
    <main className={styles.main}>
      <ul className={styles.list}>
        {data.map((post) => (
          <li key={post.slug}>
            <Link to={`/how/${post.slug}`} className={styles.item}>
              <div className={styles.meta}>
                <time className={styles.date}>{post.publishedAt}</time>
              </div>
              <h2 className={styles.title}>{post.title}</h2>
              <p className={styles.summary}>{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default HowPage
