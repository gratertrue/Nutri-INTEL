/**
 * USDA & Translation API Utility with Mobile Debugging
 */
import { debugStore } from '@/hooks/use-debug-store';

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
  if (!text || /^\d+$/.test(text) || text.length < 2) return text;
  
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  try {
    debugStore.addLog('info', `Menerjemahkan: "${text}" (${pair})`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    if (data.responseStatus === 200) {
      const translated = data.responseData.translatedText;
      debugStore.addLog('info', `Hasil Terjemahan: "${translated}"`);
      return translated;
    }
    return text;
  } catch (error: any) {
    debugStore.addLog('warn', `Gagal menerjemahkan: ${error.message}`);
    return text;
  }
}

export async function searchFoods(query: string, pageSize: number = 15): Promise<FoodItem[]> {
  const apiKey = import.meta.env.VITE_USDA_API_KEY;

  if (!apiKey) {
    debugStore.addLog('error', "API KEY USDA Kosong!");
    throw new Error("Kunci API tidak ditemukan.");
  }

  try {
    const searchTerms = query.trim();
    debugStore.addLog('info', `Mencari di USDA (English): "${searchTerms}"`);
    
    const params = new URLSearchParams({
      api_key: apiKey,
      query: searchTerms,
      pageSize: pageSize.toString(),
      dataType: "Foundation,SR Legacy,Branded"
    });

    const response = await fetch(`${BASE_URL}/foods/search?${params.toString()}`);

    if (!response.ok) {
      debugStore.addLog('error', `USDA API Error: ${response.status}`);
      throw new Error(`Kesalahan API: ${response.status}`);
    }

    const data = await response.json();
    const results = data.foods || [];
    
    debugStore.addLog('info', `Ditemukan ${results.length} hasil untuk "${searchTerms}"`);
    return results;
  } catch (error: any) {
    debugStore.addLog('error', `Search Exception: ${error.message}`);
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