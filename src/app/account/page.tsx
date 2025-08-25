'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { Loader2, Crown, XCircle, AlertTriangle, Lock } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Navbar } from '@/components/Navbar/Navbar';
import toast from 'react-hot-toast'; 
import styles from './Account.module.css';

const DIETARY_OPTIONS = ['Vegetariana', 'Sem Glúten', 'Sem Lactose', 'Keto', 'Vegana'];

const AccountTab = ({ user, initialName }: { user: any, initialName: string }) => {
    const [displayName, setDisplayName] = useState(initialName);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setDisplayName(initialName);
    }, [initialName]);

    const handleSaveProfile = async () => {
        if (!user || !displayName.trim()) {
            toast.error("O nome não pode estar em branco.");
            return;
        }
        setIsSaving(true);
        try {
            const token = await user.getIdToken();
            await fetch('/api/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ displayName })
            });
            toast.success("Nome atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast.error("Não foi possível atualizar o seu nome.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.card}>
            <h2>Informações da Conta</h2>
            <div className={styles.formGroup}>
                <label htmlFor="name">Nome</label>
                <input
                    type="text"
                    id="name"
                    className={styles.input}
                    placeholder="Como gostaria de ser chamado?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    className={styles.input}
                    value={user?.email || ''}
                    disabled
                />
            </div>
            <button onClick={handleSaveProfile} className={styles.saveButton} disabled={isSaving}>
                {isSaving ? <Loader2 className={styles.spinner} /> : 'Salvar Alterações'}
            </button>
        </div>
    );
};

const PreferencesTab = ({ user, initialPreferences, isPremium }: { user: any, initialPreferences: string[], isPremium: boolean }) => {
    const [preferences, setPreferences] = useState(initialPreferences);
    const [isSaving, setIsSaving] = useState(false);

    const handlePreferenceChange = (preference: string) => {
        setPreferences(prev =>
          prev.includes(preference)
            ? prev.filter(p => p !== preference)
            : [...prev, preference]
        );
    };

    const handleSavePreferences = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const token = await user.getIdToken();
            await fetch('/api/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ dietaryPreferences: preferences })
            });
            toast.success("Preferências salvas com sucesso!");
        } catch (error) {
            toast.error("Ocorreu um erro ao salvar as preferências.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.card}>
            <h2>Preferências Alimentares</h2>
            <p>Selecione as suas restrições para receber receitas personalizadas.</p>

            {isPremium ? (
                <>
                    <div className={styles.preferencesWrapper}>
                        {DIETARY_OPTIONS.map(option => (
                            <div key={option} className={styles.switchWrapper}>
                                <label htmlFor={option}>{option}</label>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        id={option}
                                        checked={preferences.includes(option)}
                                        onChange={() => handlePreferenceChange(option)}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSavePreferences} disabled={isSaving} className={styles.saveButton}>
                        {isSaving ? <Loader2 className={styles.spinner} /> : 'Salvar Preferências'}
                    </button>
                </>
            ) : (
                <div className={styles.lockedFeature}>
                    <div className={styles.lockedIconWrapper}>
                        <Lock size={24} />
                    </div>
                    <h3>Funcionalidade Premium</h3>
                    <p>Faça o upgrade para personalizar as suas receitas com base nas suas restrições alimentares.</p>
                    <Link href="/pricing" className={styles.upgradeButton}>Ver Planos</Link>
                </div>
            )}
        </div>
    );
};

const SubscriptionTab = ({ subscription, onManageSubscription, isManaging }: { subscription: any, onManageSubscription: () => void, isManaging: boolean }) => {
    const isPremium = subscription?.plan === 'premium';
    const status = subscription?.subscription_status;

    const getCancelDate = () => {
        if (subscription?.subscription_cancel_at) {
            const date = (subscription.subscription_cancel_at as Timestamp).toDate();
            return date.toLocaleDateString('pt-BR');
        }
        return '';
    };

    return (
        <div className={styles.card}>
            <h2>A Minha Assinatura</h2>

            {!isPremium && status !== 'cancellation_pending' && (
                <div className={styles.statusInactive}><XCircle size={20} /><span>Plano Gratuito</span></div>
            )}
            {isPremium && status === 'active' && (
                <div className={styles.statusActive}><Crown size={20} /><span>Plano Premium Ativo</span></div>
            )}
            {(status === 'cancellation_pending' || status === 'past_due') && (
                <div className={`${styles.statusInactive}`} style={{backgroundColor: '#fffbeb', color: '#b45309'}}><AlertTriangle size={20} /><span>{status === 'past_due' ? 'Pagamento Pendente' : 'Cancelamento Agendado'}</span></div>
            )}

            <p>
                {isPremium && status === 'active' && 'Obrigado por ser um membro Premium! Desfrute de todas as funcionalidades ilimitadas.'}
                {(isPremium && status === 'cancellation_pending') && `O seu acesso premium continua ativo até ${getCancelDate()}. Você pode reativar a sua assinatura a qualquer momento.`}
                {(isPremium && status === 'past_due') && 'Por favor, atualize os seus dados de pagamento para não perder o acesso ao plano Premium.'}
                {!isPremium && status !== 'cancellation_pending' && 'Faça o upgrade para o plano Premium para ter acesso a receitas ilimitadas e funcionalidades exclusivas.'}
            </p>

            {isPremium ? (
                <button
                    className={styles.manageButton}
                    onClick={onManageSubscription}
                    disabled={isManaging}
                >
                    {isManaging ? <Loader2 className={styles.spinner} /> : 'Gerir Assinatura'}
                </button>
            ) : (
                <Link href="/pricing" className={styles.upgradeButton}>Fazer Upgrade</Link>
            )}
        </div>
    );
};

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [isManaging, setIsManaging] = useState(false);

  const tabContentVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

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

  const handleManageSubscription = async () => {
    if (!user) return;
    setIsManaging(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/manage-stripe-subscription', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      if (data.portalUrl) window.location.href = data.portalUrl;
    } catch (error: any) {
      toast.error(`Ocorreu um erro: ${error.message}`);
    } finally {
      setIsManaging(false);
    }
  };

  if (loading || authLoading) {
    return <div className={styles.loadingScreen}><Loader2 className={styles.spinner} /></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Minha Conta</h1>
        <div className={styles.tabs}>
          <button onClick={() => setActiveTab('account')} className={`${styles.tabButton} ${activeTab === 'account' ? styles.activeTab : ''}`}>Conta</button>
          <button onClick={() => setActiveTab('preferences')} className={`${styles.tabButton} ${activeTab === 'preferences' ? styles.activeTab : ''}`}>Preferências</button>
          <button onClick={() => setActiveTab('subscription')} className={`${styles.tabButton} ${activeTab === 'subscription' ? styles.activeTab : ''}`}>Assinatura</button>
        </div>

        <div className={styles.tabContentContainer}>
          <AnimatePresence mode="wait">
            {activeTab === 'account' && user && (
              <motion.div
                key="account"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <AccountTab user={user} initialName={subscription?.displayName || user?.displayName || ''} />
              </motion.div>
            )}

            {activeTab === 'preferences' && user && (
              <motion.div
                key="preferences"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <PreferencesTab user={user} initialPreferences={subscription?.dietaryPreferences || []} isPremium={subscription?.plan === 'premium'} />
              </motion.div>
            )}

            {activeTab === 'subscription' && (
              <motion.div
                key="subscription"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <SubscriptionTab subscription={subscription} onManageSubscription={handleManageSubscription} isManaging={isManaging} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}