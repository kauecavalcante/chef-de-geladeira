'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Check, Loader2, Crown } from 'lucide-react';
import { db } from '@/firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 
import { motion, Variants } from 'framer-motion';
import { Navbar } from '@/components/Navbar/Navbar';
import styles from './Pricing.module.css';

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null); 

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }
    
    const fetchUserPlan = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserPlan(userDoc.data().plan);
      }
    };
    fetchUserPlan();
  }, [user, authLoading, router]); 

  const handleSubscription = async () => {
    if (!user) {
      alert("Precisa de estar logado para fazer o upgrade.");
      router.push('/auth');
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/create-stripe-subscription', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao iniciar o checkout.');
      }
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; 
      }
    } catch (error: any) {
      console.error("Erro ao iniciar assinatura:", error);
      alert(`Ocorreu um erro: ${error.message}. Por favor, tente novamente.`);
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  if (authLoading || (user && userPlan === null)) {
    return <div className={styles.loadingScreen}><Loader2 className={styles.spinner} /></div>;
  }

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <motion.main 
          className={styles.mainContent}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className={styles.titleSection} variants={itemVariants}>
            <h1>Escolha o plano ideal para si</h1>
            <p>Comece de graça e faça o upgrade quando precisar de mais.</p>
          </motion.div>

          <div className={styles.plansGrid}>
            {/* Plano Gratuito */}
            <motion.div className={`${styles.planCard} ${styles.freePlan}`} variants={itemVariants}>
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
            </motion.div>

            {/* Plano Premium */}
            <motion.div className={`${styles.planCard} ${styles.premiumPlan}`} variants={itemVariants}>
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
            </motion.div>
          </div>
        </motion.main>
      </div>
    </>
  );
}