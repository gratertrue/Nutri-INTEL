/**
 * USDA & Translation API Utility
 * Menggunakan Environment Variables untuk keamanan.
 */

// Mengambil kunci dari variabel lingkungan (Vite)
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY; 
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

function isLikelyEnglish(text: string): boolean {
  const commonEnglish = /\b(chicken|rice|egg|bread|milk|water|beef|apple|fruit|meat|fish|potato)\b/i;
  return commonEnglish.test(text) || !/[^\x00-\x7F]/.test(text);
}

export async function searchFoods(query: string, pageSize: number = 15): Promise<FoodItem[]> {
  if (!USDA_API_KEY || USDA_API_KEY === 'DEMO_KEY') {
    throw new Error("Kunci API tidak ditemukan. Pastikan VITE_USDA_API_KEY sudah diatur di variabel lingkungan.");
  }

  try {
    let searchTerms = query;
    if (!isLikelyEnglish(query)) {
      searchTerms = await translateText(query, 'id|en');
    }

    const params = new URLSearchParams({
      api_key: USDA_API_KEY,
      query: searchTerms,
      pageSize: pageSize.toString(),
      dataType: "Foundation,SR Legacy,Branded"
    });

    const response = await fetch(`${BASE_URL}/foods/search?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 403) {
        throw new Error("Kunci API USDA bermasalah atau telah dinonaktifkan.");
      }
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.foods || [];
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