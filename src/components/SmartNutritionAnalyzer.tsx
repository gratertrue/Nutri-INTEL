import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { getNutrientValue } from '@/lib/usda-api';
import { Brain, AlertCircle, CheckCircle2, Info, ChevronRight, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const SmartNutritionAnalyzer = () => {
  const { logs, getAKGGoals } = useNutritionStore();
  const akg = getAKGGoals();

  const today = new Date().setHours(0,0,0,0);
  const todayLogs = logs.filter(l => new Date(l.timestamp).setHours(0,0,0,0) === today);

  const totals = todayLogs.reduce((acc, log) => {
    const factor = log.amount / 100;
    acc.vitaminC += getNutrientValue(log.food.foodNutrients, "Vitamin C") * factor;
    acc.iron += getNutrientValue(log.food.foodNutrients, "Iron") * factor;
    acc.calcium += getNutrientValue(log.food.foodNutrients, "Calcium") * factor;
    acc.vitaminA += getNutrientValue(log.food.foodNutrients, "Vitamin A") * factor;
    acc.zinc += getNutrientValue(log.food.foodNutrients, "Zinc") * factor;
    return acc;
  }, { vitaminC: 0, iron: 0, calcium: 0, vitaminA: 0, zinc: 0 });

  const micros = [
    { 
      name: 'Vitamin C', 
      current: totals.vitaminC, 
      target: akg.vitaminC, 
      unit: 'mg', 
      impact: 'Mendukung sistem imun dan produksi kolagen.',
      research: 'Riset menunjukkan defisiensi Vitamin C kronis dapat memperlambat penyembuhan luka dan meningkatkan kerentanan terhadap infeksi saluran pernapasan.'
    },
    { 
      name: 'Zat Besi', 
      current: totals.iron, 
      target: akg.iron, 
      unit: 'mg', 
      impact: 'Penting untuk transportasi oksigen dan energi.',
      research: 'Studi klinis mengaitkan kadar besi rendah dengan penurunan fungsi kognitif, konsentrasi, dan kelelahan kronis akibat berkurangnya suplai oksigen ke otak.'
    },
    { 
      name: 'Kalsium', 
      current: totals.calcium, 
      target: akg.calcium, 
      unit: 'mg', 
      impact: 'Menjaga kepadatan tulang dan fungsi otot.',
      research: 'Kekurangan kalsium jangka panjang memaksa tubuh mengambil cadangan dari tulang, meningkatkan risiko osteoporosis dan gangguan kontraksi otot (kram).'
    },
    { 
      name: 'Vitamin A', 
      current: totals.vitaminA, 
      target: akg.vitaminA, 
      unit: 'mcg', 
      impact: 'Mendukung kesehatan mata dan regenerasi sel.',
      research: 'Penelitian menunjukkan Vitamin A krusial untuk diferensiasi sel; kekurangannya dapat menyebabkan xerophthalmia (mata kering) dan penurunan integritas mukosa tubuh.'
    },
  ];

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-400" />
          Analisis Nutrisi Pintar
        </CardTitle>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Berdasarkan AKG Indonesia & Riset Kesehatan</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {micros.map((m) => {
          const percentage = Math.min((m.current / m.target) * 100, 100);
          const isLow = percentage < 50;

          return (
            <div key={m.name} className="space-y-2 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 group hover:border-purple-500/30 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{m.name}</span>
                  {isLow ? (
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {Math.round(m.current)} / {m.target} {m.unit}
                </span>
              </div>
              <Progress value={percentage} className={cn("h-1.5", isLow ? "bg-slate-800" : "bg-slate-800")} />
              
              {isLow && todayLogs.length > 0 && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 duration-300">
                  <div className="flex gap-2">
                    <Info className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      <span className="text-cyan-400 font-bold">Dampak:</span> {m.impact}
                    </p>
                  </div>
                  <div className="flex gap-2 p-2 bg-purple-500/5 rounded-lg border border-purple-500/10">
                    <BookOpen className="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-slate-500 leading-relaxed italic">
                      <span className="text-purple-400 font-bold not-italic">Wawasan Riset:</span> {m.research}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-slate-500">
            <ChevronRight className="h-3 w-3" />
            <p className="text-[9px] italic">Data dianalisis secara real-time berdasarkan literatur nutrisi terkini.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartNutritionAnalyzer;