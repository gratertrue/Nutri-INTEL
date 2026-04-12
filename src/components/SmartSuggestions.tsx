import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Sparkles, ArrowRight, Apple, Beef, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUGGESTIONS = {
  weight_loss: [
    { name: 'Salmon Panggang & Asparagus', cals: 350, protein: 35, icon: Beef },
    { name: 'Salad Quinoa & Kacang Arab', cals: 280, protein: 12, icon: Wheat },
    { name: 'Yogurt Yunani dengan Beri', cals: 180, protein: 18, icon: Apple },
  ],
  muscle_gain: [
    { name: 'Steak & Ubi Jalar', cals: 650, protein: 45, icon: Beef },
    { name: 'Ayam & Nasi Merah', cals: 550, protein: 40, icon: Beef },
    { name: 'Oatmeal Protein & Selai Kacang', cals: 250, protein: 25, icon: Wheat },
  ],
  maintenance: [
    { name: 'Wrap Kalkun Alpukat', cals: 420, protein: 28, icon: Beef },
    { name: 'Pasta Mediterania', cals: 480, protein: 15, icon: Wheat },
    { name: 'Piring Kacang & Buah Campur', cals: 320, protein: 8, icon: Apple },
  ]
};

const SmartSuggestions = () => {
  const { profile } = useNutritionStore();
  const currentGoal = profile?.goal || 'maintenance';
  const suggestions = SUGGESTIONS[currentGoal as keyof typeof SUGGESTIONS] || SUGGESTIONS.maintenance;

  const goalLabels: { [key: string]: string } = {
    weight_loss: 'Penurunan Berat Badan',
    muscle_gain: 'Pembentukan Otot',
    maintenance: 'Pemeliharaan'
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Saran Cerdas
        </CardTitle>
        <p className="text-xs text-slate-500">Berdasarkan target {goalLabels[currentGoal]}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <item.icon className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-[10px] text-slate-500">{item.cals} kkal • {item.protein}g Protein</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 group-hover:text-cyan-400">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartSuggestions;