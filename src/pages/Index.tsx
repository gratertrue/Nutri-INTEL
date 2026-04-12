import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import NutritionDashboard from '@/components/NutritionDashboard';
import FoodSearch from '@/components/FoodSearch';
import RecipeBuilder from '@/components/RecipeBuilder';
import MealPlanner from '@/components/MealPlanner';
import NutritionHistory from '@/components/NutritionHistory';
import WaterTracker from '@/components/WaterTracker';
import SmartCoach from '@/components/SmartCoach';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess } from '@/utils/toast';
import { Scale, User as UserIcon, Activity, Zap, Moon, Footprints, Play, Square, Utensils, Calendar, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { profile, setProfile, achievements, calculateBMI, wearableData, toggleSleep, calculateRecommendedCalories } = useNutritionStore();

  const handleAutoCalorie = () => {
    const recommended = calculateRecommendedCalories();
    setProfile({ ...profile, calorieGoal: recommended });
    showSuccess(`Calorie goal updated to ${recommended} kcal based on your BMI and profile!`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <Footprints className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Steps Today</p>
                    <p className="text-xl font-bold text-white">{wearableData.steps.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={cn(
                "bg-slate-900/50 border-slate-800 backdrop-blur-xl transition-all duration-500",
                wearableData.isSleeping && "border-purple-500/50 bg-purple-500/5"
              )}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      wearableData.isSleeping ? "bg-purple-500/20" : "bg-purple-500/10"
                    )}>
                      <Moon className={cn("h-6 w-6", wearableData.isSleeping ? "text-purple-300 animate-pulse" : "text-purple-400")} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Sleep Tracker</p>
                      <p className="text-xl font-bold text-white">
                        {wearableData.isSleeping ? "Tracking..." : `${wearableData.sleepHours}h Total`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={toggleSleep}
                    variant={wearableData.isSleeping ? "destructive" : "secondary"}
                    size="sm"
                    className="gap-2"
                  >
                    {wearableData.isSleeping ? (
                      <><Square className="h-3 w-3" /> Wake Up</>
                    ) : (
                      <><Play className="h-3 w-3" /> Start Sleep</>
                    )}
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                <CardContent className="p-4 flex items-center justify-around h-full">
                  <Button variant="ghost" onClick={() => setActiveTab('recipes')} className="flex flex-col gap-1 h-auto py-2 text-slate-400 hover:text-cyan-400">
                    <Utensils className="h-5 w-5" />
                    <span className="text-[10px] uppercase font-bold">Recipes</span>
                  </Button>
                  <div className="w-px h-8 bg-slate-800" />
                  <Button variant="ghost" onClick={() => setActiveTab('planner')} className="flex flex-col gap-1 h-auto py-2 text-slate-400 hover:text-cyan-400">
                    <Calendar className="h-5 w-5" />
                    <span className="text-[10px] uppercase font-bold">Planner</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <NutritionDashboard />
              </div>
              <div className="space-y-6">
                <WaterTracker />
                <SmartCoach />
              </div>
            </div>
          </div>
        );
      case 'search':
        return <FoodSearch />;
      case 'recipes':
        return <RecipeBuilder />;
      case 'planner':
        return <MealPlanner />;
      case 'hydration':
        return (
          <div className="max-w-2xl mx-auto">
            <WaterTracker />
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6">
            <div className="flex gap-4 mb-4">
              <Button onClick={() => setActiveTab('recipes')} variant="outline" className="border-slate-800 text-slate-400 hover:text-white">
                <Utensils className="h-4 w-4 mr-2" /> Recipe Builder
              </Button>
              <Button onClick={() => setActiveTab('planner')} variant="outline" className="border-slate-800 text-slate-400 hover:text-white">
                <Calendar className="h-4 w-4 mr-2" /> Meal Planner
              </Button>
            </div>
            <NutritionHistory />
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-slate-800 border-t-4 border-t-cyan-500">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Scale className="h-8 w-8 text-cyan-400 mb-2" />
                  <p className="text-xs text-slate-500 uppercase font-bold">BMI Calculator</p>
                  <p className="text-4xl font-black text-white my-2">{calculateBMI()}</p>
                  <div className={cn(
                    "text-[10px] px-2 py-1 rounded-full font-bold uppercase mb-4",
                    Number(calculateBMI()) < 18.5 ? "bg-blue-500/20 text-blue-400" :
                    Number(calculateBMI()) < 25 ? "bg-green-500/20 text-green-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {Number(calculateBMI()) < 18.5 ? "Underweight" :
                     Number(calculateBMI()) < 25 ? "Healthy Weight" : "Overweight"}
                  </div>
                  <Button onClick={handleAutoCalorie} size="sm" className="bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 border border-cyan-500/30">
                    <Calculator className="h-3 w-3 mr-2" />
                    Sync Calorie Goal
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Activity className="h-8 w-8 text-orange-400 mb-2" />
                  <p className="text-xs text-slate-500 uppercase">Activity Level</p>
                  <p className="text-xl font-bold text-white capitalize">{profile.activityLevel.replace('_', ' ')}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <UserIcon className="h-8 w-8 text-purple-400 mb-2" />
                  <p className="text-xs text-slate-500 uppercase">Age / Gender</p>
                  <p className="text-xl font-bold text-white">{profile.age} / {profile.gender}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Biometric Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Name</Label>
                    <Input 
                      value={profile.name} 
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Weight (kg)</Label>
                    <Input 
                      type="number"
                      value={profile.weight} 
                      onChange={e => setProfile({...profile, weight: Number(e.target.value)})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Height (cm)</Label>
                    <Input 
                      type="number"
                      value={profile.height} 
                      onChange={e => setProfile({...profile, height: Number(e.target.value)})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Age</Label>
                    <Input 
                      type="number"
                      value={profile.age} 
                      onChange={e => setProfile({...profile, age: Number(e.target.value)})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Gender</Label>
                    <Select 
                      value={profile.gender} 
                      onValueChange={(v: any) => setProfile({...profile, gender: v})}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Activity Level</Label>
                    <Select 
                      value={profile.activityLevel} 
                      onValueChange={(v: any) => setProfile({...profile, activityLevel: v})}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select activity" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Lightly Active</SelectItem>
                        <SelectItem value="moderate">Moderately Active</SelectItem>
                        <SelectItem value="active">Very Active</SelectItem>
                        <SelectItem value="very_active">Extra Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Goal</Label>
                    <Select 
                      value={profile.goal} 
                      onValueChange={(v: any) => setProfile({...profile, goal: v})}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Calorie Goal</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number"
                        value={profile.calorieGoal} 
                        onChange={e => setProfile({...profile, calorieGoal: Number(e.target.value)})}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      <Button onClick={handleAutoCalorie} variant="secondary" size="icon" title="Auto-calculate">
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button onClick={() => showSuccess("Profile updated!")} className="w-full bg-cyan-600 hover:bg-cyan-700">Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        );
      case 'achievements':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map(a => (
              <Card key={a.id} className={cn(
                "bg-slate-900/50 border-slate-800 transition-all duration-500",
                a.unlocked ? 'opacity-100 scale-100 border-cyan-500/30' : 'opacity-40 grayscale scale-95'
              )}>
                <CardContent className="p-6 text-center space-y-2">
                  <div className="text-4xl mb-2">{a.icon}</div>
                  <h3 className="text-white font-bold">{a.title}</h3>
                  <p className="text-xs text-slate-400">{a.description}</p>
                  {a.unlocked && <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-2">Unlocked</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-cyan-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <header className="flex justify-between items-center mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {profile.name}!</h2>
            <p className="text-sm text-slate-400">Track your nutrition and reach your goals.</p>
          </motion.div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Level {Math.floor(achievements.filter(a => a.unlocked).length * 2.5 + 1)}</p>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1">
                <div 
                  className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000" 
                  style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {profile.name[0]}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Index;