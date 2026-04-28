import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Brain, AlertCircle, CheckCircle2, Info, ChevronRight, BookOpen, History } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const SmartNutritionAnalyzer = () => {
  const { getAKGGoals, getAverageNutrients, logs } = useNutritionStore();
  const akg = getAKGGoals();
  const avg = getAverageNutrients(3); 

  if (!avg || logs.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <CardContent className="p-8 text-center text-slate-500">
          <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Catat makanan selama beberapa hari untuk melihat analisis tren nutrisi jangka panjang.</p>
        </CardContent>
      </Card>
    );
  }

  const micros = [
    { 
      name: 'Vitamin C', 
      current: avg.vitaminC, 
      target: akg.vitaminC, 
      unit: 'mg', 
      impact: 'Mendukung sistem imun dan produksi kolagen.',
      research: 'Riset menunjukkan defisiensi Vitamin C kronis dapat memperlambat penyembuhan luka.'
    },
    { 
      name: 'Zat Besi', 
      current: avg.iron, 
      target: akg.iron, 
      unit: 'mg', 
      impact: 'Penting untuk transportasi oksigen dan energi.',
      research: 'Studi klinis mengaitkan kadar besi rendah dengan penurunan fungsi kognitif.'
    },
    { 
      name: 'Kalsium', 
      current: avg.calcium, 
      target: akg.calcium, 
      unit: 'mg', 
      impact: 'Menjaga kepadatan tulang dan fungsi otot.',
      research: 'Kekurangan kalsium jangka panjang meningkatkan risiko osteoporosis.'
    },
    { 
      name: 'Zinc', 
      current: avg.zinc, 
      target: akg.zinc, 
      unit: 'mg', 
      impact: 'Krusial untuk sintesis protein dan pembelahan sel.',
      research: 'Zinc berperan dalam lebih dari 300 enzim tubuh; defisiensi menghambat pertumbuhan fisik.'
    },
    { 
      name: 'Magnesium', 
      current: avg.magnesium, 
      target: akg.magnesium, 
      unit: 'mg', 
      impact: 'Mengatur fungsi saraf dan tekanan darah.',
      research: 'Magnesium diperlukan untuk produksi energi ATP; rendahnya kadar memicu kelelahan otot.'
    },
    { 
      name: 'Vitamin B12', 
      current: avg.vitaminB12, 
      target: akg.vitaminB12, 
      unit: 'mcg', 
      impact: 'Penting untuk pembentukan sel darah merah dan saraf.',
      research: 'Defisiensi B12 dapat menyebabkan anemia megaloblastik dan gangguan sistem saraf pusat.'
    },
  ];

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-400" />
          Analisis Tren Nutrisi (3 Hari)
        </CardTitle>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Berdasarkan AKG Indonesia & Riset Kesehatan</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {micros.map((m) => {
            const percentage = Math.min((m.current / m.target) * 100, 100);
            const isLow = percentage < 50;

            return (
              <div key={m.name} className="space-y-2 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 group hover:border-purple-500/30 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white">{m.name}</span>
                    {isLow ? (
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400">
                    {Math.round(m.current * 10) / 10} / {m.target}
                  </span>
                </div>
                <Progress value={percentage} className={cn("h-1", isLow ? "bg-slate-800" : "bg-slate-800")} />
                
                {isLow && (
                  <div className="mt-2 space-y-1 animate-in slide-in-from-top-1 duration-300">
                    <p className="text-[9px] text-slate-400 leading-tight">
                      <span className="text-cyan-400 font-bold">Dampak:</span> {m.impact}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-slate-500">
            <BookOpen className="h-3 w-3" />
            <p className="text-[9px] italic">Data ditarik menggunakan Nutrient ID resmi untuk akurasi maksimal.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartNutritionAnalyzer;