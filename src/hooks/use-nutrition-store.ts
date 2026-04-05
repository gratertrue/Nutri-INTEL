import { useState, useEffect } from 'react';
import { FoodItem, getNutrientValue } from '@/lib/usda-api';
import confetti from 'canvas-confetti';

export interface UserProfile {
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  calorieGoal: number;
  proteinGoal: number;
  waterGoal: number;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  hasAcceptedDisclaimer: boolean;
}

export interface LogEntry {
  id: string;
  food: FoodItem;
  amount: number;
  timestamp: number;
}

export interface SymptomEntry {
  id: string;
  type: 'heartburn' | 'regurgitation' | 'chest_pain' | 'bloating' | 'nausea';
  severity: number;
  timestamp: number;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: { food: FoodItem; amount: number }[];
}

export interface MealPlan {
  id: string;
  name: string;
  days: { [key: string]: Recipe[] };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface WearableData {
  steps: number;
  sleepHours: number;
  isSleeping: boolean;
  sleepStartTime: number | null;
}

const INITIAL_PROFILE: UserProfile = {
  name: "User",
  weight: 70,
  height: 175,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  calorieGoal: 2000,
  proteinGoal: 150,
  waterGoal: 2500,
  goal: 'maintenance',
  hasAcceptedDisclaimer: false,
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_log', title: 'First Bite', description: 'Log your first food item', icon: '🍎', unlocked: false },
  { id: 'protein_king', title: 'Protein King', description: 'Hit your protein goal', icon: '💪', unlocked: false },
  { id: 'recipe_master', title: 'Chef de Cuisine', description: 'Create your first recipe', icon: '👨‍🍳', unlocked: false },
];

export function useNutritionStore() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gerd_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('gerd_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [symptoms, setSymptoms] = useState<SymptomEntry[]>(() => {
    const saved = localStorage.getItem('gerd_symptoms');
    return saved ? JSON.parse(saved) : [];
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('gerd_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const [mealPlans, setMealPlans] = useState<MealPlan[]>(() => {
    const saved = localStorage.getItem('gerd_meal_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [wearableData, setWearableData] = useState<WearableData>(() => {
    const saved = localStorage.getItem('gerd_wearable');
    return saved ? JSON.parse(saved) : { steps: 8432, sleepHours: 7.5, isSleeping: false, sleepStartTime: null };
  });

  const [waterIntake, setWaterIntake] = useState(() => Number(localStorage.getItem('gerd_water') || 0));
  const [points, setPoints] = useState(() => Number(localStorage.getItem('gerd_points') || 0));
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('gerd_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  useEffect(() => {
    localStorage.setItem('gerd_profile', JSON.stringify(profile));
    localStorage.setItem('gerd_logs', JSON.stringify(logs));
    localStorage.setItem('gerd_symptoms', JSON.stringify(symptoms));
    localStorage.setItem('gerd_recipes', JSON.stringify(recipes));
    localStorage.setItem('gerd_meal_plans', JSON.stringify(mealPlans));
    localStorage.setItem('gerd_wearable', JSON.stringify(wearableData));
    localStorage.setItem('gerd_water', waterIntake.toString());
    localStorage.setItem('gerd_points', points.toString());
    localStorage.setItem('gerd_achievements', JSON.stringify(achievements));
  }, [profile, logs, symptoms, recipes, mealPlans, wearableData, waterIntake, points, achievements]);

  const addLog = (food: FoodItem, amount: number) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      food,
      amount,
      timestamp: Date.now(),
    };
    setLogs(prev => [...prev, newLog]);
    setPoints(prev => prev + 10);
  };

  const addSymptom = (type: SymptomEntry['type'], severity: number, notes?: string) => {
    const newSymptom: SymptomEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      severity,
      timestamp: Date.now(),
      notes,
    };
    setSymptoms(prev => [...prev, newSymptom]);
    if (severity > 7) confetti({ colors: ['#ef4444'] });
  };

  const addRecipe = (name: string, ingredients: { food: FoodItem; amount: number }[]) => {
    const newRecipe: Recipe = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      ingredients,
    };
    setRecipes(prev => [...prev, newRecipe]);
    setPoints(prev => prev + 50);
  };

  const addMealPlan = (name: string, days: { [key: string]: Recipe[] }) => {
    const newPlan: MealPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      days,
    };
    setMealPlans(prev => [...prev, newPlan]);
    setPoints(prev => prev + 100);
  };

  const toggleSleep = () => {
    setWearableData(prev => {
      if (!prev.isSleeping) {
        return { ...prev, isSleeping: true, sleepStartTime: Date.now() };
      } else {
        const durationMs = Date.now() - (prev.sleepStartTime || Date.now());
        const durationHours = Number((durationMs / (1000 * 60 * 60)).toFixed(1));
        return { 
          ...prev, 
          isSleeping: false, 
          sleepStartTime: null, 
          sleepHours: prev.sleepHours + durationHours 
        };
      }
    });
  };

  const addWater = (amount: number) => setWaterIntake(prev => prev + amount);

  const calculateBMI = () => {
    const heightInMeters = profile.height / 100;
    if (heightInMeters === 0) return "0.0";
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateRecommendedCalories = () => {
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    if (profile.gender === 'male') bmr += 5;
    else bmr -= 161;

    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    let tdee = bmr * activityFactors[profile.activityLevel];
    if (profile.goal === 'weight_loss') tdee -= 500;
    if (profile.goal === 'muscle_gain') tdee += 300;

    return Math.round(tdee);
  };

  const getSuspectedTriggers = () => {
    const triggers: Record<string, { count: number; avgSeverity: number }> = {};
    symptoms.forEach(symptom => {
      const windowStart = symptom.timestamp - (4 * 60 * 60 * 1000);
      const relevantLogs = logs.filter(l => l.timestamp >= windowStart && l.timestamp <= symptom.timestamp);
      relevantLogs.forEach(log => {
        const name = log.food.description;
        if (!triggers[name]) triggers[name] = { count: 0, avgSeverity: 0 };
        triggers[name].count += 1;
        triggers[name].avgSeverity = (triggers[name].avgSeverity + symptom.severity) / 2;
      });
    });
    return Object.entries(triggers)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return { 
    profile, setProfile, 
    logs, addLog, 
    symptoms, addSymptom,
    recipes, addRecipe,
    mealPlans, addMealPlan,
    wearableData, toggleSleep,
    waterIntake, addWater, setWaterIntake,
    points, achievements,
    calculateBMI, calculateRecommendedCalories,
    getSuspectedTriggers
  };
}