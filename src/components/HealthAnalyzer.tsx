import React from 'react';
import { FoodItem, getNutrientValue } from '@/lib/usda-api';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface HealthAnalyzerProps {
  food: FoodItem;
}

const HealthAnalyzer = ({ food }: HealthAnalyzerProps) => {
  const nutrients = food.foodNutrients;
  const sugar = getNutrientValue(nutrients, "Sugars");
  const sodium = getNutrientValue(nutrients, "Sodium");
  const satFat = getNutrientValue(nutrients, "Fatty acids, total saturated");
  const fiber = getNutrientValue(nutrients, "Fiber");

  const checks = [
    {
      name: "Ramah Diabetes",
      status: sugar > 15 ? "high" : sugar > 8 ? "moderate" : "good",
      message: sugar > 15 ? "Kandungan gula tinggi" : sugar > 8 ? "Gula sedang" : "Rendah gula",
    },
    {
      name: "Kesehatan Jantung",
      status: (satFat > 5 || sodium > 400) ? "high" : "good",
      message: (satFat > 5 || sodium > 400) ? "Natrium/lemak jenuh tinggi" : "Profil jantung sehat",
    },
    {
      name: "Hipertensi",
      status: sodium > 200 ? "high" : "good",
      message: sodium > 200 ? "Natrium tinggi" : "Rendah natrium",
    },
    {
      name: "Pencernaan",
      status: fiber > 5 ? "good" : "moderate",
      message: fiber > 5 ? "Tinggi serat" : "Serat rendah",
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {checks.map((check) => (
        <div key={check.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700">
          {check.status === 'good' ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : check.status === 'moderate' ? (
            <Info className="h-4 w-4 text-yellow-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">{check.name}</span>
            <span className="text-xs text-white">{check.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HealthAnalyzer;