/**
 * USDA & Translation API Utility
 * Dioptimalkan untuk koneksi mobile dan fallback pencarian.
 */

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || "DEMO_KEY"; 
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export async function translateText(text: string, pair: 'id|en' | 'en|id'): Promise<string> {
  if (!text || /^\d+$/.test(text)) return text;
  
  // Menggunakan MyMemory API dengan timeout
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout 3 detik
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    return data.responseStatus === 200 ? data.responseData.translatedText : text;
  } catch (error) {
    console.warn("Translation failed, using original text");
    return text;
  }
}

function isLikelyEnglish(text: string): boolean {
  const commonEnglish = /\b(chicken|rice|egg|bread|milk|water|beef|apple|fruit|meat|fish|potato)\b/i;
  return commonEnglish.test(text) || !/[^\x00-\x7F]/.test(text);
}

export async function searchFoods(query: string, pageSize: number = 15): Promise<FoodItem[]> {
  if (!USDA_API_KEY || USDA_API_KEY === 'DEMO_KEY') {
    console.error("USDA API Key is missing!");
  }

  const fetchFromUSDA = async (searchTerm: string) => {
    const params = new URLSearchParams({
      api_key: USDA_API_KEY,
      query: searchTerm,
      pageSize: pageSize.toString(),
      dataType: "Foundation,SR Legacy,Branded"
    });

    const response = await fetch(`${BASE_URL}/foods/search?${params.toString()}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.foods || [];
  };

  try {
    // Strategi 1: Coba dengan terjemahan jika bukan bahasa Inggris
    let searchTerms = query;
    if (!isLikelyEnglish(query)) {
      searchTerms = await translateText(query, 'id|en');
    }

    let results = await fetchFromUSDA(searchTerms);

    // Strategi 2: Fallback - Jika hasil kosong dan tadi pakai terjemahan, coba teks asli
    if (results.length === 0 && searchTerms !== query) {
      results = await fetchFromUSDA(query);
    }

    return results;
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
}

export function getNutrientValue(nutrients: Nutrient[], name: string): number {
  if (!nutrients) return 0;
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