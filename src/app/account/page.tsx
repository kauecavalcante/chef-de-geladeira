'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Loader2, Crown, XCircle } from 'lucide-react';
import styles from './Account.module.css';

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setSubscription(doc.data());
      }
      setLoading(false);
    });

    
    return () => unsubscribe();
  }, [user, authLoading, router]);

  const handleCancelSubscription = async () => {
    if (!user || !subscription?.mercadopago_subscription_id) return;

    setIsCancelling(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao cancelar a assinatura.');
      }
      
      alert('A sua assinatura foi cancelada com sucesso.');

    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao cancelar a sua assinatura. Por favor, tente novamente.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading || authLoading) {
    return <div className={styles.loadingScreen}>A carregar...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>&larr; Voltar</Link>
        <h1>A Minha Conta</h1>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.card}>
          <h2>A Minha Assinatura</h2>
          {subscription?.plan === 'premium' && subscription.subscription_status === 'authorized' ? (
            <div className={styles.statusActive}>
              <Crown size={20} />
              <span>Plano Premium Ativo</span>
            </div>
          ) : (
            <div className={styles.statusInactive}>
              <XCircle size={20} />
              <span>Plano Gratuito</span>
            </div>
          )}
          <p>
            {subscription?.plan === 'premium' 
              ? 'Obrigado por ser um membro Premium! Desfrute de todas as funcionalidades ilimitadas.'
              : 'Faça o upgrade para o plano Premium para ter acesso a receitas ilimitadas e funcionalidades exclusivas.'
            }
          </p>
          
          {subscription?.plan === 'premium' && (
            <button 
              className={styles.cancelButton}
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? <Loader2 className={styles.spinner} /> : 'Cancelar Assinatura'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}