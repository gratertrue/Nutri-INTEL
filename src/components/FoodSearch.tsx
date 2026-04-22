import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchFoods, FoodItem, getNutrientValue, calculateSmartScore, translateText } from '@/lib/usda-api';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Search, Loader2, ChevronRight, X, ListFilter, Plus, Languages, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/scroll-area";
import HealthAnalyzer from './HealthAnalyzer';
import { cn } from '@/lib/utils';

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [translatedName, setTranslatedName] = useState('');
  const [translating, setTranslating] = useState(false);
  const [amount, setAmount] = useState(100);
  
  const { addLog } = useNutritionStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const data = await searchFoods(trimmedQuery, 15);
      setResults(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showError(err.message || "Gagal mencari makanan");
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) performSearch(query);
    }, 600);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(query);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSelectFood = async (food: FoodItem) => {
    setSelectedFood(food);
    setTranslatedName('');
    setTranslating(true);
    
    try {
      const idName = await translateText(food.description, 'en|id');
      setTranslatedName(idName);
    } catch (e) {
      setTranslatedName(food.description);
    } finally {
      setTranslating(false);
    }
  };

  const handleAdd = (food: FoodItem, logAmount: number) => {
    addLog(food, logAmount);
    showSuccess(`Ditambahkan ke log harian!`);
    setSelectedFood(null);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </div>
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari (Gunakan Bahasa Inggris, misal: Rice)..."
            enterKeyHint="search"
            autoComplete="off"
            className="pl-11 pr-10 bg-slate-900/80 border-slate-800 text-white h-12 text-sm rounded-xl focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button 
          onClick={() => performSearch(query)} 
          disabled={loading || !query.trim()}
          className="h-12 px-6 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold"
        >
          Cari
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {results.map((food) => {
          const score = calculateSmartScore(food.foodNutrients);
          return (
            <Card 
              key={food.fdcId} 
              className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden group active:scale-[0.98]"
              onClick={() => handleSelectFood(food)}
            >
              <CardContent className="p-0 flex items-stretch">
                <div className={cn(
                  "w-1",
                  score > 70 ? "bg-green-500" : score > 40 ? "bg-yellow-500" : "bg-red-500"
                )} />
                <div className="p-3 flex-1 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-white font-bold truncate text-sm group-hover:text-cyan-400 transition-colors">
                      {food.description}
                    </h3>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[8px] py-0 h-4 border-slate-800 bg-slate-950/50 text-slate-400">
                        {Math.round(getNutrientValue(food.foodNutrients, "Energy"))} kcal
                      </Badge>
                      <Badge variant="outline" className="text-[8px] py-0 h-4 border-slate-800 bg-slate-950/50 text-blue-400">
                        {getNutrientValue(food.foodNutrients, "Protein").toFixed(1)}g P
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <p className="text-slate-500 font-bold text-sm">Tidak ada hasil untuk "{query}"</p>
            <p className="text-[10px] text-slate-600 mt-1">Gunakan kata kunci Bahasa Inggris (misal: Chicken, Egg, Rice).</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-lg w-[95vw] max-h-[90vh] flex flex-col rounded-3xl p-4">
          {selectedFood && (
            <>
              <DialogHeader className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Zap className="h-3 w-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Analisis Nutrisi</span>
                </div>
                <DialogTitle className="text-lg font-bold leading-tight">{selectedFood.description}</DialogTitle>
                <div className="flex items-center gap-1 text-slate-500 text-[10px] italic">
                  <Languages className="h-2.5 w-2.5" />
                  <span>{translating ? "Menerjemahkan..." : `Nama Indonesia: ${translatedName}`}</span>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 my-4 pr-2">
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <label className="text-[9px] text-slate-500 uppercase font-bold mb-1.5 block">Porsi (Gram)</label>
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 text-white text-center text-lg font-bold h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Kalori</p>
                      <p className="text-xl font-black text-white">
                        {Math.round(getNutrientValue(selectedFood.foodNutrients, "Energy") * (amount / 100))}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Protein</p>
                      <p className="text-xl font-black text-blue-400">
                        {(getNutrientValue(selectedFood.foodNutrients, "Protein") * (amount / 100)).toFixed(1)}g
                      </p>
                    </div>
                  </div>

                  <HealthAnalyzer food={selectedFood} />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ListFilter className="h-3 w-3 text-cyan-400" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Rincian Nutrisi</span>
                    </div>
                    <div className="bg-slate-900/30 rounded-xl border border-slate-800 p-3 space-y-2">
                      {selectedFood.foodNutrients
                        .filter(n => n.value > 0)
                        .slice(0, 10)
                        .map((nutrient, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-800/50 last:border-0">
                            <span className="text-[10px] text-slate-400">{nutrient.nutrientName}</span>
                            <span className="text-[10px] font-bold text-white">
                              {(nutrient.value * (amount / 100)).toFixed(2)} {nutrient.unitName}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button 
                  onClick={() => handleAdd(selectedFood, amount)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-sm font-bold rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah ke Log
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