import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchFoods, FoodItem, getNutrientValue, calculateSmartScore, translateText } from '@/lib/usda-api';
import { getProductByBarcode } from '@/lib/openfoodfacts-api';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Search, Loader2, ChevronRight, AlertCircle, X, ListFilter, Plus, Languages, Zap, ScanBarcode } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import HealthAnalyzer from './HealthAnalyzer';
import BarcodeScanner from './BarcodeScanner';
import { cn } from '@/lib/utils';

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [translatedName, setTranslatedName] = useState('');
  const [translating, setTranslating] = useState(false);
  const [amount, setAmount] = useState(100);
  const [showScanner, setShowScanner] = useState(false);
  
  const { addLog } = useNutritionStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const data = await searchFoods(trimmed, 20);
      setResults(data);
      setHasSearched(true);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showError("Gagal mencari makanan. Periksa koneksi internet Anda.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) performSearch(query);
    }, 800);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setLoading(true);
    try {
      const product = await getProductByBarcode(barcode);
      if (product) {
        handleSelectFood(product);
        showSuccess("Produk ditemukan!");
      } else {
        showError("Produk tidak ditemukan.");
      }
    } catch (err) {
      showError("Gagal memproses barcode");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = async (food: FoodItem) => {
    setSelectedFood(food);
    setTranslatedName(food.description);
    setTranslating(true);
    try {
      // Terjemahan hanya dilakukan setelah item diklik
      const idName = await translateText(food.description, 'en|id');
      setTranslatedName(idName);
    } catch (e) {
      // Tetap gunakan nama asli jika gagal
    } finally {
      setTranslating(false);
    }
  };

  const handleAdd = (food: FoodItem, logAmount: number) => {
    addLog(food, logAmount);
    showSuccess(`Ditambahkan ke log!`);
    setSelectedFood(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {showScanner && (
        <BarcodeScanner 
          onScan={handleBarcodeScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </div>
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
              placeholder="Search in English (e.g. Chicken, Rice, Egg)..."
              className="pl-12 pr-12 bg-slate-900/80 border-slate-800 text-white h-14 text-lg rounded-2xl focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-2xl"
            />
            {query && (
              <button 
                onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button 
            onClick={() => performSearch(query)}
            className="h-14 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-700 shadow-2xl font-bold hidden sm:flex"
          >
            Search
          </Button>
          <Button 
            onClick={() => setShowScanner(true)}
            className="h-14 w-14 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-2xl shrink-0"
          >
            <ScanBarcode className="h-6 w-6 text-cyan-400" />
          </Button>
        </div>
        
        <Button 
          onClick={() => performSearch(query)}
          disabled={loading || query.length < 2}
          className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-700 font-bold sm:hidden"
        >
          {loading ? "Searching..." : "Search Food"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {results.map((food) => {
          const score = calculateSmartScore(food.foodNutrients);
          return (
            <Card 
              key={food.fdcId} 
              className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden group"
              onClick={() => handleSelectFood(food)}
            >
              <CardContent className="p-0 flex items-stretch">
                <div className={cn(
                  "w-1.5 transition-all group-hover:w-3",
                  score > 70 ? "bg-green-500" : score > 40 ? "bg-yellow-500" : "bg-red-500"
                )} />
                <div className="p-4 flex-1 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <h3 className="text-white font-bold truncate text-lg group-hover:text-cyan-400 transition-colors">
                      {food.description}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] border-slate-800 bg-slate-950/50 text-slate-400">
                        {Math.round(getNutrientValue(food.foodNutrients, "Energy"))} kcal
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-slate-800 bg-slate-950/50 text-blue-400">
                        {getNutrientValue(food.foodNutrients, "Protein").toFixed(1)}g Protein
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {hasSearched && results.length === 0 && !loading && (
          <div className="text-center py-12 space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 inline-block">
              <AlertCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl">No Results Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                Please use English terms for better results.
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-3xl max-h-[90vh] flex flex-col rounded-3xl">
          {selectedFood && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Nutrition Analysis</span>
                </div>
                <DialogTitle className="text-2xl font-bold">{selectedFood.description}</DialogTitle>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs italic">
                  <Languages className="h-3 w-3" />
                  <span>{translating ? "Translating..." : `Bahasa Indonesia: ${translatedName}`}</span>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-hidden py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                      <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Portion (Grams)</label>
                      <Input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-slate-950 border-slate-800 text-white text-center text-xl font-bold h-12"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Calories</p>
                        <p className="text-2xl font-black text-white">
                          {Math.round(getNutrientValue(selectedFood.foodNutrients, "Energy") * (amount / 100))}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Protein</p>
                        <p className="text-2xl font-black text-blue-400">
                          {(getNutrientValue(selectedFood.foodNutrients, "Protein") * (amount / 100)).toFixed(1)}g
                        </p>
                      </div>
                    </div>

                    <HealthAnalyzer food={selectedFood} />
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <ListFilter className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Nutrient Details</span>
                    </div>
                    <ScrollArea className="flex-1 bg-slate-900/30 rounded-2xl border border-slate-800 p-4">
                      <div className="space-y-3">
                        {selectedFood.foodNutrients
                          .filter(n => n.value > 0)
                          .map((nutrient, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                              <span className="text-xs text-slate-400">{nutrient.nutrientName}</span>
                              <span className="text-xs font-bold text-white">
                                {(nutrient.value * (amount / 100)).toFixed(2)} {nutrient.unitName}
                              </span>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  onClick={() => handleAdd(selectedFood, amount)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 h-14 text-lg font-bold rounded-2xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add to Log
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodSearch;