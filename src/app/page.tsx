import RecipeManager from '@/components/RecipeManager';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-emerald-700">Nutriplanner</h1>
        <p className="text-gray-600">Gérez vos recettes, votre planning et vos macros facilement.</p>
      </header>

      <RecipeManager />
    </main>
  );
}