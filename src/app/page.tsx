'use client';

import React, { useState } from 'react';
import RecipeManager from '@/components/RecipeManager';
import MealPlanner from '@/components/MealPlanner';
import ShoppingList from '@/components/ShoppingList';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'planner' | 'shopping'>('recipes');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Barre de navigation principale */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥑</span>
            <span className="font-extrabold text-lg tracking-tight text-emerald-800">
              NutriPlanner
            </span>
          </div>

          {/* Navigation par Onglets */}
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'recipes'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📖 <span>Recettes</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'planner'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 <span>Planning</span>
            </button>

            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'shopping'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛒 <span>Liste de courses</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Contenu principal selon l'onglet actif */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'recipes' && <RecipeManager />}
        {activeTab === 'planner' && <MealPlanner />}
        {activeTab === 'shopping' && <ShoppingList />}
      </main>
    </div>
  );
}
