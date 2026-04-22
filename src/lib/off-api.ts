/**
 * Open Food Facts API Utility
 */

import { FoodItem, Nutrient } from './usda-api';

const BASE_URL = "https://world.openfoodfacts.org";

export async function searchOFFFoods(query: string): Promise<FoodItem[]> {
  try {
    const url = `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Nutri-INTEL - Web - Version 1.0'
      }
    });

    if (!response.ok) throw new Error("Gagal mengambil data dari Open Food Facts");

    const data = await response.json();
    
    return (data.products || []).map((product: any) => {
      const nutriments = product.nutriments || {};
      
      // Mapping nutrisi OFF ke format aplikasi kita
      const foodNutrients: Nutrient[] = [
        { 
          nutrientId: 1008, 
          nutrientName: "Energy", 
          value: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0, 
          unitName: "kcal" 
        },
        { 
          nutrientId: 1003, 
          nutrientName: "Protein", 
          value: nutriments.proteins_100g || 0, 
          unitName: "g" 
        },
        { 
          nutrientId: 1005, 
          nutrientName: "Carbohydrate", 
          value: nutriments.carbohydrates_100g || 0, 
          unitName: "g" 
        },
        { 
          nutrientId: 1004, 
          nutrientName: "Total lipid (fat)", 
          value: nutriments.fat_100g || 0, 
          unitName: "g" 
        },
        { 
          nutrientId: 2000, 
          nutrientName: "Sugars", 
          value: nutriments.sugars_100g || 0, 
          unitName: "g" 
        },
        { 
          nutrientId: 1093, 
          nutrientName: "Sodium", 
          value: (nutriments.sodium_100g || 0) * 1000, // Convert to mg
          unitName: "mg" 
        },
        { 
          nutrientId: 1079, 
          nutrientName: "Fiber", 
          value: nutriments.fiber_100g || 0, 
          unitName: "g" 
        }
      ];

      return {
        fdcId: product.code || Math.random(),
        description: product.product_name || "Produk Tanpa Nama",
        brandOwner: product.brands || "Unknown Brand",
        foodNutrients,
        dataType: "Branded (OFF)"
      };
    });
  } catch (error) {
    console.error("OFF Search Error:", error);
    return [];
  }
}