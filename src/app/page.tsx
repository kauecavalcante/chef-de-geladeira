'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Sparkles, Zap } from 'lucide-react';
import { Navbar } from '../components/Navbar/Navbar';
import { IngredientInput } from '../components/IngredientInput/IngredientInput';
import { TTag } from '@/types';
import { useRecipeStore } from '../store/recipeStore';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from './Home.module.css';
import toast from 'react-hot-toast'; 

const RECIPE_STYLES: TTag[] = [
  { key: 'rapida', name: 'Rápida' },
  { key: 'facil', name: 'Fácil' },
  { key: 'saudavel', name: 'Saudável' },
  { key: 'economica', name: 'Econômica' },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [ingredients, setIngredients] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<TTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);

  const setGeneratedRecipe = useRecipeStore((state) => state.setGeneratedRecipe);

  useEffect(() => {
    if (user) {
      const fetchPreferences = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().dietaryPreferences) {
          setUserPreferences(userDoc.data().dietaryPreferences);
        }
      };
      fetchPreferences();
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const proceedToGenerate = async (conflictResolution?: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para gerar uma receita.");
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
          conflictResolution: conflictResolution,
        }),
      });

      if (response.status === 429) {
        toast.error("Você atingiu seu limite de 10 receitas gratuitas para este mês.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao gerar a receita.');
      }

      const recipe = await response.json();
      setGeneratedRecipe(recipe);
      router.push('/recipe');

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente.';
      toast.error(`Ocorreu um erro ao gerar a receita: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const handleGenerateClick = async () => {
    if (!ingredients.trim()) {
      toast.error("Por favor, insira alguns ingredientes.");
      return;
    }
    if (!user) return;

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const validationResponse = await fetch('/api/validate-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients: ingredients,
          preferences: userPreferences,
        }),
      });

      if (!validationResponse.ok) {
        throw new Error('Falha ao validar ingredientes.');
      }

      const validationResult = await validationResponse.json();

      if (validationResult.conflict && validationResult.conflicts.length > 0) {
        setIsLoading(false);

        let conflictMessage = 'Detectamos alguns conflitos:\n\n';
        validationResult.conflicts.forEach((conflict: { preference: string; ingredients: string[] }) => {
          const ingredientsList = conflict.ingredients.join(', ');
          conflictMessage += `- Sua preferência "${conflict.preference}" é violada por: "${ingredientsList}".\n`;
        });

        conflictMessage += `\nO que gostaria de fazer?\n\nDigite o número da sua escolha:\n1. Considerar meus ingredientes como compatíveis (apenas desta vez).\n2. Sugerir alternativas para os ingredientes.\n3. Ignorar minhas preferências (apenas desta vez).\n4. Considerar meus ingredientes como compatíveis para sempre (ex: "leite" será sempre "leite sem lactose").`;

        const choice = window.prompt(conflictMessage, "1");

        switch (choice) {
          case "1":
            proceedToGenerate('assume_compliant');
            break;
          case "2":
            proceedToGenerate('suggest_alternatives');
            break;
          case "3":
            proceedToGenerate('ignore_preference');
            break;
          case "4":
            const savePromises = validationResult.conflicts.flatMap((conflict: any) =>
              conflict.ingredients.map((ing: string) =>
                fetch('/api/save-exception', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    preference: conflict.preference,
                    ingredient: ing.toLowerCase(),
                  }),
                })
              )
            );
            await Promise.all(savePromises);
            toast.success("Suas exceções foram salvas! Gerando a receita...");
            proceedToGenerate('assume_compliant');
            break;
          default:
            return;
        }
      } else {
        proceedToGenerate();
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      toast.error("Ocorreu um erro ao verificar seus ingredientes. Tente novamente.");
      setIsLoading(false);
    }
  };

  const handleStyleSelect = (tag: TTag) => {
    setSelectedStyles(prev => {
      const isSelected = prev.some(s => s.key === tag.key);
      if (isSelected) {
        return prev.filter(s => s.key !== tag.key);
      } else {
        return [...prev, tag];
      }
    });
  };

  if (authLoading || !user) {
    return <div className={styles.loadingScreen}>A carregar...</div>;
  }

  return (
    <>
      <Navbar />

      <main className={styles.mainContainer}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.titleSection}
        >
          <div className={styles.logoWrapper}>
            <ChefHat className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Chef de Geladeira</h1>
          <p className={styles.subtitle}>
            Transforme o que você tem em pratos incríveis com o poder da IA.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.contentWrapper}
        >
          <IngredientInput
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onSubmit={handleGenerateClick}
            loading={isLoading}
            placeholder="O que você tem para cozinhar hoje?"
            selectedTags={selectedStyles}
          />

          <div className={styles.styleTagsContainer}>
            {RECIPE_STYLES.map((tag) => (
              <button
                key={tag.key}
                onClick={() => handleStyleSelect(tag)}
                className={`${styles.styleTag} ${selectedStyles.some(s => s.key === tag.key) ? styles.selectedTag : ''}`}
              >
                <Zap size={14} />
                {tag.name}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.loadingContainer}
              >
                <Sparkles className={styles.loadingIcon} />
                <div>
                  <p className={styles.loadingText}>O Chef IA está a pensar...</p>
                  <p className={styles.loadingSubtext}>A analisar os seus ingredientes para criar a receita perfeita.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </>
  );
}