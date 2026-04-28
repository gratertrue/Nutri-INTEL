/**
 * USDA & Translation API Utility - High Accuracy Version
 */

const USDA_API_KEY = "lPjMa22MuuIYtCILxkHRdEHse3eM7uqH5sHEbSKR"; 
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// Mapping ID Nutrien Resmi USDA untuk Akurasi 100%
export const NUTRIENT_IDS = {
  ENERGY: 1008,
  PROTEIN: 1003,
  FAT: 1004,
  CARBS: 1005,
  FIBER: 1079,
  SUGAR: 2000,
  CALCIUM: 1087,
  IRON: 1089,
  MAGNESIUM: 1090,
  ZINC: 1095,
  VIT_C: 1162,
  VIT_A: 1106,
  VIT_B12: 1178,
  SODIUM: 1093,
  SAT_FAT: 1258
};

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
  brandOwner?: string;
  dataType?: string;
}

export async function translateText(text: string, pair: 'id|en' | 'en|id'): Promise<string> {
  if (!text || /^\d+$/.test(text)) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.responseStatus === 200 ? data.responseData.translatedText : text;
  } catch (error) {
    return text;
  }
}

export async function searchFoods(query: string, pageSize: number = 15): Promise<FoodItem[]> {
  try {
    let searchTerms = query;
    const isEnglish = /\b(chicken|rice|egg|bread|milk|water|beef|apple|fruit|meat|fish|potato)\b/i.test(query);
    
    if (!isEnglish) {
      searchTerms = await translateText(query, 'id|en');
    }

    const params = new URLSearchParams({
      api_key: USDA_API_KEY,
      query: searchTerms,
      pageSize: pageSize.toString(),
      dataType: "Foundation,SR Legacy,Branded"
    });

    const response = await fetch(`${BASE_URL}/foods/search?${params.toString()}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
}

// Fungsi pengambil nilai berdasarkan ID (Lebih Akurat daripada Nama)
export function getNutrientById(nutrients: Nutrient[], id: number): number {
  const n = nutrients.find(n => n.nutrientId === id);
  return n ? n.value : 0;
}

// Fallback untuk pencarian nama jika ID tidak tersedia
export function getNutrientValue(nutrients: Nutrient[], name: string): number {
  const n = nutrients.find(n => n.nutrientName.toLowerCase().includes(name.toLowerCase()));
  return n ? n.value : 0;
}

export function calculateSmartScore(nutrients: Nutrient[]): number {
  const protein = getNutrientById(nutrients, NUTRIENT_IDS.PROTEIN);
  const fiber = getNutrientById(nutrients, NUTRIENT_IDS.FIBER);
  const sugar = getNutrientById(nutrients, NUTRIENT_IDS.SUGAR);
  const satFat = getNutrientById(nutrients, NUTRIENT_IDS.SAT_FAT);
  
  let score = 60;
  score += (protein * 1.5) + (fiber * 2);
  score -= (sugar * 1.5) + (satFat * 2);
  return Math.max(0, Math.min(100, Math.round(score)));
}