/**
 * ############################################################
 * # FILE 3: THE INTERFACE (HTML + JavaScript)
 * # This is the main file that builds the screens and buttons.
 * ############################################################
 */

import React, { useState, useEffect } from 'react';
import { searchFoods, getNutrient } from '@/lib/usda-api';
import { showSuccess } from '@/utils/toast';
import { Search, User, Target, History, Calculator, CheckCircle, AlertCircle } from 'lucide-react';

const Index = () => {
  // # APP STATE: Remembering your data
  const [tab, setTab] = useState('home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>(() => JSON.parse(localStorage.getItem('app_logs') || '[]'));
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('app_profile') || '{"name":"User","weight":70,"height":175,"age":25,"goal":2000}'));

  // # SAVE DATA: Keep data even if you refresh
  useEffect(() => {
    localStorage.setItem('app_logs', JSON.stringify(logs));
    localStorage.setItem('app_profile', JSON.stringify(profile));
  }, [logs, profile]);

  // # LOGIC: Calculate BMI and Recommended Calories
  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const recommendedCals = Math.round((10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5);

  // # LOGIC: Calculate Today's Total Calories
  const todayCals = logs.reduce((sum, log) => sum + log.calories, 0);
  const isOverGoal = todayCals > profile.goal;

  // # ACTION: Search for food
  const handleSearch = async () => {
    const data = await searchFoods(query);
    setResults(data);
  };

  // # ACTION: Add food to history
  const addFood = (food: any) => {
    const cals = Math.round(getNutrient(food.foodNutrients, "Energy"));
    setLogs([...logs, { name: food.description, calories: cals, time: new Date().toLocaleTimeString() }]);
    showSuccess(`Added ${food.description}`);
    setTab('home');
    setResults([]);
    setQuery('');
  };

  return (
    <div className="max-w-md mx-auto p-6 pb-24">
      {/* # HEADER */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">NUTRI<span className="text-cyan-500">GO</span></h1>
        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold">{profile.name[0]}</div>
      </header>

      {/* # SCREEN: HOME / HISTORY */}
      {tab === 'home' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold mb-4">Today's History</h2>
          {logs.length === 0 ? (
            <div className="card text-center text-slate-500">No food logged yet.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="card !p-4 flex justify-between items-center mb-2">
                <div>
                  <p className="font-bold text-sm">{log.name}</p>
                  <p className="text-[10px] text-slate-500">{log.time}</p>
                </div>
                <span className="text-cyan-400 font-bold">{log.calories} kcal</span>
              </div>
            ))
          )}
          <button onClick={() => setLogs([])} className="text-xs text-slate-600 mt-4 underline">Clear History</button>
        </div>
      )}

      {/* # SCREEN: SEARCH */}
      {tab === 'search' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input className="input" placeholder="Search food..." value={query} onChange={e => setQuery(e.target.value)} />
            <button onClick={handleSearch} className="btn !p-3"><Search /></button>
          </div>
          {results.map((f, i) => (
            <div key={i} className="card !p-4 flex justify-between items-center">
              <p className="text-sm font-bold flex-1 pr-4">{f.description}</p>
              <button onClick={() => addFood(f)} className="text-cyan-500 font-bold">Add</button>
            </div>
          ))}
        </div>
      )}

      {/* # SCREEN: GOALS (The new menu you asked for) */}
      {tab === 'goals' && (
        <div className="space-y-6 animate-in zoom-in-95">
          <div className={`card text-center border-2 ${isOverGoal ? 'border-red-500/50' : 'border-green-500/50'}`}>
            {isOverGoal ? <AlertCircle className="mx-auto text-red-500 mb-2" /> : <CheckCircle className="mx-auto text-green-500 mb-2" />}
            <h3 className="text-lg font-bold">{isOverGoal ? 'Goal Exceeded!' : 'On Track'}</h3>
            <p className="text-4xl font-black my-4">{todayCals} / {profile.goal}</p>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${isOverGoal ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min((todayCals/profile.goal)*100, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              {isOverGoal ? `You are ${todayCals - profile.goal} kcal over your limit.` : `You have ${profile.goal - todayCals} kcal remaining.`}
            </p>
          </div>
          
          <div className="card">
            <h4 className="font-bold mb-2">Daily Insight</h4>
            <p className="text-sm text-slate-400">Based on your BMI of {bmi}, your body burns about {recommendedCals} calories just staying alive. Your current goal is set to {profile.goal} kcal.</p>
          </div>
        </div>
      )}

      {/* # SCREEN: PROFILE / BMI */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="card text-center">
            <Calculator className="mx-auto text-cyan-500 mb-2" />
            <p className="text-xs text-slate-500 uppercase font-bold">Your BMI</p>
            <p className="text-4xl font-black">{bmi}</p>
            <button onClick={() => setProfile({...profile, goal: recommendedCals})} className="text-[10px] text-cyan-500 mt-2 underline">Set Goal to Recommended ({recommendedCals})</button>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500">Name</label>
            <input className="input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            <label className="text-xs text-slate-500">Weight (kg)</label>
            <input className="input" type="number" value={profile.weight} onChange={e => setProfile({...profile, weight: Number(e.target.value)})} />
            <label className="text-xs text-slate-500">Height (cm)</label>
            <input className="input" type="number" value={profile.height} onChange={e => setProfile({...profile, height: Number(e.target.value)})} />
            <label className="text-xs text-slate-500">Daily Calorie Goal</label>
            <input className="input" type="number" value={profile.goal} onChange={e => setProfile({...profile, goal: Number(e.target.value)})} />
          </div>
        </div>
      )}

      {/* # BOTTOM NAVIGATION */}
      <nav className="nav-bar">
        <button onClick={() => setTab('home')} className={tab === 'home' ? 'text-cyan-500' : 'text-slate-500'}><History /></button>
        <button onClick={() => setTab('search')} className={tab === 'search' ? 'text-cyan-500' : 'text-slate-500'}><Search /></button>
        <button onClick={() => setTab('goals')} className={tab === 'goals' ? 'text-cyan-500' : 'text-slate-500'}><Target /></button>
        <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'text-cyan-500' : 'text-slate-500'}><User /></button>
      </nav>
    </div>
  );
};

export default Index;