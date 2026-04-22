import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.copy}>© {new Date().getFullYear()} davemins</span>
    </footer>
  )
}

export default Footer
