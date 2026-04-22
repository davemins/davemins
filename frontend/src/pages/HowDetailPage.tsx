import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePost } from '../hooks/usePost'
import { useLang } from '../contexts/LangContext'
import styles from './HowDetailPage.module.css'

function HowDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { lang, t } = useLang()
  const { data, loading } = usePost(slug ?? '', lang)

  if (loading) return null

  if (!data) {
    return (
      <main className={styles.main}>
        <p className={styles.notFound}>{t.how.notFound}</p>
        <Link to={`/${lang}/how`} className={styles.back}>{t.how.backToList}</Link>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <Link to={`/${lang}/how`} className={styles.back}>{t.how.back}</Link>

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
