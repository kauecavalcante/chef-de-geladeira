'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Check, Loader2, Crown } from 'lucide-react';
import { db } from '@/firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 
import styles from './Pricing.module.css';

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null); 

  
  useEffect(() => {
    if (user) {
      const fetchUserPlan = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserPlan(userDoc.data().plan); // Guarda o plano ("free" ou "premium")
        }
      };
      fetchUserPlan();
    }
  }, [user]); 

  const handleSubscription = async () => {
    if (!user) {
      alert("Precisa de estar logado para fazer o upgrade.");
      router.push('/auth');
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao criar a subscrição.');
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  if (authLoading || (user && !userPlan)) {
    return <div className={styles.loadingScreen}>A carregar...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          &larr; Voltar à página principal
        </Link>
      </header>
      
      <main className={styles.mainContent}>
        <div className={styles.titleSection}>
          <h1>Escolha o plano ideal para si</h1>
          <p>Comece de graça e faça o upgrade quando precisar de mais.</p>
        </div>

        <div className={styles.plansGrid}>
          {/* Plano Gratuito */}
          <div className={`${styles.planCard} ${styles.freePlan}`}>
            <h2>Gratuito</h2>
            <p className={styles.price}>R$0<span className={styles.period}>/mês</span></p>
            <p className={styles.description}>Perfeito para experimentar e para uso casual.</p>
            <ul className={styles.featuresList}>
              <li><Check size={16} /> 10 gerações de receitas por mês</li>
              <li><Check size={16} /> Acesso ao histórico</li>
              <li><Check size={16} /> Suporte por e-mail</li>
            </ul>
            {userPlan === 'free' ? (
              <button className={styles.ctaButton} disabled>O seu plano atual</button>
            ) : (
              <button className={styles.ctaButton} disabled>Plano Gratuito</button>
            )}
          </div>

          {/* Plano Premium */}
          <div className={`${styles.planCard} ${styles.premiumPlan}`}>
            <div className={styles.badge}>Recomendado</div>
            <h2>Premium</h2>
            <p className={styles.price}>R$9,90<span className={styles.period}>/mês</span></p>
            <p className={styles.description}>Para os chefs mais criativos e uso ilimitado.</p>
            <ul className={styles.featuresList}>
              <li><Check size={16} /> Gerações de receitas ilimitadas</li>
              <li><Check size={16} /> Acesso ao histórico</li>
              <li><Check size={16} /> Suporte prioritário</li>
              <li><Check size={16} /> Acesso a funcionalidades futuras</li>
            </ul>
            {userPlan === 'premium' ? (
              <div className={styles.premiumActive}>
                <Crown size={16} />
                <span>O seu plano atual</span>
              </div>
            ) : (
              <button 
                className={`${styles.ctaButton} ${styles.premiumButton}`} 
                onClick={handleSubscription}
                disabled={loading}
              >
                {loading ? <Loader2 className={styles.spinner} /> : 'Fazer Upgrade'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}