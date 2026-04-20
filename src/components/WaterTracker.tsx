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
      
      <CardHeader className="relative z-10 p-3 pb-1">
        <CardTitle className="text-xs font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-cyan-400" />
            Hidrasi
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setWaterIntake(0)}
            className="h-6 w-6 text-slate-500 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 p-3 pt-0 space-y-3">
        <div className="text-center">
          <motion.p 
            key={waterIntake}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black text-white"
          >
            {waterIntake} <span className="text-[10px] font-normal text-slate-500">/ {profile.waterGoal}ml</span>
          </motion.p>
          <Progress value={percentage} className="h-1.5 mt-2 bg-slate-800" />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {glassSizes.map(size => (
            <Button 
              key={size}
              onClick={() => addWater(size)}
              variant="outline"
              className="h-8 border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-[10px] p-0"
            >
              <Plus className="h-2.5 w-2.5 mr-0.5" />
              {size}ml
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterTracker;