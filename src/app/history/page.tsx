'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useRecipeStore, Recipe } from '@/store/recipeStore';
import { ArrowLeft, ChefHat, Clock, Loader2, Zap } from 'lucide-react';
import styles from './History.module.css';

type StoredRecipe = Recipe & {
  id: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};


const UpgradeToSeeMore = () => (
  <div className={styles.upgradeCard}>
    <div className={styles.upgradeIcon}>
      <Zap size={32} />
    </div>
    <div className={styles.upgradeText}>
      <h3>Veja o seu histórico completo</h3>
      <p>Utilizadores do plano gratuito podem ver apenas as suas 3 últimas receitas. Faça o upgrade para ter acesso ilimitado.</p>
    </div>
    <Link href="/pricing" className={styles.upgradeButton}>
      Ver Planos
    </Link>
  </div>
);

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const setGeneratedRecipe = useRecipeStore((state) => state.setGeneratedRecipe);

  const [recipes, setRecipes] = useState<StoredRecipe[]>([]);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const plan = userDoc.exists() ? userDoc.data().plan : 'free';
          setUserPlan(plan);

          
          const recipesRef = collection(db, 'users', user.uid, 'recipes');
          let q;

          if (plan === 'free') {
            // Se for gratuito, busca as 3 últimas
            q = query(recipesRef, orderBy('createdAt', 'desc'), limit(3));
          } else {
            // Se for premium, busca todas
            q = query(recipesRef, orderBy('createdAt', 'desc'));
          }
          
          const querySnapshot = await getDocs(q);
          const userRecipes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as StoredRecipe[];

          setRecipes(userRecipes);
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
          alert("Não foi possível carregar os seus dados.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user, authLoading, router]);

  const handleRecipeClick = (recipe: StoredRecipe) => {
    setGeneratedRecipe(recipe);
    router.push('/recipe');
  };

  if (authLoading || loading) {
    return (
      <div className={styles.loadingScreen}>
        <Loader2 className={styles.spinner} />
        <span>A carregar o seu histórico...</span>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={18} />
          Voltar
        </Link>
        <h1>Minhas Receitas</h1>
      </header>
      
      <main>
        {recipes.length > 0 ? (
          <div className={styles.grid}>
            {recipes.map((recipe) => (
              <div key={recipe.id} className={styles.card} onClick={() => handleRecipeClick(recipe)}>
                <div className={styles.cardIcon}>
                  <ChefHat size={32} strokeWidth={1.5} />
                </div>
                <h2 className={styles.cardTitle}>{recipe.title}</h2>
                <p className={styles.cardDescription}>{recipe.description}</p>
                <div className={styles.cardFooter}>
                  <Clock size={16} />
                  <span>{recipe.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ChefHat size={48} strokeWidth={1} />
            <h2>Nenhuma receita encontrada</h2>
            <p>Parece que ainda não gerou nenhuma receita. Volte à página inicial para começar!</p>
          </div>
        )}

        {/* Mostra o "convite" de upgrade se for utilizador gratuito */}
        {userPlan === 'free' && recipes.length > 0 && <UpgradeToSeeMore />}
      </main>
    </div>
  );
}