'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import styles from './Success.module.css';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
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
      </div>
    </div>
  );
}