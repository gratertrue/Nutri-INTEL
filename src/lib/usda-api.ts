/**
 * USDA & Translation API Utility
 */

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
  descriptionEn: string;
  foodNutrients: Nutrient[];
  brandOwner?: string;
}

/**
 * Fungsi Penerjemah menggunakan MyMemory API
 */
async function translate(text: string, pair: 'id|en' | 'en|id'): Promise<string> {
  if (!text || /^\d+$/.test(text)) return text;
  
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
}

/**
 * Fungsi Pencarian USDA dengan API Key Hardcoded
 */
export async function searchFoods(query: string, pageSize: number = 12): Promise<FoodItem[]> {
  try {
    // 1. Terjemahkan input user (Indo -> Inggris)
    const translatedQuery = await translate(query, 'id|en');

    // 2. Request ke USDA menggunakan POST
    const response = await fetch(`${BASE_URL}/foods/search?api_key=${USDA_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: translatedQuery,
        pageSize: pageSize,
        dataType: ["Foundation", "SR Legacy", "Branded"]
      })
    });

    if (!response.ok) {
      throw new Error("Gagal menghubungi API USDA");
    }

    const data = await response.json();
    const foods = data.foods || [];

    // 3. Terjemahkan hasil kembali ke Indonesia (Inggris -> Indo)
    const results = await Promise.all(foods.map(async (food: any) => {
      const translatedDesc = await translate(food.description, 'en|id');
      return {
        ...food,
        descriptionEn: food.description,
        description: translatedDesc
      };
    }));

    return results;
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
}

export function getNutrientValue(nutrients: Nutrient[], name: string): number {
  const n = nutrients.find(n => n.nutrientName.toLowerCase().includes(name.toLowerCase()));
  return n ? n.value : 0;
}

export function calculateSmartScore(nutrients: Nutrient[]): number {
  const protein = getNutrientValue(nutrients, "Protein");
  const fiber = getNutrientValue(nutrients, "Fiber");
  const sugar = getNutrientValue(nutrients, "Sugars");
  
  let score = 50;
  score += (protein * 2) + (fiber * 3);
  score -= (sugar * 2);
  return Math.max(0, Math.min(100, Math.round(score)));
}