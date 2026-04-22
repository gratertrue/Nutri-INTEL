import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchFoods, FoodItem, getNutrientValue, calculateSmartScore, translateText } from '@/lib/usda-api';
import { searchOFFFoods } from '@/lib/off-api';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Search, Loader2, ChevronRight, Globe, AlertCircle, X, ListFilter, Plus, Languages, Zap, Database, ArrowRight } from 'lucide-react';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import HealthAnalyzer from './HealthAnalyzer';
import { cn } from '@/lib/utils';

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'usda' | 'off'>('usda');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [translatedName, setTranslatedName] = useState('');
  const [translating, setTranslating] = useState(false);
  const [amount, setAmount] = useState(100);
  
  const { addLog } = useNutritionStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (searchQuery: string, currentSource: 'usda' | 'off') => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let data: FoodItem[] = [];
      if (currentSource === 'usda') {
        data = await searchFoods(trimmedQuery, 15);
      } else {
        data = await searchOFFFoods(trimmedQuery);
      }
      setResults(data);
    } catch (err: any) {
      showError(err.message || "Gagal mencari makanan");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search for typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && !loading) performSearch(query, source);
    }, 800);
    return () => clearTimeout(timer);
  }, [query, source, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(query, source);
      // Blur input on mobile to hide keyboard after search
      if (window.innerWidth < 768) {
        inputRef.current?.blur();
      }
    }
  };

  const handleSelectFood = async (food: FoodItem) => {
    setSelectedFood(food);
    setTranslatedName('');
    setTranslating(true);
    
    try {
      if (food.dataType !== 'Branded (OFF)') {
        const idName = await translateText(food.description, 'en|id');
        setTranslatedName(idName);
      } else {
        setTranslatedName(food.description);
      }
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
      <div className="space-y-3">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </div>
          <Input 
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={source === 'usda' ? "Cari bahan mentah..." : "Cari produk kemasan..."}
            className="pl-12 pr-24 bg-slate-900/80 border-slate-800 text-white h-14 text-base md:text-lg rounded-2xl focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-2xl"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button 
                onClick={() => { setQuery(''); setResults([]); }}
                className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <Button 
              size="sm" 
              onClick={() => performSearch(query, source)}
              className="bg-cyan-600 hover:bg-cyan-700 h-10 w-10 p-0 rounded-xl md:w-auto md:px-4"
            >
              <ArrowRight className="h-5 w-5 md:hidden" />
              <span className="hidden md:inline">Cari</span>
            </Button>
          </div>
        </div>

        <Tabs value={source} onValueChange={(val: any) => setSource(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800 h-12 p-1 rounded-xl">
            <TabsTrigger value="usda" className="rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">
              <Database className="h-3.5 w-3.5 mr-1 md:mr-2" />
              USDA (Mentah)
            </TabsTrigger>
            <TabsTrigger value="off" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">
              <Globe className="h-3.5 w-3.5 mr-1 md:mr-2" />
              OFF (Kemasan)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-3">
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
                  "w-1.5 transition-all group-hover:w-3",
                  score > 70 ? "bg-green-500" : score > 40 ? "bg-yellow-500" : "bg-red-500"
                )} />
                <div className="p-4 flex-1 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <h3 className="text-white font-bold truncate text-sm md:text-lg group-hover:text-cyan-400 transition-colors">
                      {food.description}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-[9px] md:text-[10px] border-slate-800 bg-slate-950/50 text-slate-400">
                        {Math.round(getNutrientValue(food.foodNutrients, "Energy"))} kcal
                      </Badge>
                      <Badge variant="outline" className="text-[9px] md:text-[10px] border-slate-800 bg-slate-950/50 text-blue-400">
                        {getNutrientValue(food.foodNutrients, "Protein").toFixed(1)}g Protein
                      </Badge>
                      <Badge className={cn(
                        "text-[8px] border-none",
                        food.dataType === 'Branded (OFF)' ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"
                      )}>
                        {food.dataType === 'Branded (OFF)' ? 'OFF' : 'USDA'}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-cyan-400 transition-colors shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <AlertCircle className="h-8 w-8 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg">Makanan tidak ditemukan</p>
            <p className="text-xs text-slate-600 mt-1 px-4">Coba gunakan kata kunci lain atau ganti sumber data.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white w-[95vw] max-w-3xl max-h-[90vh] flex flex-col rounded-3xl p-4 md:p-6">
          {selectedFood && (
            <>
              <DialogHeader className="text-left">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Analisis Nutrisi</span>
                </div>
                <DialogTitle className="text-xl md:text-2xl font-bold line-clamp-2">{selectedFood.description}</DialogTitle>
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] md:text-xs italic">
                  <Languages className="h-3 w-3" />
                  <span>{translating ? "Menerjemahkan..." : `Nama Lokal: ${translatedName}`}</span>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4 md:space-y-6">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                      <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Porsi (Gram)</label>
                      <Input 
                        type="number" 
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-slate-950 border-slate-800 text-white text-center text-xl font-bold h-12"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 md:p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Kalori</p>
                        <p className="text-xl md:text-2xl font-black text-white">
                          {Math.round(getNutrientValue(selectedFood.foodNutrients, "Energy") * (amount / 100))}
                        </p>
                      </div>
                      <div className="p-3 md:p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Protein</p>
                        <p className="text-xl md:text-2xl font-black text-blue-400">
                          {(getNutrientValue(selectedFood.foodNutrients, "Protein") * (amount / 100)).toFixed(1)}g
                        </p>
                      </div>
                    </div>

                    <HealthAnalyzer food={selectedFood} />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <ListFilter className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Rincian Nutrisi</span>
                    </div>
                    <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-4 max-h-[200px] md:max-h-none overflow-y-auto no-scrollbar">
                      <div className="space-y-3">
                        {selectedFood.foodNutrients
                          .filter(n => n.value > 0)
                          .map((nutrient, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                              <span className="text-[10px] md:text-xs text-slate-400">{nutrient.nutrientName}</span>
                              <span className="text-[10px] md:text-xs font-bold text-white">
                                {(nutrient.value * (amount / 100)).toFixed(2)} {nutrient.unitName}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  onClick={() => handleAdd(selectedFood, amount)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 h-14 text-lg font-bold rounded-2xl active:scale-[0.97] transition-transform"
                >
                  <Plus className="h-5 w-5 mr-2" />
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