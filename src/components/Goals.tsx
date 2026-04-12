/* ############################################################
   # COMPONENT: GOALS MENU
   # This component shows the user's calorie progress.
   ############################################################ */

import React from 'react';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface GoalsProps {
  todayCals: number;
  calorieGoal: number;
}

const Goals = ({ todayCals, calorieGoal }: GoalsProps) => {
  const percent = Math.min((todayCals / calorieGoal) * 100, 100);
  const isOver = todayCals > calorieGoal;

  return (
    <div className="glass-card">
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-cyan-400 h-5 w-5" />
        <h2 className="text-lg font-bold">Daily Goals</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Calories Eaten</span>
          <span className="font-bold text-white">{todayCals} / {calorieGoal} kcal</span>
        </div>
        <Progress value={percent} className="h-3 bg-slate-800" />
        
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${isOver ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
          {isOver ? (
            <><AlertCircle className="h-4 w-4" /> Goal Exceeded by {todayCals - calorieGoal} kcal</>
          ) : (
            <><CheckCircle2 className="h-4 w-4" /> {calorieGoal - todayCals} kcal remaining</>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;