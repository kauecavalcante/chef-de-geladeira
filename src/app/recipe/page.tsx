'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeStore } from '@/store/recipeStore';
import { Clock, Users, BarChart } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Navbar } from '@/components/Navbar/Navbar'; 
import { InstructionChecklist } from '@/components/InstructionChecklist/InstructionChecklist';
import styles from './Recipe.module.css';

export default function RecipePage() {
  const router = useRouter();
  const recipe = useRecipeStore((state) => state.generatedRecipe);

  useEffect(() => {
    if (!recipe) {
      router.push('/');
    }
  }, [recipe, router]);

  if (!recipe) {
    return <div className={styles.loadingScreen}>A redirecionar...</div>;
  }

  const safeRecipe = {
    title: recipe.title || 'Receita Sem Título',
    description: recipe.description || 'Nenhuma descrição fornecida.',
    time: recipe.time || 'N/A',
    servings: recipe.servings || 'N/A',
    difficulty: recipe.difficulty || 'N/A',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    chefTips: recipe.chefTips || [],
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className={styles.pageContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className={styles.header} variants={itemVariants}>
          <h1>{safeRecipe.title}</h1>
          <p>{safeRecipe.description}</p>
        </motion.header>

        <motion.div className={styles.infoTags} variants={itemVariants}>
          <span className={styles.tag}><Clock size={16} /> {safeRecipe.time}</span>
          <span className={styles.tag}><BarChart size={16} /> {safeRecipe.difficulty}</span>
          <span className={styles.tag}><Users size={16} /> {safeRecipe.servings}</span>
        </motion.div>

        <div className={styles.contentWrapper}>
          <motion.div className={styles.card} variants={itemVariants}>
            <h2>Ingredientes</h2>
            <ul className={styles.ingredientsList}>
              {safeRecipe.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div className={styles.card} variants={itemVariants}>
            <h2>Modo de Preparo</h2>
            <InstructionChecklist instructions={safeRecipe.instructions} />
          </motion.div>

          {safeRecipe.chefTips.length > 0 && (
            <motion.div className={`${styles.card} ${styles.tipsCard}`} variants={itemVariants}>
              <h2>Dicas do Chef</h2>
              <ul className={styles.tipsList}>
                {safeRecipe.chefTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}