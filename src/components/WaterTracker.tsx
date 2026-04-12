import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Droplets, Plus, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const WaterTracker = () => {
  const { waterIntake, addWater, setWaterIntake, profile } = useNutritionStore();
  const percentage = Math.min((waterIntake / profile.waterGoal) * 100, 100);

  const glassSizes = [250, 500, 750];

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden relative">
      <div 
        className="absolute bottom-0 left-0 w-full bg-cyan-500/10 transition-all duration-1000 ease-in-out"
        style={{ height: `${percentage}%` }}
      />
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-400" />
            Hydration
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setWaterIntake(0)}
            className="h-8 w-8 text-slate-500 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6">
        <div className="text-center">
          <motion.p 
            key={waterIntake}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-white"
          >
            {waterIntake} <span className="text-lg font-normal text-slate-500">/ {profile.waterGoal}ml</span>
          </motion.p>
          <Progress value={percentage} className="h-2 mt-4 bg-slate-800" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {glassSizes.map(size => (
            <Button 
              key={size}
              onClick={() => addWater(size)}
              variant="outline"
              className="border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
            >
              <Plus className="h-3 w-3 mr-1" />
              {size}ml
            </Button>
          ))}
        </div>

        <p className="text-[10px] text-center text-slate-500 italic">
          Tip: Drink a glass of water before every meal to aid digestion.
        </p>
      </CardContent>
    </Card>
  );
};

export default WaterTracker;