import { useState, useEffect } from 'react';
import { FoodItem, calculateSmartScore, getNutrientValue } from '@/lib/usda-api';
import confetti from 'canvas-confetti';

export interface UserProfile {
  name: string;
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  calorieGoal: number;
  proteinGoal: number;
  waterGoal: number; // ml
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: { food: FoodItem; amount: number }[];
}

export interface LogEntry {
  id: string;
  food: FoodItem;
  amount: number;
  timestamp: number;
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
  name: "Explorer",
  weight: 70,
  height: 175,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  calorieGoal: 2000,
  proteinGoal: 150,
  waterGoal: 2500,
  goal: 'maintenance',
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_log', title: 'First Bite', description: 'Log your first food item', icon: '🍎', unlocked: false },
  { id: 'protein_king', title: 'Protein King', description: 'Hit your protein goal', icon: '💪', unlocked: false },
  { id: 'recipe_master', title: 'Chef de Cuisine', description: 'Create your first recipe', icon: '👨‍🍳', unlocked: false },
  { id: 'planner_pro', title: 'Planner Pro', description: 'Create a 7-day meal plan', icon: '📅', unlocked: false },
  { id: 'hydration_hero', title: 'Hydration Hero', description: 'Hit your water goal', icon: '💧', unlocked: false },
];

export function useNutritionStore() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nutrition_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('nutrition_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('nutrition_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const [mealPlans, setMealPlans] = useState<MealPlan[]>(() => {
    const saved = localStorage.getItem('nutrition_meal_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [wearableData, setWearableData] = useState<WearableData>(() => {
    const saved = localStorage.getItem('nutrition_wearable');
    return saved ? JSON.parse(saved) : { steps: 8432, sleepHours: 7.5, isSleeping: false, sleepStartTime: null };
  });

  const [waterIntake, setWaterIntake] = useState(() => Number(localStorage.getItem('nutrition_water') || 0));
  const [points, setPoints] = useState(() => Number(localStorage.getItem('nutrition_points') || 0));
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('nutrition_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  useEffect(() => {
    localStorage.setItem('nutrition_profile', JSON.stringify(profile));
    localStorage.setItem('nutrition_logs', JSON.stringify(logs));
    localStorage.setItem('nutrition_recipes', JSON.stringify(recipes));
    localStorage.setItem('nutrition_meal_plans', JSON.stringify(mealPlans));
    localStorage.setItem('nutrition_wearable', JSON.stringify(wearableData));
    localStorage.setItem('nutrition_water', waterIntake.toString());
    localStorage.setItem('nutrition_points', points.toString());
    localStorage.setItem('nutrition_achievements', JSON.stringify(achievements));
  }, [profile, logs, recipes, mealPlans, wearableData, waterIntake, points, achievements]);

  const addLog = (food: FoodItem, amount: number) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      food,
      amount,
      timestamp: Date.now(),
    };
    setLogs(prev => [...prev, newLog]);
    addPoints(10);
    checkAchievements('first_log');
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

  const addWater = (amount: number) => {
    setWaterIntake(prev => {
      const newVal = prev + amount;
      if (newVal >= profile.waterGoal) checkAchievements('hydration_hero');
      return newVal;
    });
    addPoints(5);
  };

  const addRecipe = (name: string, ingredients: { food: FoodItem; amount: number }[]) => {
    const newRecipe: Recipe = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      ingredients,
    };
    setRecipes(prev => [...prev, newRecipe]);
    addPoints(50);
    checkAchievements('recipe_master');
  };

  const addMealPlan = (name: string, days: { [key: string]: Recipe[] }) => {
    const newPlan: MealPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      days,
    };
    setMealPlans(prev => [...prev, newPlan]);
    addPoints(100);
    checkAchievements('planner_pro');
  };

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
    if (amount >= 50) confetti();
  };

  const checkAchievements = (id: string) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === id && !a.unlocked) {
        confetti();
        return { ...a, unlocked: true };
      }
      return a;
    }));
  };

  const calculateBMI = () => {
    const heightInMeters = profile.height / 100;
    if (heightInMeters === 0) return "0.0";
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateRecommendedCalories = () => {
    // Mifflin-St Jeor Equation
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

  return { 
    profile, setProfile, 
    logs, addLog, 
    recipes, addRecipe,
    mealPlans, addMealPlan,
    wearableData, toggleSleep,
    waterIntake, addWater, setWaterIntake,
    points, achievements, 
    addPoints, calculateBMI, calculateRecommendedCalories
  };
}

export interface MealPlan {
  id: string;
  name: string;
  days: { [key: string]: Recipe[] };
}