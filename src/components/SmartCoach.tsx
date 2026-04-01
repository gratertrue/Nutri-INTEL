import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Sparkles, Brain, Lightbulb, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const SmartCoach = () => {
  const { logs, waterIntake, profile, wearableData } = useNutritionStore();

  const getInsights = () => {
    const insights = [];
    
    // Hydration check
    if (waterIntake < profile.waterGoal * 0.5) {
      insights.push({
        type: 'alert',
        icon: AlertTriangle,
        color: 'text-amber-400',
        text: "You're behind on hydration. Low water intake can lead to fatigue and brain fog."
      });
    }

    // Activity check
    if (wearableData.steps < 5000) {
      insights.push({
        type: 'tip',
        icon: Lightbulb,
        color: 'text-cyan-400',
        text: "Try to get a 15-minute walk in. You're currently below your average step count."
      });
    }

    // Protein check
    const todayProtein = logs.reduce((acc, log) => {
      const protein = log.food.foodNutrients.find(n => n.nutrientName === "Protein")?.value || 0;
      return acc + (protein * (log.amount / 100));
    }, 0);

    if (todayProtein < profile.proteinGoal * 0.3 && logs.length > 0) {
      insights.push({
        type: 'advice',
        icon: Brain,
        color: 'text-purple-400',
        text: "Your protein intake is low today. Consider adding Greek yogurt or lean meat to your next meal."
      });
    }

    // Default insight
    if (insights.length === 0) {
      insights.push({
        type: 'positive',
        icon: Sparkles,
        color: 'text-green-400',
        text: "You're doing great! Your metrics are balanced and you're on track for your goals."
      });
    }

    return insights;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Smart Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {getInsights().map((insight, idx) => (
          <motion.div 
            key={idx}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50"
          >
            <insight.icon className={`h-5 w-5 shrink-0 ${insight.color}`} />
            <p className="text-sm text-slate-300 leading-relaxed">{insight.text}</p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartCoach;