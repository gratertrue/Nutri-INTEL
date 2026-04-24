import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { searchFoods, FoodItem, getNutrientValue } from '@/lib/usda-api';
import { Search, Plus, Trash2, Save, ChefHat, History } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const RecipeBuilder = () => {
  const [recipeName, setRecipeName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [ingredients, setIngredients] = useState<{ food: FoodItem; amount: number }[]>([]);
  const { addRecipe, recipes, deleteRecipe } = useNutritionStore();

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

  const handleSave = () => {
    if (!recipeName.trim() || ingredients.length === 0) {
      showError("Berikan nama dan setidaknya satu bahan");
      return;
    }
    addRecipe(recipeName, ingredients);
    showSuccess(`Resep "${recipeName}" disimpan!`);
    setRecipeName('');
    setIngredients([]);
  };

  const handleDeleteRecipe = (id: string, name: string) => {
    deleteRecipe(id);
    showSuccess(`Resep "${name}" telah dihapus`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-cyan-400" />
              Buat Resep Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-slate-500 uppercase font-bold">Nama Resep</Label>
              <Input 
                placeholder="misal: Smoothie Pagi" 
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] text-slate-500 uppercase font-bold">Tambah Bahan</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Cari bahan..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button onClick={handleSearch} size="icon" variant="secondary" className="shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 border border-slate-700 rounded-xl overflow-hidden bg-slate-800 shadow-xl">
                  {searchResults.map(food => (
                    <button
                      key={food.fdcId}
                      onClick={() => addIngredient(food)}
                      className="w-full text-left p-3 hover:bg-slate-700 text-sm text-slate-200 border-b border-slate-700 last:border-0 transition-colors"
                    >
                      {food.description}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-[10px] text-slate-500 uppercase font-bold">Daftar Bahan</Label>
              {ingredients.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 text-xs">
                  Belum ada bahan ditambahkan
                </div>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-xs text-white font-medium truncate">{ing.food.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Input 
                            type="number" 
                            value={ing.amount}
                            onChange={(e) => {
                              const newIngs = [...ingredients];
                              newIngs[idx].amount = Number(e.target.value);
                              setIngredients(newIngs);
                            }}
                            className="w-16 h-7 bg-slate-900 border-slate-700 text-[10px] px-2"
                          />
                          <span className="text-[10px] text-slate-500">gram</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeIngredient(idx)}
                        className="text-slate-500 hover:text-red-400 h-8 w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleSave} className="w-full bg-cyan-600 hover:bg-cyan-700 mt-4 h-11 font-bold rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              Simpan Resep
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm uppercase font-bold tracking-wider">Pratinjau Nutrisi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Kalori</p>
                  <p className="text-2xl font-black text-white">
                    {Math.round(ingredients.reduce((acc, ing) => acc + (getNutrientValue(ing.food.foodNutrients, "Energy") * (ing.amount/100)), 0))}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Protein</p>
                  <p className="text-2xl font-black text-blue-400">
                    {Math.round(ingredients.reduce((acc, ing) => acc + (getNutrientValue(ing.food.foodNutrients, "Protein") * (ing.amount/100)), 0))}g
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-sm uppercase font-bold tracking-wider">
                <History className="h-4 w-4 text-slate-500" />
                Resep Saya ({recipes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {recipes.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 text-xs italic">
                    Belum ada resep tersimpan
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recipes.map((recipe) => (
                      <div key={recipe.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800 group hover:border-cyan-500/30 transition-all">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="text-sm font-bold text-white truncate">{recipe.name}</p>
                          <p className="text-[10px] text-slate-500">{recipe.ingredients.length} Bahan</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                          className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeBuilder;