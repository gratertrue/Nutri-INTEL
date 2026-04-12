/* ############################################################
   # STORE FILE: THE MEMORY
   # This file remembers your profile, food logs, and goals.
   ############################################################ */

import { useState, useEffect } from 'react';

export function useNutritionStore() {
  // # Load data from phone memory (LocalStorage)
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('nutri_profile') || '{"name":"User","weight":70,"height":175,"age":25,"calorieGoal":2000}'));
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('nutri_logs') || '[]'));

  // # Save data whenever it changes
  useEffect(() => {
    localStorage.setItem('nutri_profile', JSON.stringify(profile));
    localStorage.setItem('nutri_logs', JSON.stringify(logs));
  }, [profile, logs]);

  // # Function to add food to history
  const addLog = (foodName: string, calories: number) => {
    setLogs([...logs, { name: foodName, calories, time: Date.now() }]);
  };

  // # Calculate total calories eaten today
  const getTodayCalories = () => {
    const today = new Date().setHours(0,0,0,0);
    return logs
      .filter((l: any) => new Date(l.time).setHours(0,0,0,0) === today)
      .reduce((sum: number, l: any) => sum + l.calories, 0);
  };

  return { profile, setProfile, logs, addLog, getTodayCalories };
}