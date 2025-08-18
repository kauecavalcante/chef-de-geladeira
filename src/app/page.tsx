'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

import { IngredientInput } from '../components/IngredientInput/IngredientInput';
import { StyleTags, TTag } from '../components/StyleTags/StyleTags';
import { useRecipeStore } from '../store/recipeStore';
import { TextShimmer } from '../components/ui/TextShimmer/TextShimmer';

import styles from './Home.module.css';

const RECIPE_STYLES: TTag[] = [
  { key: 'rapida', name: 'Rápida' },
  { key: 'facil', name: 'Fácil' },
  { key: 'saudavel', name: 'Saudável' },
  { key: 'economica', name: 'Econômica' },
  { key: 'surpreenda-me', name: 'Surpreenda-me!' },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [ingredients, setIngredients] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<TTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  
  const setGeneratedRecipe = useRecipeStore((state) => state.setGeneratedRecipe);


  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    if (paymentId && status === 'approved' && user) {
      const verify = async () => {
        try {
          const token = await user.getIdToken();
          await fetch('/api/verify-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ paymentId }),
          });
          router.replace('/'); 
        } catch (error) {
          console.error("Erro ao verificar a subscrição:", error);
        } finally {
          setIsVerifying(false);
        }
      };
      verify();
    } else {
      setIsVerifying(false);
    }
  }, [searchParams, user, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleSubmit = async () => {
    if (!ingredients.trim()) {
        alert("Por favor, insira alguns ingredientes.");
        return;
    }
    if (!user) {
        alert("Você precisa estar logado para gerar uma receita.");
        return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients: ingredients,
          styles: selectedStyles.map(s => s.name),
        }),
      });

      if (response.status === 429) {
        alert("Você atingiu seu limite de 10 receitas gratuitas para este mês.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Falha ao gerar a receita.');
      }

      const recipe = await response.json();
      setGeneratedRecipe(recipe);
      router.push('/recipe');

    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao gerar a receita. Tente novamente.");
      setIsLoading(false);
    }
  };

  if (authLoading || !user || isVerifying) {
    return <div className={styles.loadingScreen}>A carregar...</div>;
  }

  return (
    <>
      <header className={styles.header}>
        <p className={styles.userInfo}>Logado como: {user.email}</p>
        <div className={styles.headerActions}>
          <Link href="/account" className={styles.historyButton}>A Minha Conta</Link>
          <Link href="/history" className={styles.historyButton}>Minhas Receitas</Link>
          <button onClick={handleLogout} className={styles.logoutButton}>Sair</button>
        </div>
      </header>

      <main className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.titleSection}>
            <h1>O que tem na sua geladeira?</h1>
            <p>Transforme ingredientes em pratos incríveis em segundos.</p>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <TextShimmer className={styles.shimmerText}>
                Criando sua receita... 🥪
              </TextShimmer>
            </div>
          ) : (
            <div className={styles.form}>
              <div className={styles.formSection}>
                <label htmlFor="ingredients">Digite os ingredientes que você tem:</label>
                <IngredientInput
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  onSubmit={handleSubmit}
                  loading={isLoading}
                  placeholder="Ex: frango, 2 ovos, um pouco de arroz, tomate, cebola..."
                />
              </div>

              <div className={styles.formSection}>
                <label>Qual o estilo da receita que você quer?</label>
                <StyleTags
                  availableTags={RECIPE_STYLES}
                  onChange={(selected) => setSelectedStyles(selected)}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}