'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChefHat, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const menuVariants: Variants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIconWrapper}>
            <ChefHat className={styles.logoIcon} />
          </div>
          <span>Chef de Geladeira</span>
        </Link>

        
        <nav className={styles.desktopNav}>
          <Link href="/" className={styles.navLink}>Início</Link> 
          <Link href="/history" className={styles.navLink}>Minhas Receitas</Link>
          <Link href="/account" className={styles.navLink}>Minha Conta</Link>
          <button onClick={handleLogout} className={styles.logoutButton}>Sair</button>
        </nav>

        
        <button className={styles.mobileMenuButton} onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.overlay}
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.nav
                className={styles.mobileNav}
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className={styles.mobileNavHeader}>
                  <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
                    <div className={styles.logoIconWrapper}>
                      <ChefHat className={styles.logoIcon} />
                    </div>
                    <span>Chef de Geladeira</span>
                  </Link>
                  <button onClick={() => setIsMenuOpen(false)}>
                    <X size={24} />
                  </button>
                </div>
                <div className={styles.mobileNavLinks}>
                  <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Início</Link> {/* Link adicionado */}
                  <Link href="/history" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Minhas Receitas</Link>
                  <Link href="/account" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Minha Conta</Link>
                  <button onClick={handleLogout} className={styles.logoutButton}>Sair</button>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}