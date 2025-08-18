import {
  Apple, Banana, Bean, Beef, Blocks, Carrot, ChefHat, Cherry, Citrus, Coffee,
  CookingPot, Croissant, Drumstick, Egg, Fish, Flame, Grape, GlassWater, Leaf,
  Milk, Salad, Sandwich, Soup, Utensils, Wheat, Wine
} from 'lucide-react';
import React from 'react';


type IconMap = {
  [key: string]: React.ElementType;
};


const ingredientIconMap: IconMap = {
  // Carnes e Proteínas
  frango: Drumstick,
  galinha: Drumstick,
  peito: Drumstick,
  coxa: Drumstick,
  carne: Beef,
  bife: Beef,
  bovino: Beef,
  porco: Beef, // Ícone genérico de carne
  peixe: Fish,
  salmão: Fish,
  atum: Fish,
  sardinha: Fish,
  ovo: Egg,
  ovos: Egg,
  feijão: Bean,
  lentilha: Bean,

  // Laticínios
  leite: Milk,
  creme: Milk,
  queijo: Blocks,
  mussarela: Blocks,
  parmesão: Blocks,
  ricota: Blocks,
  iogurte: Milk,

  // Vegetais e Legumes
  cenoura: Carrot,
  batata: Carrot, // Ícone genérico de vegetal-raiz
  cebola: Carrot, // Ícone genérico de vegetal
  alho: Carrot,   // Ícone genérico de vegetal
  tomate: Apple,  // Ícone genérico de fruta/vegetal redondo
  alface: Leaf,
  couve: Leaf,
  espinafre: Leaf,
  rúcula: Leaf,
  salada: Salad,
  brócolis: Leaf,

  // Frutas
  maçã: Apple,
  banana: Banana,
  laranja: Citrus,
  limão: Citrus,
  tangerina: Citrus,
  uva: Grape,
  cereja: Cherry,

  // Grãos e Carboidratos
  arroz: Wheat,
  trigo: Wheat,
  farinha: Wheat,
  pão: Sandwich,
  macarrão: Utensils, // Ícone genérico de refeição
  croissant: Croissant,
  sanduíche: Sandwich,

  // Temperos e Outros
  pimenta: Flame,
  picante: Flame,
  sal: CookingPot,
  açúcar: CookingPot,
  óleo: CookingPot,
  azeite: CookingPot,
  sopa: Soup,
  caldo: Soup,

  // Bebidas
  água: GlassWater,
  vinho: Wine,
  café: Coffee,
};


export const getIconForIngredient = (ingredient: string): React.ElementType => {
  const lowerCaseIngredient = ingredient.toLowerCase();

  
  for (const key in ingredientIconMap) {
    if (lowerCaseIngredient.includes(key)) {
      return ingredientIconMap[key];
    }
  }

  
  return ChefHat;
};