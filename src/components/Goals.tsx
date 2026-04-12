"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { getNutrientValue } from '@/lib/usda-api';
import { Target, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Goals = () => {
  const { logs, profile } = useNutritionStore();

  const today = new Date().setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(l => new Date(l.timestamp).setHours(0, 0, 0, 0) === today);

  const totalCalories = todayLogs.reduce((acc, log) => {
    const factor = log.amount / 100;
    return acc + (getNutrientValue(log.food.foodNutrients, "Energy") * factor);
  }, 0);

  const calorieGoal = profile.calorieGoal || 2000;
  const remaining = calorieGoal - totalCalories;
  const percentage = Math.min((totalCalories / calorieGoal) * 100, 100);
  const isOver = totalCalories > calorieGoal;

  const goalLabel = profile.goal === 'weight_loss' ? 'Penurunan Berat' : 
                    profile.goal === 'muscle_gain' ? 'Pembentukan Otot' : 'Pemeliharaan';

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-cyan-400" />
          Target Harian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Anggaran Kalori</p>
            <p className="text-sm font-medium text-white">
              {Math.round(totalCalories)} <span className="text-slate-500">/ {calorieGoal} kkal</span>
            </p>
          </div>
          <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]",
                isOver ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {isOver ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-400">Melebihi Target</p>
                <p className="text-xs text-slate-400">Anda melebihi batas harian sebesar {Math.round(Math.abs(remaining))} kkal.</p>
              </div>
            </motion.div>
          ) : remaining < 200 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
            >
              <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-400">Hampir Sampai!</p>
                <p className="text-xs text-slate-400">Tersisa {Math.round(remaining)} kkal. Disiplin yang luar biasa!</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
            >
              <TrendingUp className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-cyan-400">Sesuai Jalur</p>
                <p className="text-xs text-slate-400">Anda memiliki {Math.round(remaining)} kkal tersisa untuk hari ini.</p>
              </div>
            </motion.div>
          ) }
        </div>

        <div className="pt-2 border-t border-slate-800">
          <p className="text-[10px] text-slate-500 text-center italic">
            Target dihitung berdasarkan profil {goalLabel} Anda.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Goals;