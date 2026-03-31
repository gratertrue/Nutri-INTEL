import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchFoods, FoodItem, getNutrientValue, calculateSmartScore } from '@/lib/usda-api';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Search, Plus, Loader2, Info, ChevronRight, Scale } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import HealthAnalyzer from './HealthAnalyzer';

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(100);
  const { addLog } = useNutritionStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchFoods(query);
      setResults(data);
    } catch (err) {
      showError("Failed to fetch food data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (food: FoodItem, logAmount: number) => {
    addLog(food, logAmount);
    showSuccess(`Added ${logAmount}g of ${food.description} to log!`);
    setSelectedFood(null);
    setAmount(100);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 300,000+ foods (e.g. 'Blueberry', 'Salmon')..."
            className="pl-10 bg-slate-900/50 border-slate-800 text-white"
          />
        </div>
        <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {results.map((food) => {
          const score = calculateSmartScore(food.foodNutrients);
          const calories = getNutrientValue(food.foodNutrients, "Energy");
          
          return (
            <Card 
              key={food.fdcId} 
              className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all group cursor-pointer"
              onClick={() => setSelectedFood(food)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">{food.description}</h3>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-slate-400 border-slate-700">
                      {Math.round(calories)} kcal / 100g
                    </Badge>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded ${
                      score > 70 ? 'bg-green-500/20 text-green-400' : 
                      score > 40 ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      Smart Score: {score}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </CardContent>
            </Card>
          );
        })}
        
        {!loading && results.length === 0 && query && (
          <div className="text-center py-12 text-slate-500">
            No results found. Try a different search term.
          </div>
        )}
      </div>

      <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl">
          {selectedFood && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-cyan-400">{selectedFood.description}</DialogTitle>
                <p className="text-slate-400 text-sm">Nutrition facts per {amount}g</p>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Calories</p>
                      <p className="text-xl font-bold text-white">
                        {Math.round(getNutrientValue(selectedFood.foodNutrients, "Energy") * (amount / 100))}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Protein</p>
                      <p className="text-xl font-bold text-blue-400">
                        {(getNutrientValue(selectedFood.foodNutrients, "Protein") * (amount / 100)).toFixed(1)}g
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Carbs</p>
                      <p className="text-xl font-bold text-green-400">
                        {(getNutrientValue(selectedFood.foodNutrients, "Carbohydrate") * (amount / 100)).toFixed(1)}g
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Fat</p>
                      <p className="text-xl font-bold text-yellow-400">
                        {(getNutrientValue(selectedFood.foodNutrients, "Total lipid (fat)") * (amount / 100)).toFixed(1)}g
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Micronutrients</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between border-b border-slate-800 py-1">
                        <span className="text-slate-400">Fiber</span>
                        <span>{(getNutrientValue(selectedFood.foodNutrients, "Fiber") * (amount / 100)).toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 py-1">
                        <span className="text-slate-400">Sugars</span>
                        <span>{(getNutrientValue(selectedFood.foodNutrients, "Sugars") * (amount / 100)).toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 py-1">
                        <span className="text-slate-400">Sodium</span>
                        <span>{Math.round(getNutrientValue(selectedFood.foodNutrients, "Sodium") * (amount / 100))}mg</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 py-1">
                        <span className="text-slate-400">Calcium</span>
                        <span>{Math.round(getNutrientValue(selectedFood.foodNutrients, "Calcium") * (amount / 100))}mg</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">Health Analysis</p>
                  <HealthAnalyzer food={selectedFood} />
                  
                  <div className="pt-4 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Scale className="h-3 w-3" />
                      Adjust Portion (grams)
                    </label>
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="bg-slate-900 border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="sm:justify-between gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedFood(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleAdd(selectedFood, amount)}
                  className="bg-cyan-600 hover:bg-cyan-700 flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Daily Log
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <div className="text-center text-[10px] text-slate-600 mt-8">
        Powered by <a href="https://fdc.nal.usda.gov/" target="_blank" className="underline">USDA FoodData Central</a>
      </div>
    </div>
  );
};

export default FoodSearch;