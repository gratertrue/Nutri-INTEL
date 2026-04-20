import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { getNutrientValue, calculateSmartScore } from '@/lib/usda-api';
import { Flame, Target, Trophy, History } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import SmartSuggestions from './SmartSuggestions';
import GrowthImpactInfo from './GrowthImpactInfo';
import SmartNutritionAnalyzer from './SmartNutritionAnalyzer';
import { cn } from '@/lib/utils';

const NutritionDashboard = () => {
  const { logs, profile, achievements, getAverageNutrients } = useNutritionStore();
  
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

  const avg = getAverageNutrients(3);
  const isCarbsLowTrend = avg && avg.carbs < profile.carbsGoal;
  const isProteinLowTrend = avg && avg.protein < profile.proteinGoal;

  const macroData = [
    { name: 'Protein', value: totals.protein, color: '#3b82f6' },
    { name: 'Karbo', value: totals.carbs, color: '#10b981' },
    { name: 'Lemak', value: totals.fat, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {(isCarbsLowTrend || isProteinLowTrend) && (
        <Card className="bg-amber-500/10 border-amber-500/20 border-l-2 border-l-amber-500">
          <CardContent className="p-2 flex items-start gap-2">
            <History className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Tren Defisiensi</h3>
              <p className="text-[9px] text-slate-400 leading-tight">Asupan makro rendah dalam 3 hari terakhir.</p>
              <div className="mt-0.5 scale-90 origin-left"><GrowthImpactInfo /></div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-slate-900/50 border-slate-800 p-2">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] font-bold text-slate-500 uppercase">Kalori</span>
            <Flame className="h-2.5 w-2.5 text-orange-500" />
          </div>
          <div className="text-base font-bold text-white">{Math.round(totals.calories)}</div>
          <Progress value={(totals.calories / profile.calorieGoal) * 100} className="h-1 mt-1" />
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 p-2">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] font-bold text-slate-500 uppercase">Protein</span>
            <Target className="h-2.5 w-2.5 text-blue-500" />
          </div>
          <div className="text-base font-bold text-white">{Math.round(totals.protein)}g</div>
          <Progress value={(totals.protein / profile.proteinGoal) * 100} className="h-1 mt-1" />
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 p-2">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] font-bold text-slate-500 uppercase">Piala</span>
            <Trophy className="h-2.5 w-2.5 text-purple-500" />
          </div>
          <div className="text-base font-bold text-white">{achievements.filter(a => a.unlocked).length}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 space-y-3">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-[9px] font-bold text-white uppercase">Distribusi Makro</CardTitle>
            </CardHeader>
            <CardContent className="h-[140px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macroData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                    {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', fontSize: '9px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-2 pb-2">
                {macroData.map(m => (
                  <div key={m.name} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-[8px] text-slate-400">{m.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="scale-95 origin-top"><SmartNutritionAnalyzer /></div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="scale-95 origin-top"><SmartSuggestions /></div>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-[9px] font-bold text-white uppercase">Aktivitas</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1.5">
                {todayLogs.length === 0 ? (
                  <p className="text-[9px] text-slate-600 text-center py-2 italic">Belum ada data</p>
                ) : (
                  todayLogs.slice(-2).reverse().map(log => (
                    <div key={log.id} className="flex items-center justify-between p-1.5 rounded bg-slate-800/30 border border-slate-800/50">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-[9px] font-bold text-white truncate">{log.food.description}</p>
                        <p className="text-[8px] text-slate-500">{log.amount}g • {Math.round(getNutrientValue(log.food.foodNutrients, "Energy") * (log.amount/100))} kkal</p>
                      </div>
                      <div className="text-[8px] font-black text-cyan-400 bg-cyan-500/10 px-1 py-0.5 rounded">
                        {calculateSmartScore(log.food.foodNutrients)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NutritionDashboard;