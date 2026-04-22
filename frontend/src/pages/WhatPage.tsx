import { useState } from 'react'
import { useWorks } from '../hooks/useWorks'
import type { WorkCategory } from '../types/what'
import styles from './WhatPage.module.css'

const CATEGORIES: { value: WorkCategory | undefined; label: string }[] = [
  { value: undefined, label: 'all' },
  { value: 'visual', label: 'visual' },
  { value: 'motion', label: 'motion' },
]

function WhatPage() {
  const [category, setCategory] = useState<WorkCategory | undefined>(undefined)
  const { data, loading } = useWorks('ko', category)

  return (
    <main className={styles.main}>
      <nav className={styles.tabs}>
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={label}
            className={category === value ? `${styles.tab} ${styles.active}` : styles.tab}
            onClick={() => setCategory(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      {loading ? null : (
        <ul className={styles.grid}>
          {data.map((item) => (
            <li key={item.id} className={styles.card}>
              <div className={styles.thumb} />
              <div className={styles.info}>
                <span className={styles.category}>{item.category}</span>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.desc}>{item.description}</p>
                <span className={styles.year}>{item.year}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default WhatPage
