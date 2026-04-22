import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePost } from '../hooks/usePost'
import styles from './HowDetailPage.module.css'

function HowDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, loading } = usePost(slug ?? '')

  if (loading) return null

  if (!data) {
    return (
      <main className={styles.main}>
        <p className={styles.notFound}>글을 찾을 수 없습니다.</p>
        <Link to="/how" className={styles.back}>← 목록으로</Link>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <Link to="/how" className={styles.back}>← how</Link>

      <header className={styles.header}>
        <time className={styles.date}>{data.publishedAt}</time>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.summary}>{data.summary}</p>
      </header>

      <article className={styles.article}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.content}
        </ReactMarkdown>
      </article>
    </main>
  )
}

export default HowDetailPage
