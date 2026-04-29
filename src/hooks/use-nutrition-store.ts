import { useState, useEffect } from 'react';
import { FoodItem, Nutrient, getNutrientById, NUTRIENT_IDS } from '@/lib/usda-api';
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
  carbsGoal: number;
  waterGoal: number;
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

export interface SleepSession {
  id: string;
  startTime: number;
  endTime: number;
  durationHours: number;
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
  sleepHistory: SleepSession[];
}

export interface MealPlan {
  id: string;
  name: string;
  days: { [key: string]: Recipe[] };
}

const INITIAL_PROFILE: UserProfile = {
  name: "Penjelajah",
  weight: 70,
  height: 175,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  calorieGoal: 2000,
  proteinGoal: 60,
  carbsGoal: 250,
  waterGoal: 2500,
  goal: 'maintenance',
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_log', title: 'Gigitan Pertama', description: 'Catat makanan pertama Anda', icon: '🍎', unlocked: false },
  { id: 'protein_king', title: 'Raja Protein', description: 'Capai target protein harian', icon: '💪', unlocked: false },
  { id: 'recipe_master', title: 'Master Resep', description: 'Buat resep pertama Anda', icon: '👨‍🍳', unlocked: false },
  { id: 'planner_pro', title: 'Perencana Pro', description: 'Buat rencana makan 7 hari', icon: '📅', unlocked: false },
  { id: 'hydration_hero', title: 'Pahlawan Hidrasi', description: 'Capai target minum air', icon: '💧', unlocked: false },
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
    const defaultData = { steps: 8432, sleepHours: 0, isSleeping: false, sleepStartTime: null, sleepHistory: [] };
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultData, ...parsed, sleepHistory: parsed.sleepHistory || [] };
    }
    return defaultData;
  });

  const [waterIntake, setWaterIntake] = useState(() => {
    const saved = localStorage.getItem('nutrition_water');
    const lastDate = localStorage.getItem('nutrition_water_date');
    const today = new Date().toDateString();
    if (lastDate !== today) return 0;
    return saved ? Number(saved) : 0;
  });

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
    localStorage.setItem('nutrition_water_date', new Date().toDateString());
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
        const endTime = Date.now();
        const startTime = prev.sleepStartTime || endTime;
        const durationMs = endTime - startTime;
        const durationHours = Number((durationMs / (1000 * 60 * 60)).toFixed(2));
        const newSession: SleepSession = {
          id: Math.random().toString(36).substr(2, 9),
          startTime,
          endTime,
          durationHours
        };
        const history = prev.sleepHistory || [];
        return { 
          ...prev, 
          isSleeping: false, 
          sleepStartTime: null, 
          sleepHours: Number((prev.sleepHours + durationHours).toFixed(1)),
          sleepHistory: [newSession, ...history].slice(0, 10)
        };
      }
    });
  };

  const resetSleep = () => {
    setWearableData(prev => ({ ...prev, isSleeping: false, sleepStartTime: null, sleepHours: 0, sleepHistory: [] }));
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
    const newRecipe: Recipe = { id: `recipe-${Math.random().toString(36).substr(2, 9)}`, name, ingredients };
    setRecipes(prev => [...prev, newRecipe]);
    addPoints(50);
    checkAchievements('recipe_master');
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const addMealPlan = (name: string, days: { [key: string]: Recipe[] }) => {
    const newPlan: MealPlan = { id: Math.random().toString(36).substr(2, 9), name, days };
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
    let bmr = 0;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
    const activityFactors = { sedentary: 1.2, light: 1.4, moderate: 1.6, active: 1.8, very_active: 2.0 };
    let tdee = bmr * activityFactors[profile.activityLevel];
    if (profile.goal === 'weight_loss') tdee -= 500;
    if (profile.goal === 'muscle_gain') tdee += 300;
    return Math.round(tdee);
  };

  const calculateRecommendedProtein = () => {
    // Faktor protein berdasarkan aktivitas & target (Halodoc/Alodokter)
    let factor = 0.8; // Default Sedenter
    
    if (profile.activityLevel === 'light') factor = 1.0;
    if (profile.activityLevel === 'moderate') factor = 1.2;
    if (profile.activityLevel === 'active') factor = 1.5;
    if (profile.activityLevel === 'very_active' || profile.goal === 'muscle_gain') factor = 2.0;
    
    // Penyesuaian khusus target
    if (profile.goal === 'weight_loss') factor = Math.max(factor, 1.2); // Protein tinggi saat diet agar otot tidak hilang

    return Math.round(profile.weight * factor);
  };

  const getAKGGoals = () => {
    const isMale = profile.gender === 'male';
    const age = profile.age;
    return {
      vitaminC: isMale ? 90 : 75,
      iron: isMale ? (age < 18 ? 15 : 9) : (age < 50 ? 18 : 8),
      calcium: age < 18 ? 1200 : 1000,
      vitaminA: isMale ? 650 : 600,
      zinc: isMale ? 11 : 8,
      magnesium: isMale ? 400 : 310,
      vitaminB12: 2.4
    };
  };

  const getAverageNutrients = (days: number = 3) => {
    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - days)).getTime();
    const recentLogs = logs.filter(l => l.timestamp >= cutoff);
    if (recentLogs.length === 0) return null;
    const totals = recentLogs.reduce((acc, log) => {
      const factor = log.amount / 100;
      acc.calories += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.ENERGY) * factor;
      acc.protein += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.PROTEIN) * factor;
      acc.carbs += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.CARBS) * factor;
      acc.fat += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.FAT) * factor;
      acc.vitaminC += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.VIT_C) * factor;
      acc.iron += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.IRON) * factor;
      acc.calcium += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.CALCIUM) * factor;
      acc.vitaminA += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.VIT_A) * factor;
      acc.zinc += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.ZINC) * factor;
      acc.magnesium += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.MAGNESIUM) * factor;
      acc.vitaminB12 += getNutrientById(log.food.foodNutrients, NUTRIENT_IDS.VIT_B12) * factor;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, vitaminC: 0, iron: 0, calcium: 0, vitaminA: 0, zinc: 0, magnesium: 0, vitaminB12: 0 });
    return {
      calories: totals.calories / days, protein: totals.protein / days, carbs: totals.carbs / days, fat: totals.fat / days,
      vitaminC: totals.vitaminC / days, iron: totals.iron / days, calcium: totals.calcium / days, vitaminA: totals.vitaminA / days,
      zinc: totals.zinc / days, magnesium: totals.magnesium / days, vitaminB12: totals.vitaminB12 / days,
    };
  };

  const convertRecipeToFood = (recipe: Recipe): FoodItem => {
    const nutrientTotals: Record<string, { value: number, unit: string, id: number }> = {};
    recipe.ingredients.forEach(ing => {
      const factor = ing.amount / 100;
      ing.food.foodNutrients.forEach(n => {
        if (!nutrientTotals[n.nutrientName]) nutrientTotals[n.nutrientName] = { value: 0, unit: n.unitName, id: n.nutrientId };
        nutrientTotals[n.nutrientName].value += n.value * factor;
      });
    });
    const foodNutrients: Nutrient[] = Object.entries(nutrientTotals).map(([name, data]) => ({
      nutrientName: name, value: data.value, unitName: data.unit, nutrientId: data.id
    }));
    return {
      fdcId: Math.abs(recipe.id.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0)),
      description: recipe.name, foodNutrients, dataType: 'LocalRecipe'
    };
  };

  return { 
    profile, setProfile, logs, addLog, recipes, addRecipe, deleteRecipe, mealPlans, addMealPlan,
    wearableData, toggleSleep, resetSleep, waterIntake, addWater, setWaterIntake, points, achievements, 
    addPoints, calculateBMI, calculateRecommendedCalories, calculateRecommendedProtein,
    getAKGGoals, getAverageNutrients, convertRecipeToFood
  };
}