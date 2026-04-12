import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchFoods, FoodItem, getNutrientValue, calculateSmartScore } from '@/lib/usda-api';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Search, Plus, Loader2, ChevronRight, Scale, Filter, X, Apple, Beef, Wheat, Coffee } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import HealthAnalyzer from './HealthAnalyzer';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'fruit', label: 'Fruits', icon: Apple, query: 'fruit' },
  { id: 'protein', label: 'Proteins', icon: Beef, query: 'meat poultry fish' },
  { id: 'grains', label: 'Grains', icon: Wheat, query: 'grain bread pasta' },
  { id: 'beverages', label: 'Drinks', icon: Coffee, query: 'beverage juice' },
];

const FILTERS = [
  { id: 'high-protein', label: 'High Protein', minProtein: 15 },
  { id: 'low-carb', label: 'Low Carb', maxCarbs: 10 },
  { id: 'low-cal', label: 'Low Calorie', maxCals: 150 },
];

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(100);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const { addLog } = useNutritionStore();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await searchFoods(searchQuery, 40);
      setResults(data);
      setFilteredResults(data);
    } catch (err) {
      showError("Failed to fetch food data");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    if (activeCategory === cat.id) {
      setActiveCategory(null);
      setResults([]);
      setFilteredResults([]);
    } else {
      setActiveCategory(cat.id);
      setQuery(cat.label);
      handleSearch(cat.query);
    }
  };

  useEffect(() => {
    let filtered = [...results];
    
    if (activeFilter === 'high-protein') {
      filtered = filtered.filter(f => getNutrientValue(f.foodNutrients, "Protein") >= 15);
    } else if (activeFilter === 'low-carb') {
      filtered = filtered.filter(f => getNutrientValue(f.foodNutrients, "Carbohydrate") <= 10);
    } else if (activeFilter === 'low-cal') {
      filtered = filtered.filter(f => getNutrientValue(f.foodNutrients, "Energy") <= 150);
    }

    setFilteredResults(filtered);
  }, [activeFilter, results]);

  const handleAdd = (food: FoodItem, logAmount: number) => {
    addLog(food, logAmount);
    showSuccess(`Added ${logAmount}g of ${food.description} to log!`);
    setSelectedFood(null);
    setAmount(100);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 300,000+ foods..."
              className="pl-10 bg-slate-900/50 border-slate-800 text-white"
            />
            {query && (
              <button 
                type="button"
                onClick={() => { setQuery(''); setResults([]); setFilteredResults([]); setActiveCategory(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant="outline"
              size="sm"
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800",
                activeCategory === cat.id && "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
              )}
            >
              <cat.icon className="h-3.5 w-3.5 mr-2" />
              {cat.label}
            </Button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-3 py-2 border-t border-slate-800">
            <Filter className="h-4 w-4 text-slate-500" />
            <div className="flex gap-2">
              {FILTERS.map(f => (
                <Badge
                  key={f.id}
                  variant="outline"
                  onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    activeFilter === f.id 
                      ? "bg-cyan-500 text-white border-cyan-500" 
                      : "text-slate-500 border-slate-800 hover:border-slate-600"
                  )}
                >
                  {f.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredResults.map((food) => {
          const score = calculateSmartScore(food.foodNutrients);
          const calories = getNutrientValue(food.foodNutrients, "Energy");
          const protein = getNutrientValue(food.foodNutrients, "Protein");
          
          return (
            <Card 
              key={food.fdcId} 
              className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all group cursor-pointer"
              onClick={() => setSelectedFood(food)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                    {food.description}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-800">
                      {Math.round(calories)} kcal
                    </Badge>
                    <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/20 bg-blue-500/5">
                      {protein.toFixed(1)}g Protein
                    </Badge>
                    <div className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      score > 70 ? 'bg-green-500/20 text-green-400' : 
                      score > 40 ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    )}>
                      Score: {score}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
              </CardContent>
            </Card>
          );
        })}
        
        {!loading && filteredResults.length === 0 && results.length > 0 && (
          <div className="text-center py-12 text-slate-500">
            No results match your filters.
          </div>
        )}

        {!loading && results.length === 0 && !activeCategory && (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
            <Search className="h-12 w-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500">Search for a food or select a category above</p>
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