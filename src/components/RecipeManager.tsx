'use client';

import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient } from '@/types';

export default function RecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [showForm, setShowForm] = useState(false);

  // Champs du formulaire de recette
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Recipe['category']>('Déjeuner');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [baseServings, setBaseServings] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [ingredients, setIngredients] = useState<Partial<Ingredient>[]>([
    { name: '', amount: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 },
  ]);

  // Charger les recettes enregistrées
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

  // Sauvegarder les recettes
  const saveRecipes = (updated: Recipe[]) => {
    setRecipes(updated);
    localStorage.setItem('nutriplanner_recipes', JSON.stringify(updated));
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title,
      category,
      prepTimeMinutes: Number(prepTimeMinutes),
      baseServings: Number(baseServings),
      imageUrl: imageUrl.trim() || undefined,
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

    saveRecipes([...recipes, newRecipe]);
    setShowForm(false);
    // Reset form
    setTitle('');
    setImageUrl('');
    setInstructions(['']);
    setIngredients([{ name: '', amount: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  };

  const handleDelete = (id: string) => {
    saveRecipes(recipes.filter((r) => r.id !== id));
  };

  // Filtrage des recettes
  const filteredRecipes = recipes.filter((r) => {
    const matchCat = selectedCategory === 'Toutes' || r.category === selectedCategory;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* En-tête + Bouton d'ajout */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Catalogue des Recettes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
        >
          {showForm ? 'Fermer' : '+ Ajouter une recette'}
        </button>
      </div>

      {/* Formulaire d'ajout de recette */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Nouvelle Recette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la recette</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Bowl d'Avoine Protéiné"
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
                <option value="Petit-déjeuner">Petit-déjeuner</option>
                <option value="Déjeuner">Déjeuner</option>
                <option value="Dîner">Dîner</option>
                <option value="Collation">Collation</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de portions de base</label>
              <input
                type="number"
                value={baseServings}
                onChange={(e) => setBaseServings(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien vers une image (URL optionnelle)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Section Ingrédients & Macros */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Ingrédients & Macros (par portion)</h3>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="grid grid-cols-2 md:grid-cols-7 gap-2 items-center bg-gray-50 p-2 rounded">
                <input
                  type="text"
                  placeholder="Ingrédient"
                  value={ing.name}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].name = e.target.value;
                    setIngredients(copy);
                  }}
                  className="p-1 border rounded text-sm md:col-span-2"
                />
                <input
                  type="number"
                  placeholder="Qté"
                  value={ing.amount}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].amount = Number(e.target.value);
                    setIngredients(copy);
                  }}
                  className="p-1 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Unité"
                  value={ing.unit}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].unit = e.target.value;
                    setIngredients(copy);
                  }}
                  className="p-1 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Kcal"
                  value={ing.calories}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].calories = Number(e.target.value);
                    setIngredients(copy);
                  }}
                  className="p-1 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Prot (g)"
                  value={ing.protein}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].protein = Number(e.target.value);
                    setIngredients(copy);
                  }}
                  className="p-1 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Gluc (g)"
                  value={ing.carbs}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].carbs = Number(e.target.value);
                    setIngredients(copy);
                  }}
                  className="p-1 border rounded text-sm"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="text-sm text-emerald-600 font-semibold hover:underline"
            >
              + Ajouter un ingrédient
            </button>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Instructions</h3>
            {instructions.map((inst, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Étape ${idx + 1}`}
                value={inst}
                onChange={(e) => {
                  const copy = [...instructions];
                  copy[idx] = e.target.value;
                  setInstructions(copy);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
              />
            ))}
            <button
              type="button"
              onClick={handleAddInstruction}
              className="text-sm text-emerald-600 font-semibold hover:underline"
            >
              + Ajouter une étape
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow hover:bg-emerald-700 transition"
          >
            Enregistrer la recette
          </button>
        </form>
      )}

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Rechercher une recette..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['Toutes', 'Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des Recettes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.length === 0 ? (
          <p className="text-gray-500 italic col-span-full text-center py-8">
            Aucune recette trouvée. Ajoutez-en une pour commencer !
          </p>
        ) : (
          filteredRecipes.map((recipe) => {
            const totalKcal = recipe.ingredients.reduce((acc, i) => acc + i.calories, 0);
            const totalProt = recipe.ingredients.reduce((acc, i) => acc + i.protein, 0);

            return (
              <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col justify-between">
                {recipe.imageUrl && (
                  <img src={recipe.imageUrl} alt={recipe.title} className="h-40 w-full object-cover" />
                )}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800">{recipe.title}</h3>
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                      {recipe.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-x-3">
                    <span>⏱️ {recipe.prepTimeMinutes} min</span>
                    <span>🍽️ {recipe.baseServings} portion(s)</span>
                  </div>
                  <div className="flex justify-between bg-emerald-50 p-2 rounded text-xs font-semibold text-emerald-800 mt-2">
                    <span>{totalKcal} kcal</span>
                    <span>{totalProt}g Protéines</span>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
