import { useParams, Link } from 'react-router-dom'
import { useWork } from '../hooks/useWork'
import { useLang } from '../contexts/LangContext'
import styles from './WhatDetailPage.module.css'

function WhatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { lang, t } = useLang()
  const { data, loading } = useWork(Number(id), lang)

  if (loading) return null

  if (!data) {
    return (
      <main className={styles.main}>
        <p className={styles.notFound}>{t.what.notFound}</p>
        <Link to={`/${lang}/what`} className={styles.back}>{t.what.back}</Link>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <Link to={`/${lang}/what`} className={styles.back}>{t.what.back}</Link>

      {data.coverImage && (
        <div className={styles.cover}>
          <img src={data.coverImage} alt={data.title} className={styles.coverImg} />
        </div>
      )}

      <div className={styles.info}>
        <div className={styles.meta}>
          <span className={styles.category}>{data.category}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.year}>{data.year}</span>
        </div>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{data.title}</h1>
          {data.projectUrl && (
            <a href={data.projectUrl} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
              {t.what.projectLink}
            </a>
          )}
        </div>

        <p className={styles.desc}>{data.description}</p>

        {data.tags.length > 0 && (
          <div className={styles.tags}>
            {data.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {data.content && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.what.processTitle}</h2>
            <p className={styles.body}>{data.content}</p>
          </div>
        )}

        {data.images.length > 0 && (
          <div className={styles.board}>
            {data.images.map((src, i) => (
              <img key={i} src={src} alt={`${data.title} ${i + 1}`} className={styles.boardImg} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default WhatDetailPage
