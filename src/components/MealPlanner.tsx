import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNutritionStore, Recipe } from '@/hooks/use-nutrition-store';
import { Calendar, Plus, Sparkles, Trash2, ChevronRight, Clock } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const MealPlanner = () => {
  const { recipes, mealPlans, addMealPlan } = useNutritionStore();
  const [currentPlan, setCurrentPlan] = useState<{ [key: string]: Recipe[] }>({});
  const [planName, setPlanName] = useState('Rencana Mingguan Saya');

  const todayIndex = new Date().getDay();
  const todayName = DAYS[todayIndex];

  const generateRandomPlan = () => {
    if (recipes.length < 3) {
      showError("Buat setidaknya 3 resep terlebih dahulu untuk membuat rencana!");
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
    showSuccess("Berhasil membuat rencana 7 hari otomatis berdasarkan resep Anda!");
  };

  const handleSave = () => {
    if (Object.keys(currentPlan).length === 0) {
      showError("Buat rencana terlebih dahulu!");
      return;
    }
    addMealPlan(planName, currentPlan);
    showSuccess("Rencana makan disimpan ke riwayat!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-cyan-400" />
            Perencana Makan Mingguan
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Hari ini: <span className="text-cyan-400 font-bold">{todayName}</span>
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={generateRandomPlan} variant="outline" className="flex-1 md:flex-none border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
            <Sparkles className="h-4 w-4 mr-2" />
            Buat Otomatis
          </Button>
          <Button onClick={handleSave} className="flex-1 md:flex-none bg-cyan-600 hover:bg-cyan-700">
            Simpan Rencana
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {DAYS.map((day, idx) => {
          const isToday = day === todayName;
          return (
            <Card key={day} className={cn(
              "bg-slate-900/50 border-slate-800 min-h-[250px] transition-all duration-300",
              isToday && "border-cyan-500/50 ring-1 ring-cyan-500/20 bg-cyan-500/5 scale-[1.02] z-10"
            )}>
              <CardHeader className={cn(
                "p-3 border-b border-slate-800 flex flex-row items-center justify-between",
                isToday && "bg-cyan-500/10 border-cyan-500/20"
              )}>
                <CardTitle className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isToday ? "text-cyan-400" : "text-slate-400"
                )}>
                  {day}
                </CardTitle>
                {isToday && <Badge className="bg-cyan-500 text-[8px] h-4 px-1">HARI INI</Badge>}
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                {currentPlan[day]?.map((recipe, rIdx) => (
                  <div key={rIdx} className="p-2 rounded bg-slate-800/50 border border-slate-700 text-[10px] text-slate-300">
                    <p className="font-medium text-white truncate">{recipe.name}</p>
                    <p className="text-slate-500">350 kkal</p>
                  </div>
                )) || (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-700 border-2 border-dashed border-slate-800/50 rounded-lg">
                    <Plus className="h-4 w-4 mb-1 opacity-20" />
                    <span className="text-[9px] uppercase font-bold tracking-tighter">Kosong</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mealPlans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-500" />
            Rencana Tersimpan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mealPlans.map(plan => (
              <Card key={plan.id} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-all group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{plan.name}</p>
                    <p className="text-xs text-slate-500">7 Hari • 21 Makanan</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-cyan-400">
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