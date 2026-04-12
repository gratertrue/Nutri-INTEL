import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { searchFoods, FoodItem, getNutrientValue } from '@/lib/usda-api';
import { Search, Plus, Trash2, Save, ChefHat } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const RecipeBuilder = () => {
  const [recipeName, setRecipeName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [ingredients, setIngredients] = useState<{ food: FoodItem; amount: number }[]>([]);
  const { addRecipe } = useNutritionStore();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchFoods(searchQuery);
    setSearchResults(results);
  };

  const addIngredient = (food: FoodItem) => {
    setIngredients([...ingredients, { food, amount: 100 }]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!recipeName.trim() || ingredients.length === 0) {
      showError("Please provide a name and at least one ingredient");
      return;
    }
    addRecipe(recipeName, ingredients);
    showSuccess(`Recipe "${recipeName}" saved!`);
    setRecipeName('');
    setIngredients([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-cyan-400" />
            New Recipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Recipe Name (e.g. Morning Smoothie)" 
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
          
          <div className="space-y-2">
            <Label className="text-slate-400">Add Ingredients</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Search ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button onClick={handleSearch} size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-2 border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
                {searchResults.map(food => (
                  <button
                    key={food.fdcId}
                    onClick={() => addIngredient(food)}
                    className="w-full text-left p-2 hover:bg-slate-700 text-sm text-slate-200 border-b border-slate-700 last:border-0"
                  >
                    {food.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{ing.food.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="number" 
                      value={ing.amount}
                      onChange={(e) => {
                        const newIngs = [...ingredients];
                        newIngs[idx].amount = Number(e.target.value);
                        setIngredients(newIngs);
                      }}
                      className="w-20 h-7 bg-slate-900 border-slate-700 text-xs"
                    />
                    <span className="text-xs text-slate-500">grams</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeIngredient(idx)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleSave} className="w-full bg-cyan-600 hover:bg-cyan-700 mt-4">
            <Save className="h-4 w-4 mr-2" />
            Save Recipe
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recipe Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {ingredients.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Add ingredients to see nutrition breakdown
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-xl text-center">
                  <p className="text-xs text-slate-500 uppercase">Total Calories</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(ingredients.reduce((acc, ing) => acc + (getNutrientValue(ing.food.foodNutrients, "Energy") * (ing.amount/100)), 0))}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-xl text-center">
                  <p className="text-xs text-slate-500 uppercase">Total Protein</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.round(ingredients.reduce((acc, ing) => acc + (getNutrientValue(ing.food.foodNutrients, "Protein") * (ing.amount/100)), 0))}g
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-400">Macro Split</p>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: '30%' }} />
                  <div className="h-full bg-green-500" style={{ width: '40%' }} />
                  <div className="h-full bg-yellow-500" style={{ width: '30%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Protein</span>
                  <span>Carbs</span>
                  <span>Fat</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import { Label } from '@/components/ui/label';

export default RecipeBuilder;