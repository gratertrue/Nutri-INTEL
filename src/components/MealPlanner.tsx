import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNutritionStore, Recipe } from '@/hooks/use-nutrition-store';
import { Calendar, Plus, Sparkles, Trash2, ChevronRight } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MealPlanner = () => {
  const { recipes, mealPlans, addMealPlan } = useNutritionStore();
  const [currentPlan, setCurrentPlan] = useState<{ [key: string]: Recipe[] }>({});
  const [planName, setPlanName] = useState('My Weekly Plan');

  const generateRandomPlan = () => {
    if (recipes.length < 3) {
      showError("Create at least 3 recipes first to generate a plan!");
      return;
    }
    const newPlan: { [key: string]: Recipe[] } = {};
    DAYS.forEach(day => {
      const dailyRecipes = [];
      for (let i = 0; i < 3; i++) {
        dailyRecipes.push(recipes[Math.floor(Math.random() * recipes.length)]);
      }
      newPlan[day] = dailyRecipes;
    });
    setCurrentPlan(newPlan);
    showSuccess("Generated a random 7-day plan based on your recipes!");
  };

  const handleSave = () => {
    if (Object.keys(currentPlan).length === 0) {
      showError("Generate or build a plan first!");
      return;
    }
    addMealPlan(planName, currentPlan);
    showSuccess("Meal plan saved to your history!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-cyan-400" />
          7-Day Meal Planner
        </h2>
        <div className="flex gap-2">
          <Button onClick={generateRandomPlan} variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
            <Sparkles className="h-4 w-4 mr-2" />
            Auto-Generate
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            Save Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS.map(day => (
          <Card key={day} className="bg-slate-900/50 border-slate-800 min-h-[300px]">
            <CardHeader className="p-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white">{day}</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {currentPlan[day]?.map((recipe, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-800/50 border border-slate-700 text-[10px] text-slate-300 group relative">
                  <p className="font-medium text-white truncate">{recipe.name}</p>
                  <p className="text-slate-500">350 kcal</p>
                </div>
              )) || (
                <div className="flex flex-col items-center justify-center h-40 text-slate-600 border-2 border-dashed border-slate-800 rounded-lg">
                  <Plus className="h-4 w-4 mb-1" />
                  <span className="text-[10px]">Empty</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {mealPlans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Saved Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mealPlans.map(plan => (
              <Card key={plan.id} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{plan.name}</p>
                    <p className="text-xs text-slate-500">7 Days • 21 Meals</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-400">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;