import { create } from 'zustand';

export interface Recipe {
  title: string;
  description: string;
  servings: string;
  time: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  chefTips: string[];
}

interface RecipeState {
  generatedRecipe: Recipe | null;
  setGeneratedRecipe: (recipe: Recipe | null) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  generatedRecipe: null,
  setGeneratedRecipe: (recipe) => set({ generatedRecipe: recipe }),
}));