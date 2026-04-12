/* ############################################################
   # MAIN PAGE: INDEX
   # This file coordinates the different screens of the app.
   ############################################################ */

import React, { useState } from 'react';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { LayoutDashboard, Search, User } from 'lucide-react';
import Goals from '@/components/Goals';
import FoodSearch from '@/components/FoodSearch';
import Profile from '@/components/Profile';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const [tab, setTab] = useState('home');
  const { profile, setProfile, addLog, getTodayCalories } = useNutritionStore();

  const handleAddFood = (name: string, cals: number) => {
    addLog(name, cals);
    showSuccess(`Added ${name}`);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen">
      {/* # HEADER */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <h1 className="text-2xl font-black text-white">NUTRI<span className="text-cyan-500">INTEL</span></h1>
        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold">
          {profile.name ? profile.name[0] : 'U'}
        </div>
      </header>

      {/* # CONTENT AREA */}
      <main className="animate-in fade-in duration-500">
        {tab === 'home' && (
          <div className="space-y-6">
            <Goals todayCals={getTodayCalories()} calorieGoal={profile.calorieGoal} />
            
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Quick Add</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleAddFood('Apple', 95)} className="glass-card !p-4 !mb-0 text-left hover:border-cyan-500/50 transition-all">
                <p className="font-bold">🍎 Apple</p>
                <p className="text-xs text-slate-500">95 kcal</p>
              </button>
              <button onClick={() => handleAddFood('Chicken', 165)} className="glass-card !p-4 !mb-0 text-left hover:border-cyan-500/50 transition-all">
                <p className="font-bold">🍗 Chicken</p>
                <p className="text-xs text-slate-500">165 kcal</p>
              </button>
            </div>
          </div>
        )}

        {tab === 'search' && <FoodSearch onAdd={handleAddFood} />}

        {tab === 'profile' && <Profile profile={profile} setProfile={setProfile} />}
      </main>

      {/* # BOTTOM NAVIGATION */}
      <nav className="nav-bar">
        <button onClick={() => setTab('home')} className={tab === 'home' ? 'text-cyan-400' : 'text-slate-500'}>
          <LayoutDashboard />
        </button>
        <button onClick={() => setTab('search')} className={tab === 'search' ? 'text-cyan-400' : 'text-slate-500'}>
          <Search />
        </button>
        <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'text-cyan-400' : 'text-slate-500'}>
          <User />
        </button>
      </nav>
    </div>
  );
};

export default Index;