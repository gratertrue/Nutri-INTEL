import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { searchFoods, FoodItem, getNutrientValue } from '@/lib/usda-api';
import { Search, Plus, Trash2, Save, ChefHat, Share2, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

const RecipeBuilder = () => {
  const [recipeName, setRecipeName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [ingredients, setIngredients] = useState<{ food: FoodItem; amount: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { addRecipe, profile } = useNutritionStore();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await searchFoods(searchQuery, 10);
      setSearchResults(results);
    } catch (error: any) {
      showError(error.message || "Gagal mencari bahan");
    }
  };

  const addIngredient = (food: FoodItem) => {
    setIngredients([...ingredients, { food, amount: 100 }]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const totalCalories = Math.round(ingredients.reduce((acc, ing) => acc + (getNutrientValue(ing.food.foodNutrients, "Energy") * (ing.amount/100)), 0));
  const totalProtein = Math.round(ingredients.reduce((acc, ing) => acc + (getNutrientValue(ing.food.foodNutrients, "Protein") * (ing.amount/100)), 0));

  const handleSave = () => {
    if (!recipeName.trim() || ingredients.length === 0) {
      showError("Berikan nama dan setidaknya satu bahan");
      return;
    }
    addRecipe(recipeName, ingredients);
    showSuccess(`Resep "${recipeName}" disimpan secara lokal!`);
    setRecipeName('');
    setIngredients([]);
  };

  const handleUploadToCommunity = async () => {
    if (!recipeName.trim() || ingredients.length === 0) {
      showError("Lengkapi resep sebelum membagikan");
      return;
    }

    setIsUploading(true);
    try {
      const { error } = await supabase
        .from('community_recipes')
        .insert([
          {
            author_name: profile.name,
            recipe_name: recipeName,
            calories: totalCalories,
            protein: totalProtein,
            tags: ['User Recipe'],
            ingredients_data: ingredients // Menyimpan struktur bahan
          }
        ]);

      if (error) throw error;
      
      showSuccess("Resep berhasil dibagikan ke komunitas!");
      handleSave(); // Simpan lokal juga
    } catch (err: any) {
      console.error("Upload error:", err);
      showError("Gagal membagikan resep. Pastikan Supabase sudah terhubung.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-cyan-400" />
            Resep Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Nama Resep (misal: Smoothie Pagi)" 
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
          
          <div className="space-y-2">
            <Label className="text-slate-400">Tambah Bahan</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Cari bahan..." 
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
                    <span className="text-xs text-slate-500">gram</span>
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

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button onClick={handleSave} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Save className="h-4 w-4 mr-2" />
              Simpan Lokal
            </Button>
            <Button 
              onClick={handleUploadToCommunity} 
              disabled={isUploading}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Share2 className="h-4 w-4 mr-2" /> Bagikan</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Pratinjau Resep</CardTitle>
        </CardHeader>
        <CardContent>
          {ingredients.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Tambah bahan untuk melihat rincian nutrisi
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-xl text-center">
                  <p className="text-xs text-slate-500 uppercase">Total Kalori</p>
                  <p className="text-2xl font-bold text-white">{totalCalories}</p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-xl text-center">
                  <p className="text-xs text-slate-500 uppercase">Total Protein</p>
                  <p className="text-2xl font-bold text-blue-400">{totalProtein}g</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeBuilder;