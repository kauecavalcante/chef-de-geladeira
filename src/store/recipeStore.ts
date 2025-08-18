import { create } from 'zustand';


export interface Recipe {
  title: string;
  description: string;
  servings: string;
  time: string;
  ingredients: string[];
  instructions: string[];
  imagePrompt: string;
}


interface RecipeState {
  generatedRecipe: Recipe | null;
  setGeneratedRecipe: (recipe: Recipe | null) => void;
}


export const useRecipeStore = create<RecipeState>((set) => ({
  generatedRecipe: null,
  setGeneratedRecipe: (recipe) => set({ generatedRecipe: recipe }),
}));