/**
 * ############################################################
 * # FILE 1: THE LOGIC (JavaScript/TypeScript)
 * # This file talks to the USDA database to get food info.
 * ############################################################
 */

const API_KEY = "W1cTjbexnEV7o7cAqAmXlyytOGFCv2DnblANhXcR";
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// # Function to search for food
export const searchFoods = async (query: string) => {
  try {
    const response = await fetch(`${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&api_key=${API_KEY}&pageSize=10`);
    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    return [];
  }
};

// # Function to get a specific nutrient value (like Calories)
export function getNutrient(nutrients: any[], name: string) {
  const found = nutrients.find(n => n.nutrientName.toLowerCase().includes(name.toLowerCase()));
  return found ? found.value : 0;
}