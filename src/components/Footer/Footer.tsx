'use client';

import Link from 'next/link';
import Image from 'next/image'; 
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIconWrapper}>
              
              <Image 
                src="/logo/Logochef.svg" 
                alt="Logótipo Chef de Geladeira"
                width={24} 
                height={24}
                className={styles.logoImage} 
              />
            </div>
            <span>Chef de Geladeira</span>
          </Link>
          <p className={styles.copyright}>
            © {currentYear} Chef de Geladeira. Todos os direitos reservados.
          </p>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.legalLinks}>
            <Link href="/terms" className={styles.legalLink}>Termos de Serviço</Link>
            <Link href="/privacy" className={styles.legalLink}>Política de Privacidade</Link>
          </div>
          <a 
            href="https://kauedev-kauecavalcante1s-projects.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.powerByLink}
          >
            
              Powered by kaue.dev
          </a>
        </div>
      </div>
    </footer>
  );
}