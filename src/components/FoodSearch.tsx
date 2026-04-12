import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { searchFoods, FoodItem, getNutrientValue, calculateSmartScore } from '@/lib/usda-api';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Search, Loader2, ChevronRight, Globe, AlertCircle, X, ListFilter } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import Fuse from 'fuse.js';

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(100);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const { addLog } = useNutritionStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fungsi untuk menyoroti teks yang cocok
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-cyan-400 font-black underline decoration-cyan-500/30">{part}</span>
          ) : part
        )}
      </span>
    );
  };

  // Fungsi pencarian utama
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const data = await searchFoods(searchQuery, 10);
      
      // Implementasi Fuzzy Search pada hasil API untuk pengurutan yang lebih cerdas
      const fuse = new Fuse(data, {
        keys: ['description', 'descriptionEn'],
        threshold: 0.4,
      });
      const fuzzyResults = fuse.search(searchQuery).map(r => r.item);
      
      // Jika fuzzy search tidak memberikan hasil (karena query baru), gunakan data asli
      setResults(fuzzyResults.length > 0 ? fuzzyResults : data);
      setActiveIndex(-1);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showError("Gagal mencari makanan");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debouncing logic (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      setSelectedFood(results[activeIndex]);
    }
  };

  const handleAdd = (food: FoodItem, logAmount: number) => {
    addLog(food, logAmount);
    showSuccess(`Ditambahkan: ${food.description}`);
    setSelectedFood(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Search Bar Pintar */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </div>
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Cari makanan (misal: Nasi Goreng, Apel)..."
          className="pl-12 pr-12 bg-slate-900/80 border-slate-800 text-white h-14 text-lg rounded-2xl focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-2xl"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results List dengan Navigasi Keyboard */}
      <div className="grid grid-cols-1 gap-3">
        {results.map((food, index) => {
          const score = calculateSmartScore(food.foodNutrients);
          const isActive = index === activeIndex;
          
          return (
            <Card 
              key={food.fdcId} 
              className={cn(
                "bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all group cursor-pointer overflow-hidden",
                isActive && "border-cyan-500 ring-1 ring-cyan-500/50 bg-slate-800/80 translate-x-1"
              )}
              onClick={() => setSelectedFood(food)}
            >
              <CardContent className="p-0 flex items-stretch">
                <div className={cn(
                  "w-1.5 transition-all",
                  score > 70 ? "bg-green-500" : score > 40 ? "bg-yellow-500" : "bg-red-500",
                  isActive && "w-3"
                )} />
                <div className="p-4 flex-1 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className={cn("h-3.5 w-3.5", isActive ? "text-cyan-400" : "text-slate-500")} />
                      <h3 className="text-white font-bold truncate text-lg">
                        {highlightText(food.description, query)}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 italic truncate mb-2">
                      Original: {food.descriptionEn}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] border-slate-800 bg-slate-950/50 text-slate-400">
                        {Math.round(getNutrientValue(food.foodNutrients, "Energy"))} kcal
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-slate-800 bg-slate-950/50 text-blue-400">
                        {getNutrientValue(food.foodNutrients, "Protein").toFixed(1)}g Protein
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest animate-pulse">Enter to select</span>}
                    <ChevronRight className={cn("h-5 w-5 transition-colors", isActive ? "text-cyan-400" : "text-slate-700")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertCircle className="h-8 w-8 text-slate-700" />
            </div>
            <p className="text-slate-400 font-bold text-lg">Makanan tidak ditemukan</p>
            <p className="text-sm text-slate-600 mt-1">Coba kata kunci lain atau periksa ejaan Anda.</p>
          </div>
        )}

        {!query && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-700" />
            </div>
            <p className="text-slate-500 font-medium">Mulai mengetik untuk mencari nutrisi makanan</p>
            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Pencarian Real-time & Cerdas</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-3xl max-h-[90vh] flex flex-col rounded-3xl">
          {selectedFood && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Globe className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Detail Nutrisi Lengkap</span>
                </div>
                <DialogTitle className="text-2xl font-bold">{selectedFood.description}</DialogTitle>
                <p className="text-slate-500 text-xs italic">Asli: {selectedFood.descriptionEn}</p>
              </DialogHeader>

              <div className="flex-1 overflow-hidden py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
                      <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Porsi (Gram)</label>
                      <Input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-slate-950 border-slate-800 text-white text-center text-xl font-bold h-12"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center shadow-lg">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Kalori</p>
                        <p className="text-2xl font-black text-white">
                          {Math.round(getNutrientValue(selectedFood.foodNutrients, "Energy") * (amount / 100))}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center shadow-lg">
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
                      <span className="text-xs font-bold text-slate-400 uppercase">Daftar Nutrisi Lengkap</span>
                    </div>
                    <ScrollArea className="flex-1 bg-slate-900/30 rounded-2xl border border-slate-800 p-4 shadow-inner">
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
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-14 text-lg font-bold rounded-2xl shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Tambah ke Log Harian
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