export interface Ingredient {
  id?: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  category: 'Petit dej' | 'Snack' | 'Repas' | 'Dessert';
  prepTimeMinutes: number;
  baseServings: number;
  imageUrl?: string;
  sourceUrl?: string;
  ingredients: Ingredient[];
  instructions: string[];
}

// 🆕 Nouveaux types pour le Bloc 2
export type MealType = 'Petit dej' | 'Déjeuner' | 'Dîner' | 'Snack';

export interface PlannedMeal {
  id: string;
  recipeId: string;
  recipeTitle: string;
  mealType: MealType;
  servings: number;
  // Sauvegarde des macros calculées au moment de la planification
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyPlan {
  dayName: string; // Ex: 'Lundi', 'Mardi', ...
  meals: PlannedMeal[];
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
