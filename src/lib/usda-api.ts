/**
 * USDA & Translation API Utility with Indonesian Dictionary
 */

const USDA_API_KEY = "W1cTjbexnEV7o7cAqAmXlyytOGFCv2DnblANhXcR";
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// Kamus lokal untuk nutrisi agar performa lebih cepat
const NUTRIENT_DICT: { [key: string]: string } = {
  "Energy": "Energi",
  "Protein": "Protein",
  "Carbohydrate, by difference": "Karbohidrat",
  "Total lipid (fat)": "Lemak Total",
  "Fiber, total dietary": "Serat",
  "Sugars, total including NLEA": "Gula",
  "Sodium, Na": "Natrium",
  "Fatty acids, total saturated": "Lemak Jenuh",
  "Cholesterol": "Kolesterol",
  "Calcium, Ca": "Kalsium",
  "Iron, Fe": "Zat Besi",
  "Potassium, K": "Kalium",
  "Vitamin C, total ascorbic acid": "Vitamin C",
  "Vitamin A, RAE": "Vitamin A",
  "Water": "Air",
  "Ash": "Abu",
  "Fiber": "Serat",
  "Sugars": "Gula",
  "Sodium": "Natrium"
};

export interface Nutrient {
  nutrientId: number;
  nutrientName: string;
  translatedName?: string; // Nama dalam Bahasa Indonesia
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
 * Mendapatkan nama nutrisi dalam Bahasa Indonesia
 */
export function getTranslatedNutrientName(name: string): string {
  // Cek di kamus dulu
  for (const key in NUTRIENT_DICT) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return NUTRIENT_DICT[key];
    }
  }
  // Jika tidak ada di kamus, kembalikan nama asli (atau bisa ditambahkan logika translate API jika perlu)
  return name;
}

/**
 * Fungsi Pencarian USDA
 */
export async function searchFoods(query: string, pageSize: number = 12): Promise<FoodItem[]> {
  try {
    // 1. Terjemahkan input user (Indo -> Inggris) untuk pencarian API
    const translatedQuery = await translate(query, 'id|en');

    const response = await fetch(`${BASE_URL}/foods/search?api_key=${USDA_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: translatedQuery,
        pageSize: pageSize,
        dataType: ["Foundation", "SR Legacy", "Branded"]
      })
    });

    if (!response.ok) throw new Error("Gagal menghubungi API USDA");

    const data = await response.json();
    const foods = data.foods || [];

    // 3. Terjemahkan hasil kembali ke Indonesia
    const results = await Promise.all(foods.map(async (food: any) => {
      const translatedDesc = await translate(food.description, 'en|id');
      
      // Terjemahkan setiap nama nutrisi menggunakan kamus
      const translatedNutrients = food.foodNutrients.map((n: any) => ({
        ...n,
        translatedName: getTranslatedNutrientName(n.nutrientName)
      }));

      return {
        ...food,
        descriptionEn: food.description,
        description: translatedDesc,
        foodNutrients: translatedNutrients
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