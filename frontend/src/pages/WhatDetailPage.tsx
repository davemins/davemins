import { useParams, Link } from 'react-router-dom'
import { useWork } from '../hooks/useWork'
import styles from './WhatDetailPage.module.css'

const PLACEHOLDER_TAGS = ['Figma', 'Illustrator', 'After Effects']

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
]

function WhatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading } = useWork(Number(id))

  if (loading) return null

  if (!data) {
    return (
      <main className={styles.main}>
        <p className={styles.notFound}>작업물을 찾을 수 없습니다.</p>
        <Link to="/what" className={styles.back}>← what</Link>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <Link to="/what" className={styles.back}>← what</Link>

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
              프로젝트 보기 ↗
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
          <h2 className={styles.sectionTitle}>작업 과정</h2>
          <p className={styles.body}>
            이 프로젝트는 초기 아이디어 스케치부터 최종 결과물까지 약 3주에 걸쳐 진행되었습니다.
            레퍼런스 수집 → 방향 설정 → 시안 제작 → 수정 → 최종 납품 순서로 작업했습니다.
          </p>
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
