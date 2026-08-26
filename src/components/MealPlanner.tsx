'use client';

import React, { useState, useEffect } from 'react';
import { Recipe, MealType, PlannedMeal, DailyTargets } from '@/types';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEAL_TYPES: MealType[] = ['Petit dej', 'Déjeuner', 'Dîner', 'Snack'];

const DEFAULT_TARGETS: DailyTargets = {
  calories: 2200,
  protein: 140,
  carbs: 250,
  fat: 70,
};

export default function MealPlanner() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, PlannedMeal[]>>({});
  const [targets, setTargets] = useState<DailyTargets>(DEFAULT_TARGETS);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Formulaire de calcul automatique des besoins
  const [calcGender, setCalcGender] = useState<'homme' | 'femme'>('femme');
  const [calcAge, setCalcAge] = useState<number>(30);
  const [calcWeight, setCalcWeight] = useState<number>(65);
  const [calcHeight, setCalcHeight] = useState<number>(170);
  const [calcActivity, setCalcActivity] = useState<number>(1.55); // Modéré
  const [calcGoal, setCalcGoal] = useState<'maintain' | 'lose' | 'gain'>('maintain');

  // État de la modale d'ajout de repas
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Déjeuner');
  const [selectedServings, setSelectedServings] = useState<number>(1);

  // Charger les recettes, le planning et les objectifs depuis localStorage
  useEffect(() => {
    const savedRecipes = localStorage.getItem('nutriplanner_recipes');
    if (savedRecipes) {
      try { setRecipes(JSON.parse(savedRecipes)); } catch (e) { console.error(e); }
    }

    const savedPlan = localStorage.getItem('nutriplanner_weekly_plan');
    if (savedPlan) {
      try { setWeeklyPlan(JSON.parse(savedPlan)); } catch (e) { console.error(e); }
    } else {
      const initial: Record<string, PlannedMeal[]> = {};
      DAYS.forEach((day) => { initial[day] = []; });
      setWeeklyPlan(initial);
    }

    const savedTargets = localStorage.getItem('nutriplanner_targets');
    if (savedTargets) {
      try { setTargets(JSON.parse(savedTargets)); } catch (e) { console.error(e); }
    }
  }, []);

  const savePlan = (updated: Record<string, PlannedMeal[]>) => {
    setWeeklyPlan(updated);
    localStorage.setItem('nutriplanner_weekly_plan', JSON.stringify(updated));
  };

  const saveTargets = (updated: DailyTargets) => {
    setTargets(updated);
    localStorage.setItem('nutriplanner_targets', JSON.stringify(updated));
  };

  // Calcul automatique basé sur l'équation de Mifflin-St Jeor
  const calculateTargets = () => {
    let bmr = 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge;
    bmr += calcGender === 'homme' ? 5 : -161;

    let tdee = bmr * calcActivity;

    if (calcGoal === 'lose') tdee -= 350;
    if (calcGoal === 'gain') tdee += 350;

    const targetKcal = Math.round(tdee);
    
    const proteinGrams = Math.round(calcWeight * 2);
    const fatGrams = Math.round(calcWeight * 1);
    const proteinKcal = proteinGrams * 4;
    const fatKcal = fatGrams * 9;
    const carbsKcal = Math.max(0, targetKcal - (proteinKcal + fatKcal));
    const carbsGrams = Math.round(carbsKcal / 4);

    const calculated: DailyTargets = {
      calories: targetKcal,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams,
    };

    setTargets(calculated);
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDay || !selectedRecipeId) return;

    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) return;

    const baseServings = recipe.baseServings || 1;
    const ratio = selectedServings / baseServings;

    const totalKcal = recipe.ingredients.reduce((a, b) => a + (b.calories || 0), 0) * ratio;
    const totalProt = recipe.ingredients.reduce((a, b) => a + (b.protein || 0), 0) * ratio;
    const totalCarbs = recipe.ingredients.reduce((a, b) => a + (b.carbs || 0), 0) * ratio;
    const totalFat = recipe.ingredients.reduce((a, b) => a + (b.fat || 0), 0) * ratio;

    const newMeal: PlannedMeal = {
      id: Date.now().toString(),
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      mealType: selectedMealType,
      servings: selectedServings,
      calories: Math.round(totalKcal),
      protein: Math.round(totalProt),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
    };

    const updatedDayMeals = [...(weeklyPlan[activeDay] || []), newMeal];
    savePlan({ ...weeklyPlan, [activeDay]: updatedDayMeals });

    setActiveDay(null);
    setSelectedRecipeId('');
    setSelectedServings(1);
  };

  const handleRemoveMeal = (day: string, mealId: string) => {
    const updated = (weeklyPlan[day] || []).filter((m) => m.id !== mealId);
    savePlan({ ...weeklyPlan, [day]: updated });
  };

  const handleClearWeek = () => {
    if (confirm('Voulez-vous vraiment effacer toute la planification de la semaine ?')) {
      const empty: Record<string, PlannedMeal[]> = {};
      DAYS.forEach((day) => { empty[day] = []; });
      savePlan(empty);
    }
  };

  // Calcul des moyennes hebdomadaires
  const calculateWeeklyAverages = () => {
    let totalKcal = 0;
    let totalProt = 0;
    let activeDaysCount = 0;

    DAYS.forEach((day) => {
      const meals = weeklyPlan[day] || [];
      if (meals.length > 0) {
        totalKcal += meals.reduce((acc, m) => acc + m.calories, 0);
        totalProt += meals.reduce((acc, m) => acc + m.protein, 0);
        activeDaysCount += 1;
      }
    });

    const div = activeDaysCount || 1;
    return {
      avgKcal: Math.round(totalKcal / div),
      avgProt: Math.round(totalProt / div),
      activeDays: activeDaysCount,
    };
  };

  const weeklyAvg = calculateWeeklyAverages();

  // Helper de rendu pour les cartes de jour/bloc
  const renderDayCard = (
    title: string,
    daysList: string[],
    targetMultiplier: number = 1
  ) => {
    const allMeals = daysList.flatMap((day) =>
      (weeklyPlan[day] || []).map((m) => ({ ...m, dayOrigin: day }))
    );

    const totalKcal = allMeals.reduce((a, b) => a + b.calories, 0);
    const totalProt = allMeals.reduce((a, b) => a + b.protein, 0);
    const totalCarbs = allMeals.reduce((a, b) => a + b.carbs, 0);
    const totalFat = allMeals.reduce((a, b) => a + b.fat, 0);

    const currentTargetKcal = targets.calories * targetMultiplier;
    const currentTargetProt = targets.protein * targetMultiplier;

    const kcalPercent = Math.min(100, Math.round((totalKcal / currentTargetKcal) * 100));
    const protPercent = Math.min(100, Math.round((totalProt / currentTargetProt) * 100));

    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-between overflow-hidden">
        <div>
          {/* En-tête */}
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            {daysList.length === 1 ? (
              <button
                onClick={() => setActiveDay(daysList[0])}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded transition"
              >
                + Repas
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveDay('Samedi')}
                  className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-1.5 py-0.5 rounded transition"
                >
                  + Sam
                </button>
                <button
                  onClick={() => setActiveDay('Dimanche')}
                  className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-1.5 py-0.5 rounded transition"
                >
                  + Dim
                </button>
              </div>
            )}
          </div>

          {/* Section Résumé Macros et Nutriments */}
          <div className="p-3 bg-slate-50/70 border-b border-gray-100 space-y-2">
            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div className="bg-amber-50/80 border border-amber-200/70 py-1 px-1.5 rounded-lg">
                <span className="block text-[9px] uppercase font-bold text-amber-800">Calories</span>
                <span className="text-xs font-black text-amber-950">
                  {totalKcal} <span className="text-[9px] font-normal text-amber-700">kcal</span>
                </span>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200/70 py-1 px-1.5 rounded-lg">
                <span className="block text-[9px] uppercase font-bold text-emerald-800">Protéines</span>
                <span className="text-xs font-black text-emerald-950">
                  {totalProt} <span className="text-[9px] font-normal text-emerald-700">g</span>
                </span>
              </div>
            </div>

            {/* Barres de progression */}
            <div className="space-y-1 pt-0.5">
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] text-gray-500 font-medium">
                  <span>Énergie</span>
                  <span>{kcalPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-1 rounded-full ${kcalPercent > 100 ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${kcalPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] text-gray-500 font-medium">
                  <span>Protéines</span>
                  <span>{protPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-emerald-500"
                    style={{ width: `${protPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Récapitulatif Glucides & Lipides */}
            <div className="flex justify-around text-[10px] text-gray-500 pt-1 font-mono border-t border-slate-200/60">
              <span>G: <strong className="text-slate-700">{totalCarbs}g</strong></span>
              <span>L: <strong className="text-slate-700">{totalFat}g</strong></span>
            </div>
          </div>

          {/* Liste des repas */}
          <div className="p-2 space-y-2 max-h-[360px] overflow-y-auto">
            {allMeals.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic text-center py-6">Aucun repas</p>
            ) : (
              allMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-2 bg-gray-50 rounded-lg border border-gray-200/60 text-xs space-y-1 relative group hover:border-emerald-300 transition"
                >
                  <div className="flex justify-between items-start gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        {meal.mealType}
                      </span>
                      {daysList.length > 1 && (
                        <span className="text-[9px] font-semibold text-gray-500 bg-gray-200/70 px-1 py-0.5 rounded">
                          {meal.dayOrigin.slice(0, 3)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMeal(meal.dayOrigin, meal.id)}
                      className="text-gray-400 hover:text-red-500 font-bold text-xs leading-none"
                      title="Supprimer le repas"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-semibold text-gray-800 leading-tight">{meal.recipeTitle}</p>
                  
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 border-t border-gray-200/40">
                    <span className="font-medium text-gray-600">{meal.servings} pers.</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-800">{meal.calories} kcal</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-bold text-emerald-800">{meal.protein}g P</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Entête & Contrôles */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Planificateur de Semaine</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Organisez vos repas et suivez vos apports nutritionnels au quotidien.
          </p>
        </div>

        {/* Moyennes & Boutons d'action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] font-semibold uppercase">Moy. Kcal</span>
              <span className="font-bold text-slate-800">{weeklyAvg.avgKcal} <span className="text-[10px] font-normal text-gray-500">/ {targets.calories}</span></span>
            </div>
            <div className="w-[1px] h-6 bg-slate-200"></div>
            <div>
              <span className="text-gray-400 block text-[10px] font-semibold uppercase">Moy. Protéines</span>
              <span className="font-bold text-emerald-700">{weeklyAvg.avgProt}g <span className="text-[10px] font-normal text-gray-500">/ {targets.protein}g</span></span>
            </div>
          </div>

          <button
            onClick={() => setShowTargetModal(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-3.5 py-2 rounded-lg text-xs transition border border-emerald-200 flex items-center gap-1.5"
          >
            <span>🎯</span>
            <span>Objectifs : {targets.calories} kcal / {targets.protein}g prot</span>
          </button>

          <button
            onClick={handleClearWeek}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium px-3.5 py-2 rounded-lg text-xs transition border border-rose-200"
          >
            🗑️ Vider
          </button>
        </div>
      </div>

      {/* Modale d'Objectifs */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">Définir vos objectifs nutritionnels</h3>
              <button onClick={() => setShowTargetModal(false)} className="text-gray-400 font-bold hover:text-gray-600">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <span>⚡</span> Calculateur de besoins énergétiques
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-gray-600 block mb-1">Genre</label>
                  <select
                    value={calcGender}
                    onChange={(e) => setCalcGender(e.target.value as 'homme' | 'femme')}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="femme">Femme</option>
                    <option value="homme">Homme</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Âge</label>
                  <input
                    type="number"
                    value={calcAge}
                    onChange={(e) => setCalcAge(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Taille (cm)</label>
                  <input
                    type="number"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-gray-600 block mb-1">Niveau d'activité</label>
                  <select
                    value={calcActivity}
                    onChange={(e) => setCalcActivity(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value={1.2}>Sédentaire (bureau)</option>
                    <option value={1.375}>Légèrement actif (1-3 h/sem.)</option>
                    <option value={1.55}>Modérément actif (3-5 h/sem.)</option>
                    <option value={1.725}>Très actif (6-7 h/sem.)</option>
                    <option value={1.9}>Athlète / Entraînement intense</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600 block mb-1">Objectif principal</label>
                  <select
                    value={calcGoal}
                    onChange={(e) => setCalcGoal(e.target.value as 'maintain' | 'lose' | 'gain')}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="maintain">Maintien du poids</option>
                    <option value="lose">Perte de gras (-350 kcal)</option>
                    <option value="gain">Prise de masse / Perf (+350 kcal)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={calculateTargets}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-lg text-xs transition"
              >
                Calculer automatiquement les macros
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-gray-700">Ajustement manuel direct :</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={targets.calories}
                    onChange={(e) => setTargets({ ...targets, calories: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Protéines (g)</label>
                  <input
                    type="number"
                    value={targets.protein}
                    onChange={(e) => setTargets({ ...targets, protein: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Glucides (g)</label>
                  <input
                    type="number"
                    value={targets.carbs}
                    onChange={(e) => setTargets({ ...targets, carbs: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Lipides (g)</label>
                  <input
                    type="number"
                    value={targets.fat}
                    onChange={(e) => setTargets({ ...targets, fat: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                saveTargets(targets);
                setShowTargetModal(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition shadow"
            >
              Valider et enregistrer ces objectifs
            </button>
          </div>
        </div>
      )}

      {/* Modale d'ajout de repas */}
      {activeDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleAddMeal} className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800">Ajouter un repas au <span className="text-emerald-700">{activeDay}</span></h3>
              <button type="button" onClick={() => setActiveDay(null)} className="text-gray-400 font-bold">✕</button>
            </div>

            {recipes.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                ⚠️ Votre catalogue est vide. Ajoutez d'abord des recettes dans l'onglet <strong>Catalogue</strong>.
              </p>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Sélectionner une recette</label>
                  <select
                    required
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"
                  >
                    <option value="">-- Choisir une recette --</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>{r.title} ({r.category})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Moment du repas</label>
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                      className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"
                    >
                      {MEAL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Portions</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedServings}
                      onChange={(e) => setSelectedServings(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2 border rounded-lg text-sm bg-gray-50 font-bold text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedRecipeId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition shadow"
                >
                  + Valider l'ajout
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {/* Grille de 2 lignes */}
      <div className="space-y-4">
        {/* Ligne 1 : Lundi, Mardi, Mercredi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderDayCard('Lundi', ['Lundi'])}
          {renderDayCard('Mardi', ['Mardi'])}
          {renderDayCard('Mercredi', ['Mercredi'])}
        </div>

        {/* Ligne 2 : Jeudi, Vendredi, Week-end */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderDayCard('Jeudi', ['Jeudi'])}
          {renderDayCard('Vendredi', ['Vendredi'])}
          {renderDayCard('Week-end (Samedi & Dimanche)', ['Samedi', 'Dimanche'], 2)}
        </div>
      </div>
    </div>
  );
}
