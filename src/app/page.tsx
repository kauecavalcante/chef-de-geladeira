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
import toast from 'react-hot-toast';
import { ConflictModal } from '../components/ConflictModal/ConflictModal'; 
import styles from './Home.module.css';

const RECIPE_STYLES: TTag[] = [
  { key: 'rapida', name: 'Rápida' },
  { key: 'facil', name: 'Fácil' },
  { key: 'saudavel', name: 'Saudável' },
  { key: 'economica', name: 'Econômica' },
];

type Conflict = {
  preference: string;
  ingredients: string[];
};
type Resolution = 'assume_compliant' | 'suggest_alternatives' | 'ignore_preference' | 'save_exception';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [ingredients, setIngredients] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<TTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const setGeneratedRecipe = useRecipeStore((state) => state.setGeneratedRecipe);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictData, setConflictData] = useState<Conflict[]>([]);

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

  const proceedToGenerate = async (ingredientsToUse: string, conflictResolution?: string) => {
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
          ingredients: ingredientsToUse,
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

      
      const filterResponse = await fetch('/api/filter-ingredients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ingredients }),
      });

      if (!filterResponse.ok) {
        throw new Error('Falha ao validar os itens inseridos.');
      }

      const filterResult = await filterResponse.json();
      const validIngredients = filterResult.ingredientesComestiveis || [];
      const invalidItems = filterResult.itensNaoComestiveis || [];

      if (validIngredients.length === 0) {
        toast.error("Por favor, insira ingredientes de cozinha válidos.");
        setIsLoading(false);
        
        
        if (invalidItems.length > 0) {
         
          fetch('/api/log-abuse-attempt', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
        return;
      }

      const validIngredientsString = validIngredients.join(', ');

      
      const validationResponse = await fetch('/api/validate-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients: validIngredientsString,
          preferences: userPreferences,
        }),
      });

      if (!validationResponse.ok) {
        throw new Error('Falha ao validar conflitos de ingredientes.');
      }

      const validationResult = await validationResponse.json();

      if (validationResult.conflict && validationResult.conflicts.length > 0) {
        setConflictData(validationResult.conflicts);
        setIsModalOpen(true);
        setIsLoading(false);
      } else {
        proceedToGenerate(validIngredientsString);
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente.';
      toast.error(`Ocorreu um erro: ${errorMessage}`);
      setIsLoading(false);
    }
  };
  
  const handleConflictResolution = async (resolution: Resolution) => {
    setIsModalOpen(false); 
    if (!user) return;

    if (resolution === 'save_exception') {
      const token = await user.getIdToken();
      const savePromises = conflictData.flatMap((conflict) =>
        conflict.ingredients.map((ing) =>
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
      proceedToGenerate(ingredients, 'assume_compliant');
    } else {
      proceedToGenerate(ingredients, resolution);
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
      
      <ConflictModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        conflicts={conflictData}
        onResolve={handleConflictResolution}
      />

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