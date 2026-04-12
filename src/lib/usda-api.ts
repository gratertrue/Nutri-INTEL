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
  servingSize?: number;
  servingSizeUnit?: string;
  brandOwner?: string;
  dataType?: string;
}

export const MOCK_FOODS: FoodItem[] = [
  {
    fdcId: 11060,
    description: "Apple, raw",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 52, unitName: "KCAL" },
      { nutrientId: 1003, nutrientName: "Protein", value: 0.26, unitName: "G" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 0.17, unitName: "G" },
      { nutrientId: 1005, nutrientName: "Carbohydrate", value: 13.81, unitName: "G" },
      { nutrientId: 1079, nutrientName: "Fiber", value: 2.4, unitName: "G" },
      { nutrientId: 2000, nutrientName: "Sugars", value: 10.39, unitName: "G" },
    ]
  },
  {
    fdcId: 171477,
    description: "Chicken breast, grilled",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 165, unitName: "KCAL" },
      { nutrientId: 1003, nutrientName: "Protein", value: 31, unitName: "G" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 3.6, unitName: "G" },
      { nutrientId: 1005, nutrientName: "Carbohydrate", value: 0, unitName: "G" },
    ]
  }
];

export async function searchFoods(query: string, pageSize: number = 25): Promise<FoodItem[]> {
  try {
    const response = await fetch(`${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=${pageSize}`);
    if (!response.ok) throw new Error("API limit or error");
    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error("USDA API Error, falling back to mock data:", error);
    return MOCK_FOODS.filter(f => f.description.toLowerCase().includes(query.toLowerCase()));
  }
}

export function getNutrientValue(nutrients: Nutrient[], nameOrId: string | number): number {
  const nutrient = nutrients.find(n => 
    typeof nameOrId === 'number' ? n.nutrientId === nameOrId : n.nutrientName.toLowerCase().includes(nameOrId.toLowerCase())
  );
  return nutrient ? nutrient.value : 0;
}

export function calculateSmartScore(nutrients: Nutrient[]): number {
  const protein = getNutrientValue(nutrients, "Protein");
  const fiber = getNutrientValue(nutrients, "Fiber");
  const sugar = getNutrientValue(nutrients, "Sugars");
  const fat = getNutrientValue(nutrients, "Total lipid (fat)");
  
  let score = 50; // Base score
  score += Math.min(protein * 2, 20);
  score += Math.min(fiber * 3, 15);
  score -= Math.min(sugar * 1.5, 20);
  score -= Math.min(fat * 0.5, 15);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}