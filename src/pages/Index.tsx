/* ############################################################
   # MAIN FILE: HTML & JAVASCRIPT (React)
   # This file builds the screens and handles user clicks.
   ############################################################ */

import React, { useState } from 'react';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Search, LayoutDashboard, User, Target, Flame, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const [tab, setTab] = useState('home');
  const { profile, setProfile, addLog, getTodayCalories, logs } = useNutritionStore();
  const [search, setSearch] = useState('');

  const todayCals = getTodayCalories();
  const calorieGoal = profile.calorieGoal || 2000;
  const percent = Math.min((todayCals / calorieGoal) * 100, 100);
  const isOver = todayCals > calorieGoal;

  // # Function to simulate adding food (Simplified for this example)
  const quickAdd = (name: string, cals: number) => {
    addLog(name, cals);
    showSuccess(`Added ${name} (${cals} kcal)`);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen">
      {/* # HEADER */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <h1 className="text-2xl font-black text-white">NUTRI<span className="text-cyan-500">INTEL</span></h1>
        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold">{profile.name[0]}</div>
      </header>

      {/* # TAB: HOME / DASHBOARD */}
      {tab === 'home' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* # GOALS MENU (New Simplified Version) */}
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-cyan-400 h-5 w-5" />
              <h2 className="text-lg font-bold">Daily Goals</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Calories Eaten</span>
                <span className="font-bold text-white">{todayCals} / {calorieGoal} kcal</span>
              </div>
              <Progress value={percent} className="h-3 bg-slate-800" />
              
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${isOver ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {isOver ? (
                  <><AlertCircle className="h-4 w-4" /> Goal Exceeded by {todayCals - calorieGoal} kcal</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> {calorieGoal - todayCals} kcal remaining</>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Quick Add</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => quickAdd('Apple', 95)} className="glass-card !p-4 !mb-0 text-left hover:border-cyan-500/50 transition-all">
              <p className="font-bold">🍎 Apple</p>
              <p className="text-xs text-slate-500">95 kcal</p>
            </button>
            <button onClick={() => quickAdd('Chicken', 165)} className="glass-card !p-4 !mb-0 text-left hover:border-cyan-500/50 transition-all">
              <p className="font-bold">🍗 Chicken</p>
              <p className="text-xs text-slate-500">165 kcal</p>
            </button>
          </div>
        </div>
      )}

      {/* # TAB: SEARCH */}
      {tab === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              className="input-field pl-10" 
              placeholder="Search 300,000+ foods..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="text-center text-slate-500 py-10">Search results will appear here...</p>
        </div>
      )}

      {/* # TAB: PROFILE */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="glass-card">
            <h3 className="font-bold mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Name</label>
                <input className="input-field mt-1" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Daily Calorie Goal</label>
                <input type="number" className="input-field mt-1" value={profile.calorieGoal} onChange={e => setProfile({...profile, calorieGoal: Number(e.target.value)})} />
              </div>
              <button onClick={() => showSuccess("Profile Saved!")} className="btn-primary mt-4">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* # BOTTOM NAVIGATION */}
      <nav className="nav-bar">
        <button onClick={() => setTab('home')} className={tab === 'home' ? 'text-cyan-400' : 'text-slate-500'}><LayoutDashboard /></button>
        <button onClick={() => setTab('search')} className={tab === 'search' ? 'text-cyan-400' : 'text-slate-500'}><Search /></button>
        <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'text-cyan-400' : 'text-slate-500'}><User /></button>
      </nav>
    </div>
  );
};

export default Index;