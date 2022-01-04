import styles from './header.module.scss';

export function Header() {
  // TODO
  return (
    <header className={styles.header}>
      <a className={styles.headerContent} href='/'>
        <img src="/images/spacetravelling-logo.png" alt="spacetravelling" />
      </a>
    </header>
  )
}
