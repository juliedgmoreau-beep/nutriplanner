'use client';

import React, { useState, useEffect } from 'react';
import { Recipe, PlannedMeal } from '@/types';

type ExtendedRecipe = Recipe & {
  sourceUrl?: string;
};

interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
  isManual?: boolean;
}

const CATEGORY_MAPPING: Record<string, string> = {
  // Produits frais / Légumes / Fruits
  'carotte': '🍎 Fruits & Légumes',
  'carrots': '🍎 Fruits & Légumes',
  'carrot': '🍎 Fruits & Légumes',
  'garlic': '🍎 Fruits & Légumes',
  'ail': '🍎 Fruits & Légumes',
  'spring onion': '🍎 Fruits & Légumes',
  'spring onions': '🍎 Fruits & Légumes',
  'oignon': '🍎 Fruits & Légumes',
  'banane': '🍎 Fruits & Légumes',
  'banana': '🍎 Fruits & Légumes',
  'pomme': '🍎 Fruits & Légumes',
  'apple': '🍎 Fruits & Légumes',
  'avocat': '🍎 Fruits & Légumes',
  'avocado': '🍎 Fruits & Légumes',
  'patate douce': '🍎 Fruits & Légumes',

  // Viandes & Poissons
  'poulet': '🍗 Viandes & Poissons',
  'blanc de poulet': '🍗 Viandes & Poissons',
  'chicken': '🍗 Viandes & Poissons',
  'saumon': '🍗 Viandes & Poissons',
  'salmon': '🍗 Viandes & Poissons',

  // Produits laitiers & Oeufs
  'oeuf': '🥛 Produits laitiers & Œufs',
  'œuf': '🥛 Produits laitiers & Œufs',
  'egg': '🥛 Produits laitiers & Œufs',
  'lait': '🥛 Produits laitiers & Œufs',
  'milk': '🥛 Produits laitiers & Œufs',
  'lait d\'amande': '🥛 Produits laitiers & Œufs',
  'yaourt grec': '🥛 Produits laitiers & Œufs',
  'skyr': '🥛 Produits laitiers & Œufs',

  // Épicerie & Céréales
  'avoine': '🌾 Épicerie & Céréales',
  'flocons d\'avoine': '🌾 Épicerie & Céréales',
  'oats': '🌾 Épicerie & Céréales',
  'riz': '🌾 Épicerie & Céréales',
  'riz basmati': '🌾 Épicerie & Céréales',
  'rice': '🌾 Épicerie & Céréales',
  'glutinous rice flour': '🌾 Épicerie & Céréales',
  'rice flour': '🌾 Épicerie & Céréales',
  'farine de riz': '🌾 Épicerie & Céréales',
  'farine': '🌾 Épicerie & Céréales',
  'flour': '🌾 Épicerie & Céréales',
  'whey': '🌾 Épicerie & Céréales',
  'proteine en poudre': '🌾 Épicerie & Céréales',
  'beurre de cacahuete': '🌾 Épicerie & Céréales',
  'peanut butter': '🌾 Épicerie & Céréales',
  'oil': '🌾 Épicerie & Céréales',
  'huile': '🌾 Épicerie & Céréales',
  'huile d\'olive': '🌾 Épicerie & Céréales',
  'soy sauce': '🌾 Épicerie & Céréales',
  'sauce soja': '🌾 Épicerie & Céréales',
  'vinegar': '🌾 Épicerie & Céréales',
  'vinaigre': '🌾 Épicerie & Céréales',
};

const DEFAULT_CATEGORY = '🛒 Épicerie / Autre';

export default function ShoppingList() {
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, PlannedMeal[]>>({});
  const [recipes, setRecipes] = useState<ExtendedRecipe[]>([]);
  const [globalPeopleCount, setGlobalPeopleCount] = useState<number>(1);
  const [overridePeople, setOverridePeople] = useState<boolean>(false);
  
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemAmount, setManualItemAmount] = useState('');
  const [manualItemUnit, setManualItemUnit] = useState('g');
  const [copied, setCopied] = useState(false);

  // Chargement des données du localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('nutriplanner_weekly_plan');
    if (savedPlan) {
      try { setWeeklyPlan(JSON.parse(savedPlan)); } catch (e) { console.error(e); }
    }

    const savedRecipes = localStorage.getItem('nutriplanner_recipes');
    if (savedRecipes) {
      try { setRecipes(JSON.parse(savedRecipes)); } catch (e) { console.error(e); }
    }
  }, []);

  // Génération automatique de la liste de courses
  useEffect(() => {
    const aggregatedMap: Record<string, ShoppingItem> = {};

    Object.values(weeklyPlan).forEach((meals) => {
      meals.forEach((meal) => {
        const recipe = recipes.find((r) => r.id === meal.recipeId);
        if (!recipe) return;

        const effectiveServings = overridePeople ? globalPeopleCount : (meal.servings || 1);
        const baseServings = recipe.baseServings || 1;
        const ratio = effectiveServings / baseServings;

        recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.trim().toLowerCase()}_${(ing.unit || 'g').trim().toLowerCase()}`;
          const amountToAdd = (ing.amount || 0) * ratio;

          const lowerName = ing.name.trim().toLowerCase();
          let category = DEFAULT_CATEGORY;
          for (const [k, cat] of Object.entries(CATEGORY_MAPPING)) {
            if (lowerName.includes(k)) {
              category = cat;
              break;
            }
          }

          if (aggregatedMap[key]) {
            aggregatedMap[key].amount += amountToAdd;
          } else {
            aggregatedMap[key] = {
              id: key,
              name: ing.name.charAt(0).toUpperCase() + ing.name.slice(1),
              amount: amountToAdd,
              unit: ing.unit || 'g',
              category,
              checked: false,
            };
          }
        });
      });
    });

    setShoppingItems((prevItems) => {
      const checkedSet = new Set(prevItems.filter((i) => i.checked).map((i) => i.id));
      const manualItems = prevItems.filter((i) => i.isManual);

      const generatedList = Object.values(aggregatedMap).map((item) => ({
        ...item,
        amount: Number(item.amount.toFixed(1)),
        checked: checkedSet.has(item.id),
      }));

      return [...generatedList, ...manualItems];
    });
  }, [weeklyPlan, recipes, globalPeopleCount, overridePeople]);

  const toggleCheck = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: `manual_${Date.now()}`,
      name: manualItemName.trim(),
      amount: parseFloat(manualItemAmount) || 1,
      unit: manualItemUnit,
      category: DEFAULT_CATEGORY,
      checked: false,
      isManual: true,
    };

    setShoppingItems((prev) => [...prev, newItem]);
    setManualItemName('');
    setManualItemAmount('');
  };

  const removeItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((i) => i.id !== id));
  };

  const categories = Array.from(new Set(shoppingItems.map((i) => i.category)));

  // Fonction pour copier la liste sous forme de texte brut
  const handleCopyText = () => {
    if (shoppingItems.length === 0) return;

    let textContent = `🛒 LISTE DE COURSES NUTRIPLANNER (${globalPeopleCount} pers.)\n\n`;

    categories.forEach((cat) => {
      const items = shoppingItems.filter((i) => i.category === cat);
      if (items.length > 0) {
        textContent += `${cat.toUpperCase()}\n`;
        items.forEach((item) => {
          const status = item.checked ? '[x]' : '[ ]';
          textContent += `${status} ${item.amount} ${item.unit} ${item.name}\n`;
        });
        textContent += `\n`;
      }
    });

    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Fonction pour lancer l'impression / export PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intégration de règles CSS spécifiques pour l'impression */}
      <style jsx global>{`
        @media print {
          header, nav, form, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Header & Options */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🛒 Liste de Courses Intelligente</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Générée automatiquement d'après vos repas planifiés de la semaine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Boutons d'exportation */}
            <div className="flex items-center gap-2 no-print">
              <button
                onClick={handleCopyText}
                disabled={shoppingItems.length === 0}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
                title="Copier au format texte (WhatsApp, Notes, etc.)"
              >
                {copied ? '✅ Copié !' : '📋 Copier'}
              </button>

              <button
                onClick={handlePrint}
                disabled={shoppingItems.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                title="Imprimer ou Sauvegarder en PDF"
              >
                🖨️ Imprimer / PDF
              </button>
            </div>

            {/* Ajustement personnes */}
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/80 flex items-center gap-2 no-print">
              <span className="text-xs font-bold text-emerald-900">👥 Ajuster :</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setGlobalPeopleCount((p) => Math.max(1, p - 1));
                    setOverridePeople(true);
                  }}
                  className="w-6 h-6 bg-white text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center shadow-sm"
                >
                  -
                </button>
                <span className="font-extrabold text-xs text-emerald-900 px-1">
                  {globalPeopleCount} pers.
                </span>
                <button
                  onClick={() => {
                    setGlobalPeopleCount((p) => p + 1);
                    setOverridePeople(true);
                  }}
                  className="w-6 h-6 bg-white text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center shadow-sm"
                >
                  +
                </button>
              </div>

              {overridePeople && (
                <button
                  onClick={() => setOverridePeople(false)}
                  className="text-[10px] text-emerald-700 underline font-semibold ml-1"
                  title="Revenir aux portions définies dans le menu hebdomadaire"
                >
                  (Reset)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ajout manuel d'articles */}
      <form onSubmit={handleAddManualItem} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-2 items-center text-xs no-print">
        <span className="font-bold text-gray-700 mr-2">➕ Ajouter un article hors-menu :</span>
        <input
          type="text"
          placeholder="Ex: Papier essuie-tout, Sel..."
          value={manualItemName}
          onChange={(e) => setManualItemName(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg flex-1 min-w-[150px] bg-gray-50"
        />
        <input
          type="number"
          placeholder="Qté"
          value={manualItemAmount}
          onChange={(e) => setManualItemAmount(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-16 text-center bg-gray-50"
        />
        <input
          type="text"
          placeholder="Unité (ex: g, rouleau)"
          value={manualItemUnit}
          onChange={(e) => setManualItemUnit(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-24 text-center bg-gray-50"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition"
        >
          Ajouter
        </button>
      </form>

      {/* Affichage des articles par rayon */}
      {shoppingItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-2 print-card">
          <span className="text-4xl">📝</span>
          <h3 className="text-sm font-bold text-gray-700">Votre liste de courses est vide</h3>
          <p className="text-xs text-gray-500">
            Ajoutez des repas à votre menu hebdomadaire pour remplir automatiquement votre liste.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-full-width">
          {categories.map((cat) => {
            const items = shoppingItems.filter((i) => i.category === cat);
            return (
              <div key={cat} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 print-card">
                <h2 className="font-bold text-gray-800 text-sm border-b pb-2 flex justify-between items-center">
                  <span>{cat}</span>
                  <span className="text-xs text-gray-400 font-normal no-print">
                    {items.filter((i) => i.checked).length} / {items.length}
                  </span>
                </h2>

                <ul className="space-y-2 text-xs">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className={`flex justify-between items-center p-2 rounded-lg transition ${
                        item.checked ? 'bg-gray-50 text-gray-400 line-through' : 'hover:bg-emerald-50/50 text-gray-800'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleCheck(item.id)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 no-print"
                        />
                        <span className="font-medium">
                          <strong className={item.checked ? 'text-gray-400' : 'text-emerald-800 font-bold'}>
                            {item.amount} {item.unit}
                          </strong>{' '}
                          {item.name}
                        </span>
                      </label>

                      {item.isManual && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-rose-500 font-bold px-1 text-xs no-print"
                          title="Supprimer l'article manuel"
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
