import { useParams, Link } from 'react-router-dom'
import { useWork } from '../hooks/useWork'
import { useLang } from '../contexts/LangContext'
import styles from './WhatDetailPage.module.css'

const PLACEHOLDER_TAGS = ['Figma', 'Illustrator', 'After Effects']

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
]

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

      <div className={styles.hero}>
        <img
          src={PLACEHOLDER_IMAGES[data.id % PLACEHOLDER_IMAGES.length]}
          alt={data.title}
          className={styles.heroImg}
        />
      </div>

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

        <div className={styles.tags}>
          {PLACEHOLDER_TAGS.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.what.processTitle}</h2>
          <p className={styles.body}>{t.what.processBody}</p>
        </div>

        <div className={styles.gallery}>
          {PLACEHOLDER_IMAGES.map((src, i) => (
            <img key={i} src={src} alt={`${data.title} ${i + 1}`} className={styles.galleryImg} />
          ))}
        </div>
      </div>
    </main>
  )
}

export default WhatDetailPage
