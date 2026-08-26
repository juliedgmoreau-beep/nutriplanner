'use client';

import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient } from '@/types';

type ExtendedRecipe = Recipe & {
  sourceUrl?: string;
};

const CATEGORIES: Recipe['category'][] = ['Petit dej', 'Snack', 'Repas', 'Dessert'];

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

  // État de consultation de recette
  const [viewingRecipe, setViewingRecipe] = useState<ExtendedRecipe | null>(null);
  const [viewServings, setViewServings] = useState<number>(1);
  const [viewPerServingMode, setViewPerServingMode] = useState<boolean>(true); // true = par portion, false = total recette

  // Formulaire
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

  // Import rapide (Texte)
  const [rawText, setRawText] = useState('');
  const [importMode, setImportMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nutriplanner_recipes');
    if (saved) {
      try {
        setRecipes(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur chargement recettes', e);
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
    saveRecipes(recipes.filter((r) => r.id !== id));
    if (viewingRecipe?.id === id) setViewingRecipe(null);
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchCat = selectedCategory === 'Toutes' || r.category === selectedCategory;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculs pour la vue détaillée (avec ratio de portions)
  const servingRatio = viewingRecipe ? viewServings / (viewingRecipe.baseServings || 1) : 1;

  const totalRecipeKcal = viewingRecipe ? viewingRecipe.ingredients.reduce((a, b) => a + (b.calories || 0), 0) : 0;
  const totalRecipeProt = viewingRecipe ? viewingRecipe.ingredients.reduce((a, b) => a + (b.protein || 0), 0) : 0;
  const totalRecipeCarbs = viewingRecipe ? viewingRecipe.ingredients.reduce((a, b) => a + (b.carbs || 0), 0) : 0;
  const totalRecipeFat = viewingRecipe ? viewingRecipe.ingredients.reduce((a, b) => a + (b.fat || 0), 0) : 0;

  // Valeurs calculées selon le nombre de portions sélectionné
  const currentTotalKcal = totalRecipeKcal * servingRatio;
  const currentTotalProt = totalRecipeProt * servingRatio;
  const currentTotalCarbs = totalRecipeCarbs * servingRatio;
  const currentTotalFat = totalRecipeFat * servingRatio;

  // Valeurs affichées selon le mode (Par portion ou Total sélectionné)
  const displayKcal = viewPerServingMode ? currentTotalKcal / viewServings : currentTotalKcal;
  const displayProt = viewPerServingMode ? currentTotalProt / viewServings : currentTotalProt;
  const displayCarbs = viewPerServingMode ? currentTotalCarbs / viewServings : currentTotalCarbs;
  const displayFat = viewPerServingMode ? currentTotalFat / viewServings : currentTotalFat;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Catalogue des Recettes</h1>
        <button
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
        >
          {showForm ? 'Fermer' : '+ Ajouter une recette'}
        </button>
      </div>

      {/* Modal Consultation Recette */}
      {viewingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-100 animate-fadeIn">
            {/* Header Image */}
            <div className="relative h-64 bg-gray-100 flex items-center justify-center">
              {viewingRecipe.imageUrl ? (
                <img src={viewingRecipe.imageUrl} alt={viewingRecipe.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-gray-400 text-sm mb-2">Aucune photo pour le moment</p>
                </div>
              )}
              <button
                onClick={() => setViewingRecipe(null)}
                className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Entête recette */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full inline-block mb-2">
                    {viewingRecipe.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800">{viewingRecipe.title}</h2>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>⏱️ Prep: {viewingRecipe.prepTimeMinutes} min</span>
                    <span>🍽️ Recette originale de {viewingRecipe.baseServings} portion(s)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => startEditRecipe(viewingRecipe)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1.5 rounded-lg text-sm transition border border-emerald-200"
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
                      🔗 Voir la recette d'origine
                    </a>
                  )}
                </div>
              </div>

              {/* Ajustement dynamique du nombre de personnes */}
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/80 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <label className="text-xs font-bold text-emerald-900 uppercase block">Portions à préparer</label>
                  <p className="text-xs text-emerald-700">Ajuste les quantités et les macros en direct</p>
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

              {/* Résumé Macronutriments & Commutateur (Par portion / Total) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">Apports Nutritionnels</span>
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

                <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                  <div>
                    <span className="block text-xs font-bold text-amber-700 uppercase">Kcal</span>
                    <span className="text-lg font-extrabold text-amber-900">{Math.round(displayKcal)}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-emerald-700 uppercase">Prot</span>
                    <span className="text-lg font-extrabold text-emerald-900">{Math.round(displayProt)}g</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-blue-700 uppercase">Gluc</span>
                    <span className="text-lg font-extrabold text-blue-900">{Math.round(displayCarbs)}g</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-rose-700 uppercase">Lip</span>
                    <span className="text-lg font-extrabold text-rose-900">{Math.round(displayFat)}g</span>
                  </div>
                </div>
              </div>

              {/* Ingrédients adaptatifs */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 border-b pb-1 text-sm flex justify-between items-center">
                  <span>Ingrédients requis</span>
                  <span className="text-xs font-normal text-gray-500">
                    Ajustés pour {viewServings} portion(s)
                  </span>
                </h3>
                <ul className="divide-y divide-gray-100 text-sm">
                  {viewingRecipe.ingredients.map((ing, idx) => {
                    const adjustedAmount = Number((ing.amount * servingRatio).toFixed(1));
                    return (
                      <li key={idx} className="py-2 flex justify-between items-center text-gray-700">
                        <span className="font-medium">
                          • <span className="text-emerald-700 font-bold">{adjustedAmount}</span> {ing.unit} {ing.name}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {Math.round(ing.calories * servingRatio)} kcal
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 border-b pb-1 text-sm">Instructions de préparation</h3>
                {viewingRecipe.instructions && viewingRecipe.instructions.length > 0 ? (
                  <ol className="space-y-2.5 text-sm text-gray-700">
                    {viewingRecipe.instructions.map((inst, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-bold text-emerald-600 min-w-[20px]">{idx + 1}.</span>
                        <p className="flex-1 leading-relaxed">{inst}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs italic text-gray-400">Aucune instruction enregistrée pour cette recette.</p>
                )}
              </div>

              {/* Photos & Liens */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">📁 Modifier photo (fichier local)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">🔗 Lien source / URL de la recette</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={viewingRecipe.sourceUrl || ''}
                      onChange={(e) => {
                        const updated = { ...viewingRecipe, sourceUrl: e.target.value };
                        setViewingRecipe(updated);
                        saveRecipes(recipes.map((r) => (r.id === viewingRecipe.id ? updated : r)));
                      }}
                      className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de Création / Modification */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700">
              {editingRecipeId ? '✏️ Modifier la Recette' : 'Nouvelle Recette'}
            </h2>
            {editingRecipeId && (
              <button type="button" onClick={resetForm} className="text-xs text-gray-500 hover:underline">
                Annuler la modification
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la recette</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Carrot Button Noodles"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Recipe['category'])}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temps de préparation (min)</label>
              <input
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de portions de base (ex: 2 pers)</label>
              <input
                type="number"
                min="1"
                value={baseServings}
                onChange={(e) => setBaseServings(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md font-bold text-emerald-800"
              />
            </div>

            {/* Photo & Lien Web d'origine */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">📷 Importer une photo (fichier local)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                />
                <p className="text-[11px] text-gray-400 mt-1">Ou collez une URL d'image ci-dessous :</p>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border border-gray-300 rounded-md text-xs bg-white mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">🔗 Lien source / site d'origine</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://tiktok.com/... ou https://marmiton.org/..."
                  className="w-full p-2 border border-gray-300 rounded-md text-xs bg-white"
                />
                <p className="text-[11px] text-gray-500 mt-2">
                  Ce lien vous permettra d'ouvrir directement la vidéo ou la page originale de la recette en un clic.
                </p>
              </div>
            </div>
          </div>

          {/* Importation texte rapide */}
          <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-emerald-900 text-sm">📋 Importation rapide</h3>
                <p className="text-xs text-emerald-700">Collez un texte d'ingrédients ou d'instructions.</p>
              </div>
              <button
                type="button"
                onClick={() => setImportMode(!importMode)}
                className="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition"
              >
                {importMode ? 'Masquer' : 'Ouvrir la zone de texte'}
              </button>
            </div>

            {importMode && (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Collez votre texte ici...`}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm font-mono bg-white"
                />
                <button
                  type="button"
                  onClick={parseRawText}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md text-sm transition shadow"
                >
                  ⚡ Convertir en Ingrédients & Étapes
                </button>
              </div>
            )}
          </div>

          {/* Liste des Ingrédients */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              Ingrédients & Macronutriments <span className="text-xs font-normal text-gray-500">(Pour le total des {baseServings} portion(s))</span>
            </h3>
            <div className="hidden md:grid md:grid-cols-8 gap-2 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Nom de l'ingrédient</div>
              <div>Qté</div>
              <div>Unité</div>
              <div>Calories (kcal)</div>
              <div>Protéines (g)</div>
              <div>Glucides (g)</div>
              <div>Lipides (g)</div>
            </div>

            {ingredients.map((ing, idx) => (
              <div key={idx} className="grid grid-cols-2 md:grid-cols-8 gap-2 items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200/60">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="ex: Carottes"
                    value={ing.name}
                    onChange={(e) => updateIngredientField(idx, 'name', e.target.value)}
                    className="w-full p-1.5 border rounded text-sm bg-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Qté"
                    value={ing.amount}
                    onChange={(e) => updateIngredientField(idx, 'amount', Number(e.target.value))}
                    className="w-full p-1.5 border rounded text-sm bg-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="g / ml"
                    value={ing.unit}
                    onChange={(e) => updateIngredientField(idx, 'unit', e.target.value)}
                    className="w-full p-1.5 border rounded text-sm bg-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Kcal"
                    value={ing.calories}
                    onChange={(e) => updateIngredientField(idx, 'calories', Number(e.target.value))}
                    className="w-full p-1.5 border rounded text-sm bg-amber-50 border-amber-200 font-medium"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Prot (g)"
                    value={ing.protein}
                    onChange={(e) => updateIngredientField(idx, 'protein', Number(e.target.value))}
                    className="w-full p-1.5 border rounded text-sm bg-emerald-50 border-emerald-200 font-medium"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Gluc (g)"
                    value={ing.carbs}
                    onChange={(e) => updateIngredientField(idx, 'carbs', Number(e.target.value))}
                    className="w-full p-1.5 border rounded text-sm bg-blue-50 border-blue-200 font-medium"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Lip (g)"
                      value={ing.fat}
                      onChange={(e) => updateIngredientField(idx, 'fat', Number(e.target.value))}
                      className="w-full p-1.5 border rounded text-sm bg-rose-50 border-rose-200 font-medium"
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-600 font-bold px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIngredients([...ingredients, { name: '', amount: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 }])}
              className="text-sm text-emerald-600 font-semibold hover:underline inline-block mt-1"
            >
              + Ajouter un ingrédient
            </button>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Instructions de préparation</h3>
            {instructions.map((inst, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="text-xs font-bold text-gray-400 mt-2.5">{idx + 1}.</span>
                <textarea
                  rows={2}
                  placeholder={`Étape ${idx + 1}`}
                  value={inst}
                  onChange={(e) => {
                    const copy = [...instructions];
                    copy[idx] = e.target.value;
                    setInstructions(copy);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setInstructions(instructions.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 font-bold p-1 mt-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setInstructions([...instructions, ''])}
              className="text-sm text-emerald-600 font-semibold hover:underline"
            >
              + Ajouter une étape
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow hover:bg-emerald-700 transition"
          >
            {editingRecipeId ? 'Enregistrer les modifications' : 'Enregistrer la recette'}
          </button>
        </form>
      )}

      {/* Cartes de Recettes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => {
          const totalKcal = recipe.ingredients.reduce((acc, i) => acc + (i.calories || 0), 0);
          const totalProt = recipe.ingredients.reduce((acc, i) => acc + (i.protein || 0), 0);
          const totalCarbs = recipe.ingredients.reduce((acc, i) => acc + (i.carbs || 0), 0);
          const totalFat = recipe.ingredients.reduce((acc, i) => acc + (i.fat || 0), 0);

          const servings = recipe.baseServings || 1;
          const perServingKcal = Math.round(totalKcal / servings);
          const perServingProt = Math.round(totalProt / servings);
          const perServingCarbs = Math.round(totalCarbs / servings);
          const perServingFat = Math.round(totalFat / servings);

          return (
            <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="h-44 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">📷 Sans photo</span>
                  )}
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-white/90 text-emerald-800 rounded-full shadow">
                    {recipe.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-gray-800 leading-snug">{recipe.title}</h3>
                    {recipe.sourceUrl && (
                      <a
                        href={recipe.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-50 text-blue-600 hover:text-blue-800 p-1.5 rounded-md border border-blue-200"
                        title="Ouvrir le lien d'origine"
                      >
                        🔗
                      </a>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 space-x-3">
                    <span>⏱️ {recipe.prepTimeMinutes} min</span>
                    <span>🍽️ {servings} portion(s)</span>
                  </div>

                  {/* Affichage des macros par portion sur la carte */}
                  <div className="space-y-1 mt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Par portion :</span>
                    <div className="grid grid-cols-4 gap-1 bg-gray-50 p-2 rounded text-center text-xs font-semibold text-gray-700">
                      <div>
                        <span className="block text-[10px] text-amber-600 uppercase font-bold">Kcal</span>
                        <span>{perServingKcal}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-emerald-600 uppercase font-bold">Prot</span>
                        <span>{perServingProt}g</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-blue-600 uppercase font-bold">Gluc</span>
                        <span>{perServingCarbs}g</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-rose-600 uppercase font-bold">Lip</span>
                        <span>{perServingFat}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex justify-between items-center border-t border-gray-50 mt-2 pt-2">
                <button
                  onClick={() => openRecipeView(recipe)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md transition"
                >
                  📖 Voir / Ajuster les portions
                </button>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
