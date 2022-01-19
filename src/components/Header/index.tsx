import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  // TODO
  return (
    <header className={styles.header}>
      <Link href='/'>
        <a className={styles.headerContent} >
          <img src="/images/spacetravelling-logo.png" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
