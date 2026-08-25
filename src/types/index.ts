export interface Ingredient {
  id: string;
  name: string;
  amount: number; // Quantité de base pour 1 portion
  unit: string;   // g, ml, c. à soupe, etc.
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  category: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
  imageUrl?: string;
  prepTimeMinutes: number;
  instructions: string[];
  baseServings: number;
  ingredients: Ingredient[];
}

export type DayOfWeek = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
export type MealType = 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';

export interface PlannedMeal {
  id: string;
  day: DayOfWeek;
  mealType: MealType;
  recipeId: string;
  servings: number;
}