import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { getNutrientValue, calculateSmartScore } from '@/lib/usda-api';
import { Flame, Target, Trophy, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import SmartSuggestions from './SmartSuggestions';

const NutritionDashboard = () => {
  const { logs, profile, points, achievements } = useNutritionStore();
  
  const today = new Date().setHours(0,0,0,0);
  const todayLogs = logs.filter(l => new Date(l.timestamp).setHours(0,0,0,0) === today);

  const totals = todayLogs.reduce((acc, log) => {
    const factor = log.amount / 100;
    acc.calories += getNutrientValue(log.food.foodNutrients, "Energy") * factor;
    acc.protein += getNutrientValue(log.food.foodNutrients, "Protein") * factor;
    acc.carbs += getNutrientValue(log.food.foodNutrients, "Carbohydrate") * factor;
    acc.fat += getNutrientValue(log.food.foodNutrients, "Total lipid (fat)") * factor;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const macroData = [
    { name: 'Protein', value: totals.protein, color: '#3b82f6' },
    { name: 'Carbs', value: totals.carbs, color: '#10b981' },
    { name: 'Fat', value: totals.fat, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Daily Points</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{points}</div>
            <p className="text-xs text-slate-500">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Calories</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round(totals.calories)} / {profile.calorieGoal}</div>
            <Progress value={(totals.calories / profile.calorieGoal) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Protein</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round(totals.protein)}g / {profile.proteinGoal}g</div>
            <Progress value={(totals.protein / profile.proteinGoal) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{achievements.filter(a => a.unlocked).length} / {achievements.length}</div>
            <p className="text-xs text-slate-500">Keep going!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Macro Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {macroData.map(m => (
                  <div key={m.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-xs text-slate-400">{m.name}: {Math.round(m.value)}g</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayLogs.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No food logged today yet.</p>
                ) : (
                  todayLogs.slice(-5).reverse().map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                      <div>
                        <p className="text-sm font-medium text-white">{log.food.description}</p>
                        <p className="text-xs text-slate-500">{log.amount}g • {Math.round(getNutrientValue(log.food.foodNutrients, "Energy") * (log.amount/100))} kcal</p>
                      </div>
                      <div className={cn(
                        "text-xs font-bold px-2 py-1 rounded",
                        calculateSmartScore(log.food.foodNutrients) > 70 ? 'text-green-400 bg-green-500/10' : 'text-cyan-400 bg-cyan-500/10'
                      )}>
                        Score: {calculateSmartScore(log.food.foodNutrients)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <SmartSuggestions />
        </div>
      </div>
    </div>
  );
};

import { cn } from '@/lib/utils';

export default NutritionDashboard;