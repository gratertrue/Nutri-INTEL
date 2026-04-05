const USDA_API_KEY = "W1cTjbexnEV7o7cAqAmXlyytOGFCv2DnblANhXcR";
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export interface Nutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

export interface FoodItem {
  fdcId: number;
  description: string;
  foodNutrients: Nutrient[];
}

export const searchFoods = async (query: string, pageSize: number = 25): Promise<FoodItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=${pageSize}`);
    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error("USDA API Error:", error);
    return [];
  }
};

export function getNutrientValue(nutrients: Nutrient[], name: string): number {
  const nutrient = nutrients.find(n => n.nutrientName.toLowerCase().includes(name.toLowerCase()));
  return nutrient ? nutrient.value : 0;
}

export function calculateSmartScore(nutrients: Nutrient[]): number {
  const protein = getNutrientValue(nutrients, "Protein");
  const fiber = getNutrientValue(nutrients, "Fiber");
  const sugar = getNutrientValue(nutrients, "Sugars");
  const fat = getNutrientValue(nutrients, "Total lipid (fat)");

  // Simple scoring logic: +protein/fiber, -sugar/fat
  let score = 50 + (protein * 2) + (fiber * 3) - (sugar * 1.5) - (fat * 1);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export function calculateGerdRisk(food: FoodItem): { level: RiskLevel; reason: string } {
  const nutrients = food.foodNutrients;
  const fat = getNutrientValue(nutrients, "Total lipid (fat)");
  const sugar = getNutrientValue(nutrients, "Sugars");
  const desc = food.description.toLowerCase();

  const highRiskKeywords = ['spicy', 'chili', 'pepper', 'mint', 'chocolate', 'coffee', 'caffeine', 'citrus', 'lemon', 'orange', 'tomato', 'fried'];
  
  if (fat > 15 || highRiskKeywords.some(k => desc.includes(k))) {
    return { level: 'High', reason: fat > 15 ? 'High fat content' : 'Contains known trigger ingredients' };
  }
  
  if (fat > 8 || sugar > 15) {
    return { level: 'Medium', reason: 'Moderate fat or sugar content' };
  }

  return { level: 'Low', reason: 'Low fat and non-acidic profile' };
}