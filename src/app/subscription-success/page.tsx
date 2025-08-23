'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion'; 
import styles from './Success.module.css';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  
  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className={styles.pageContainer}>
      <motion.div 
        className={styles.card}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.iconWrapper}>
          <CheckCircle2 size={64} className={styles.successIcon} />
        </div>
        <h1 className={styles.title}>Assinatura Confirmada!</h1>
        <p className={styles.message}>
          Parabéns! Você agora é um membro Premium. Explore todas as funcionalidades ilimitadas do Chef de Geladeira.
        </p>
        <button 
          onClick={() => router.push('/')} 
          className={styles.ctaButton}
        >
          Começar a cozinhar
        </button>
      </motion.div>
    </div>
  );
}