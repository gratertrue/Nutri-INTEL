/**
 * USDA & Translation API Utility
 * 
 * Riset MyMemory API:
 * - Endpoint: https://api.mymemory.translated.net/get
 * - Limit: 1000 kata/hari (Gratis tanpa key)
 * - Langpair: 'id|en' (Indo ke Inggris), 'en|id' (Inggris ke Indo)
 */

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
  
  // Deteksi sederhana: Jika mencari bahasa Inggris di mode id|en, lewati
  if (pair === 'id|en' && /^[a-zA-Z\s,]+$/.test(text) && !/[aiueo]{3,}/.test(text)) {
    // Ini hanya heuristik sederhana, MyMemory biasanya cukup pintar menangani ini
  }

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
    return text; // Fallback ke teks asli
  }
}

/**
 * Fungsi Pencarian USDA dengan API Key Dinamis
 */
export async function searchFoods(query: string, apiKey: string, pageSize: number = 10): Promise<FoodItem[]> {
  if (!apiKey) throw new Error("API Key USDA diperlukan");

  try {
    // 1. Terjemahkan input user (Indo -> Inggris)
    const translatedQuery = await translate(query, 'id|en');
    console.log(`Searching USDA for: ${translatedQuery} (Original: ${query})`);

    // 2. Request ke USDA menggunakan POST
    const response = await fetch(`${BASE_URL}/foods/search?api_key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: translatedQuery,
        pageSize: pageSize,
        dataType: ["Foundation", "SR Legacy", "Branded"]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Gagal menghubungi API USDA");
    }

    const data = await response.json();
    const foods = data.foods || [];

    // 3. Terjemahkan hasil kembali ke Indonesia (Inggris -> Indo) secara paralel
    const results = await Promise.all(foods.map(async (food: any) => {
      const translatedDesc = await translate(food.description, 'en|id');
      return {
        ...food,
        descriptionEn: food.description, // Simpan versi asli
        description: translatedDesc      // Versi terjemahan
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