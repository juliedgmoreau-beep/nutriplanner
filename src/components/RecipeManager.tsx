'use client';

import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient, MealType, PlannedMeal } from '../types';

type ExtendedRecipe = Recipe & {
  sourceUrl?: string;
};

const CATEGORIES: Recipe['category'][] = ['Petit dej', 'Snack', 'Repas', 'Dessert'];
const MEAL_TYPES: MealType[] = ['Petit dej', 'Déjeuner', 'Dîner', 'Snack'];
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const NUTRITIONAL_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number; defaultUnit: string }> = {
  'avoine': { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, defaultUnit: 'g' },
  'flocons d\'avoine': { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, defaultUnit: 'g' },
  'oats': { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, defaultUnit: 'g' },
  'riz': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, defaultUnit: 'g' },
  'riz basmati': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, defaultUnit: 'g' },
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, defaultUnit: 'g' },
  'glutinous rice flour': { calories: 360, protein: 6, carbs: 80, fat: 0.5, defaultUnit: 'g' },
  'rice flour': { calories: 360, protein: 6, carbs: 80, fat: 0.5, defaultUnit: 'g' },
  'farine de riz': { calories: 360, protein: 6, carbs: 80, fat: 0.5, defaultUnit: 'g' },
  'farine': { calories: 364, protein: 10, carbs: 76, fat: 1, defaultUnit: 'g' },
  'flour': { calories: 364, protein: 10, carbs: 76, fat: 1, defaultUnit: 'g' },
  'poulet': { calories: 165, protein: 31, carbs: 0, fat: 3.6, defaultUnit: 'g' },
  'blanc de poulet': { calories: 165, protein: 31, carbs: 0, fat: 3.6, defaultUnit: 'g' },
  'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, defaultUnit: 'g' },
  'oeuf': { calories: 155, protein: 13, carbs: 1.1, fat: 11, defaultUnit: 'g' },
  'œuf': { calories: 155, protein: 13, carbs: 1.1, fat: 11, defaultUnit: 'g' },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11, defaultUnit: 'g' },
  'saumon': { calories: 208, protein: 20, carbs: 0, fat: 13, defaultUnit: 'g' },
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, defaultUnit: 'g' },
  'whey': { calories: 370, protein: 80, carbs: 5, fat: 3, defaultUnit: 'g' },
  'proteine en poudre': { calories: 370, protein: 80, carbs: 5, fat: 3, defaultUnit: 'g' },
  'carrots': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, defaultUnit: 'g' },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, defaultUnit: 'g' },
  'carotte': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, defaultUnit: 'g' },
  'garlic': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, defaultUnit: 'g' },
  'ail': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, defaultUnit: 'g' },
  'spring onion': { calories: 32, protein: 1.8, carbs: 7.3, fat: 0.2, defaultUnit: 'g' },
  'spring onions': { calories: 32, protein: 1.8, carbs: 7.3, fat: 0.2, defaultUnit: 'g' },
  'oignon': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1, defaultUnit: 'g' },
  'banane': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, defaultUnit: 'g' },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, defaultUnit: 'g' },
  'pomme': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, defaultUnit: 'g' },
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, defaultUnit: 'g' },
  'avocat': { calories: 160, protein: 2, carbs: 9, fat: 15, defaultUnit: 'g' },
  'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, defaultUnit: 'g' },
  'patate douce': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, defaultUnit: 'g' },
  'oil': { calories: 884, protein: 0, carbs: 0, fat: 100, defaultUnit: 'ml' },
  'huile': { calories: 884, protein: 0, carbs: 0, fat: 100, defaultUnit: 'ml' },
  'huile d\'olive': { calories: 884, protein: 0, carbs: 0, fat: 100, defaultUnit: 'ml' },
  'soy sauce': { calories: 53, protein: 8, carbs: 4.9, fat: 0.6, defaultUnit: 'ml' },
  'sauce soja': { calories: 53, protein: 8, carbs: 4.9, fat: 0.6, defaultUnit: 'ml' },
  'vinegar': { calories: 18, protein: 0, carbs: 0.9, fat: 0, defaultUnit: 'ml' },
  'vinaigre': { calories: 18, protein: 0, carbs: 0.9, fat: 0, defaultUnit: 'ml' },
  'beurre de cacahuete': { calories: 588, protein: 25, carbs: 20, fat: 50, defaultUnit: 'g' },
  'peanut butter': { calories: 588, protein: 25, carbs: 20, fat: 50, defaultUnit: 'g' },
  'lait': { calories: 42, protein: 3.4, carbs: 5, fat: 1, defaultUnit: 'ml' },
  'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, defaultUnit: 'ml' },
  'lait d\'amande': { calories: 15, protein: 0.5, carbs: 0.3, fat: 1.1, defaultUnit: 'ml' },
  'yaourt grec': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, defaultUnit: 'g' },
  'skyr': { calories: 63, protein: 11, carbs: 4, fat: 0.2, defaultUnit: 'g' },
};

export default function RecipeManager() {
  const [recipes, setRecipes] = useState<ExtendedRecipe[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // Vue modale consultation
  const [viewingRecipe, setViewingRecipe] = useState<ExtendedRecipe | null>(null);
  const [viewServings, setViewServings] = useState<number>(1);
  const [viewPerServingMode, setViewPerServingMode] = useState<boolean>(true);

  // Modale planification au menu
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [planDay, setPlanDay] = useState<string>('Lundi');
  const [planMealType, setPlanMealType] = useState<MealType>('Déjeuner');
  const [planServings, setPlanServings] = useState<number>(1);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Formulaire de recette
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Recipe['category']>('Repas');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [baseServings, setBaseServings] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [ingredients, setIngredients] = useState<Partial<Ingredient>[]>([
    { name: '', amount: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 },
  ]);

  // Importation rapide de texte
  const [rawText, setRawText] = useState('');
  const [importMode, setImportMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nutriplanner_recipes');
    if (saved) {
      try {
        setRecipes(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur lors du chargement des recettes:', e);
      }
    }
  }, []);

  const saveRecipes = (updated: ExtendedRecipe[]) => {
    setRecipes(updated);
    localStorage.setItem('nutriplanner_recipes', JSON.stringify(updated));
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Repas');
    setPrepTimeMinutes(15);
    setBaseServings(1);
    setImageUrl('');
    setSourceUrl('');
    setInstructions(['']);
    setIngredients([{ name: '', amount: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
    setRawText('');
    setEditingRecipeId(null);
  };

  const openRecipeView = (recipe: ExtendedRecipe) => {
    setViewingRecipe(recipe);
    setViewServings(recipe.baseServings || 1);
    setPlanServings(recipe.baseServings || 1);
  };

  const startEditRecipe = (recipe: ExtendedRecipe) => {
    setEditingRecipeId(recipe.id);
    setTitle(recipe.title);
    setCategory(recipe.category);
    setPrepTimeMinutes(recipe.prepTimeMinutes);
    setBaseServings(recipe.baseServings);
    setImageUrl(recipe.imageUrl || '');
    setSourceUrl(recipe.sourceUrl || '');
    setInstructions(recipe.instructions.length ? recipe.instructions : ['']);
    setIngredients(recipe.ingredients.length ? recipe.ingredients : [{ name: '', amount: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
    setViewingRecipe(null);
    setShowForm(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image est un peu lourde (>2Mo). Privilégiez une image plus légère si possible.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        if (viewingRecipe) {
          const updated = { ...viewingRecipe, imageUrl: result };
          setViewingRecipe(updated);
          saveRecipes(recipes.map((r) => (r.id === viewingRecipe.id ? updated : r)));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const parseRawText = () => {
    if (!rawText.trim()) return;

    const lines = rawText.split(/\r?\n/).filter((l) => l.trim() !== '');
    const parsedIngredients: Partial<Ingredient>[] = [];
    const parsedInstructions: string[] = [];

    lines.forEach((line) => {
      let cleanLine = line.trim();
      const isInstruction = /^(\d+[\.\)]|step\s*\d+|étape\s*\d+)/i.test(cleanLine);

      if (isInstruction) {
        const stepText = cleanLine.replace(/^(\d+[\.\)]\s*|step\s*\d+:?\s*|étape\s*\d+:?\s*)/i, '').trim();
        if (stepText) parsedInstructions.push(stepText);
        return;
      }

      if (
        cleanLine.toLowerCase().startsWith('for ') ||
        cleanLine.toLowerCase().startsWith('pour ') ||
        cleanLine.toLowerCase().includes('sauce') ||
        cleanLine.toLowerCase().includes('ingredients')
      ) {
        return;
      }

      const lineWithoutParens = cleanLine.replace(/\s*\([^)]*\)/g, '').trim();
      const match = lineWithoutParens.match(/^[-*•\s]*(\d+(?:[\.,-]\d+)?)\s*(g|ml|cl|l|kg|c\.a\.s|cas|c\.a\.c|cac|tsp|tbsp)?\s*(.*)/i);

      if (match) {
        const rawAmount = match[1].split('-')[0].replace(',', '.');
        const amount = parseFloat(rawAmount) || 100;
        let unit = (match[2] || 'g').toLowerCase();
        let name = match[3].trim() || lineWithoutParens;

        if (unit === 'tbsp') unit = 'c. à soupe';
        if (unit === 'tsp') unit = 'c. à café';

        const nameKey = name.toLowerCase();
        let matchedKey = Object.keys(NUTRITIONAL_DATABASE).find((k) => nameKey.includes(k));
        const dbEntry = matchedKey ? NUTRITIONAL_DATABASE[matchedKey] : null;

        const ratio = amount / 100;

        parsedIngredients.push({
          name: name || 'Ingrédient',
          amount,
          unit,
          calories: dbEntry ? Math.round(dbEntry.calories * ratio) : 0,
          protein: dbEntry ? Number((dbEntry.protein * ratio).toFixed(1)) : 0,
          carbs: dbEntry ? Number((dbEntry.carbs * ratio).toFixed(1)) : 0,
          fat: dbEntry ? Number((dbEntry.fat * ratio).toFixed(1)) : 0,
        });
      } else if (cleanLine.length > 5 && !cleanLine.includes(':')) {
        parsedInstructions.push(cleanLine);
      }
    });

    if (parsedIngredients.length > 0) setIngredients(parsedIngredients);
    if (parsedInstructions.length > 0) setInstructions(parsedInstructions);

    setImportMode(false);
  };

  const updateIngredientField = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    const currentIng = { ...updated[index], [field]: value };

    if (field === 'name' || field === 'amount') {
      const nameKey = (currentIng.name || '').trim().toLowerCase();
      let matchedKey = Object.keys(NUTRITIONAL_DATABASE).find((k) => nameKey.includes(k));
      const match = matchedKey ? NUTRITIONAL_DATABASE[matchedKey] : null;

      if (match) {
        const ratio = (Number(currentIng.amount) || 0) / 100;
        currentIng.calories = Math.round(match.calories * ratio);
        currentIng.protein = Number((match.protein * ratio).toFixed(1));
        currentIng.carbs = Number((match.carbs * ratio).toFixed(1));
        currentIng.fat = Number((match.fat * ratio).toFixed(1));
        if (field === 'name' && match.defaultUnit) {
          currentIng.unit = match.defaultUnit;
        }
      }
    }

    updated[index] = currentIng;
    setIngredients(updated);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', amount: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstructionRow = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstructionRow = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const removeInstructionRow = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRecipe: ExtendedRecipe = {
      id: editingRecipeId || Date.now().toString(),
      title,
      category,
      prepTimeMinutes: Number(prepTimeMinutes),
      baseServings: Number(baseServings) || 1,
      imageUrl: imageUrl.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      instructions: instructions.filter((i) => i.trim() !== ''),
      ingredients: ingredients.map((ing, idx) => ({
        id: idx.toString(),
        name: ing.name || 'Ingrédient',
        amount: Number(ing.amount) || 0,
        unit: ing.unit || 'g',
        calories: Number(ing.calories) || 0,
        protein: Number(ing.protein) || 0,
        carbs: Number(ing.carbs) || 0,
        fat: Number(ing.fat) || 0,
      })),
    };

    if (editingRecipeId) {
      saveRecipes(recipes.map((r) => (r.id === editingRecipeId ? newRecipe : r)));
    } else {
      saveRecipes([...recipes, newRecipe]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous supprimer cette recette ?')) {
      saveRecipes(recipes.filter((r) => r.id !== id));
      if (viewingRecipe?.id === id) setViewingRecipe(null);
    }
  };

  const handleAddToWeeklyPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingRecipe) return;

    const savedPlan = localStorage.getItem('nutriplanner_weekly_plan');
    let weeklyPlan: Record<string, PlannedMeal[]> = {};

    if (savedPlan) {
      try { weeklyPlan = JSON.parse(savedPlan); } catch (e) { console.error(e); }
    }

    DAYS.forEach((d) => { if (!weeklyPlan[d]) weeklyPlan[d] = []; });

    const baseServ = viewingRecipe.baseServings || 1;
    const ratio = planServings / baseServ;

    const totalKcal = viewingRecipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.calories || 0), 0) * ratio;
    const totalProt = viewingRecipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.protein || 0), 0) * ratio;
    const totalCarbs = viewingRecipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.carbs || 0), 0) * ratio;
    const totalFat = viewingRecipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.fat || 0), 0) * ratio;

    const newMeal: PlannedMeal = {
      id: Date.now().toString(),
      recipeId: viewingRecipe.id,
      recipeTitle: viewingRecipe.title,
      mealType: planMealType,
      servings: planServings,
      calories: Math.round(totalKcal),
      protein: Math.round(totalProt),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
    };

    weeklyPlan[planDay] = [...(weeklyPlan[planDay] || []), newMeal];
    localStorage.setItem('nutriplanner_weekly_plan', JSON.stringify(weeklyPlan));

    setShowAddToPlanModal(false);
    setFeedbackMsg(`Recette ajoutée au ${planDay} (${planMealType}) !`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchCat = selectedCategory === 'Toutes' || r.category === selectedCategory;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculs pour la vue détaillée (portions)
  const servingRatio = viewingRecipe ? viewServings / (viewingRecipe.baseServings || 1) : 1;
  const totalRecipeKcal = viewingRecipe ? viewingRecipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.calories || 0), 0) : 0;
  const totalRecipeProt = viewingRecipe ? viewingRecipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.protein || 0), 0) : 0;
  const totalRecipeCarbs = viewingRecipe ? viewingRecipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.carbs || 0), 0) : 0;
  const totalRecipeFat = viewingRecipe ? viewingRecipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.fat || 0), 0) : 0;

  const currentTotalKcal = totalRecipeKcal * servingRatio;
  const currentTotalProt = totalRecipeProt * servingRatio;
  const currentTotalCarbs = totalRecipeCarbs * servingRatio;
  const currentTotalFat = totalRecipeFat * servingRatio;

  const displayKcal = viewPerServingMode ? currentTotalKcal / viewServings : currentTotalKcal;
  const displayProt = viewPerServingMode ? currentTotalProt / viewServings : currentTotalProt;
  const displayCarbs = viewPerServingMode ? currentTotalCarbs / viewServings : currentTotalCarbs;
  const displayFat = viewPerServingMode ? currentTotalFat / viewServings : currentTotalFat;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catalogue des Recettes</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gérez vos plats et calculez vos macronutriments.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs shadow transition"
        >
          {showForm ? 'Fermer' : '+ Ajouter une recette'}
        </button>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
          <span>✅ {feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {/* Barres d'action : Filtres & Recherche */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setSelectedCategory('Toutes')}
            className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'Toutes' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-gray-600'}`}
          >
            Toutes
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === cat ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔎 Rechercher une recette..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-200 rounded-xl text-xs w-full sm:w-64 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Grille des Recettes */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-2">
          <span className="text-4xl">🍲</span>
          <h3 className="text-sm font-bold text-gray-700">Aucune recette trouvée</h3>
          <p className="text-xs text-gray-500">Ajoutez-en une via le bouton ci-dessus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => {
            const totalKcal = recipe.ingredients.reduce((acc: number, i: Ingredient) => acc + (i.calories || 0), 0);
            return (
              <div
                key={recipe.id}
                onClick={() => openRecipeView(recipe)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {recipe.imageUrl ? (
                    <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-3xl">
                      🥗
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                        {recipe.category}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        ⏱️ {recipe.prepTimeMinutes || 15} min
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 group-hover:text-emerald-600 transition text-base leading-snug">
                      {recipe.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {recipe.ingredients.map((i) => i.name).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center text-xs text-gray-600 font-medium">
                  <span>{recipe.baseServings} portion(s)</span>
                  <span className="font-bold text-amber-700">{Math.round(totalKcal)} kcal</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Consultation Recette */}
      {viewingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-100 relative">
            
            {/* Header Image & Bouton Fermer */}
            <div className="relative h-64 bg-gray-100 flex items-center justify-center">
              {viewingRecipe.imageUrl ? (
                <img src={viewingRecipe.imageUrl} alt={viewingRecipe.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-gray-400 text-sm">Aucune photo pour le moment</p>
                </div>
              )}

              <button
                onClick={() => setViewingRecipe(null)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full flex items-center justify-center font-bold shadow transition"
                title="Fermer la vue"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Entête recette */}
              <div className="flex justify-between items-start gap-4 border-b pb-4">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full inline-block mb-2">
                    {viewingRecipe.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800">{viewingRecipe.title}</h2>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>⏱️ Prep: {viewingRecipe.prepTimeMinutes} min</span>
                    <span>🍽️ Recette de base pour {viewingRecipe.baseServings} portion(s)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => startEditRecipe(viewingRecipe)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition border border-emerald-200"
                  >
                    ✏️ Modifier
                  </button>

                  {viewingRecipe.sourceUrl && (
                    <a
                      href={viewingRecipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition border border-blue-200 flex items-center gap-1"
                    >
                      🔗 Recette d'origine
                    </a>
                  )}
                </div>
              </div>

              {/* Ajustement dynamique des portions */}
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/80 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <label className="text-xs font-bold text-emerald-900 uppercase block">Portions à préparer</label>
                  <p className="text-xs text-emerald-700">Ajuste automatiquement les ingrédients et macros</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewServings(Math.max(1, viewServings - 1))}
                    className="w-8 h-8 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold hover:bg-emerald-100 transition flex items-center justify-center shadow-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={viewServings}
                    onChange={(e) => setViewServings(Math.max(1, Number(e.target.value)))}
                    className="w-12 text-center font-bold text-base py-1 border border-emerald-300 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setViewServings(viewServings + 1)}
                    className="w-8 h-8 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold hover:bg-emerald-100 transition flex items-center justify-center shadow-sm"
                  >
                    +
                  </button>
                  <span className="text-xs font-semibold text-emerald-900">personne(s)</span>
                </div>
              </div>

              {/* Commutateur Macros (Par portion / Total) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">Macros Nutritionnels</span>
                  <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setViewPerServingMode(true)}
                      className={`px-2.5 py-1 rounded-md transition ${viewPerServingMode ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-gray-500'}`}
                    >
                      Par portion
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewPerServingMode(false)}
                      className={`px-2.5 py-1 rounded-md transition ${!viewPerServingMode ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-gray-500'}`}
                    >
                      Total ({viewServings} pers.)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-xl text-center border border-gray-100 font-mono">
                  <div>
                    <span className="block text-[10px] font-bold text-amber-700 uppercase">CALORIES</span>
                    <span className="text-base font-extrabold text-amber-900">{Math.round(displayKcal)} kcal</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase">PROTÉINES</span>
                    <span className="text-base font-extrabold text-emerald-900">{Math.round(displayProt)}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-blue-700 uppercase">GLUCIDES</span>
                    <span className="text-base font-extrabold text-blue-900">{Math.round(displayCarbs)}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-rose-700 uppercase">LIPIDES</span>
                    <span className="text-base font-extrabold text-rose-900">{Math.round(displayFat)}g</span>
                  </div>
                </div>
              </div>

              {/* Ingrédients adaptatifs */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 border-b pb-1 text-sm flex justify-between items-center">
                  <span>Ingrédients</span>
                  <span className="text-xs font-normal text-gray-500">Pour {viewServings} portion(s)</span>
                </h3>
                <ul className="divide-y divide-gray-100 text-xs bg-gray-50/60 rounded-xl p-3 border border-gray-100 space-y-1.5">
                  {viewingRecipe.ingredients.map((ing, idx) => {
                    const adjustedAmount = Number((ing.amount * servingRatio).toFixed(1));
                    return (
                      <li key={idx} className="flex justify-between items-center text-gray-700 pt-1">
                        <span>• <strong className="text-emerald-700 font-bold">{adjustedAmount} {ing.unit}</strong> {ing.name}</span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {Math.round(ing.calories * servingRatio)} kcal
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 border-b pb-1 text-sm">Étapes de préparation</h3>
                {viewingRecipe.instructions && viewingRecipe.instructions.length > 0 ? (
                  <ol className="space-y-2 text-xs text-gray-700 bg-gray-50/60 rounded-xl p-3 border border-gray-100 list-decimal list-inside">
                    {viewingRecipe.instructions.map((inst, idx) => (
                      <li key={idx} className="leading-relaxed">{inst}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs italic text-gray-400">Aucune étape enregistrée.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
