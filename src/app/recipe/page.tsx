'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeStore } from '@/store/recipeStore';
import { ArrowLeft, ChefHat, Clock, UtensilsCrossed } from 'lucide-react';
import styles from './Recipe.module.css';
import { InstructionChecklist } from '@/components/InstructionChecklist/InstructionChecklist';
import { getIconForIngredient } from '@/lib/icon-mapper';

export default function RecipePage() {
  const router = useRouter();
  const recipe = useRecipeStore((state) => state.generatedRecipe);

  
  useEffect(() => {
    if (!recipe) {
      router.push('/');
    }
  }, [recipe, router]);

  if (!recipe) {
    return <div className={styles.loadingScreen}>Redirecionando...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <button onClick={() => router.push('/')} className={styles.backButton}>
        <ArrowLeft size={18} />
        Voltar e gerar outra receita
      </button>

      <main className={styles.recipeCard}>
        <div className={styles.header}>
          <div className={styles.imagePlaceholder}>
            <ChefHat size={60} strokeWidth={1} />
          </div>
          <h1>{recipe.title}</h1>
          <p className={styles.description}>{recipe.description}</p>
        </div>

        <div className={styles.infoBar}>
          <div className={styles.infoItem}>
            <Clock size={20} />
            <span>{recipe.time}</span>
          </div>
          <div className={styles.infoItem}>
            <UtensilsCrossed size={20} />
            <span>{recipe.servings}</span>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.section}>
            <h2>Ingredientes</h2>
            
            <div className={styles.ingredientsList}>
              {recipe.ingredients.map((item, index) => {
                
                const IconComponent = getIconForIngredient(item);
                return (
                  <div key={index} className={styles.ingredientItem}>
                    <IconComponent className={styles.ingredientIcon} size={20} strokeWidth={1.5} />
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Modo de Preparo</h2>
            
            <InstructionChecklist instructions={recipe.instructions} />
          </div>
        </div>
      </main>
    </div>
  );
}