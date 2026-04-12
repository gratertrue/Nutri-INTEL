import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchFoods, FoodItem, getNutrientValue, calculateSmartScore } from '@/lib/usda-api';
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Search, Plus, Loader2, ChevronRight, Key, Globe, AlertCircle, X } from 'lucide-react';
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

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('usda_api_key') || '');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(100);
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  
  const { addLog } = useNutritionStore();

  const saveApiKey = () => {
    localStorage.setItem('usda_api_key', apiKey);
    setShowKeyInput(false);
    showSuccess("API Key disimpan secara lokal");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    if (!apiKey) {
      setShowKeyInput(true);
      showError("Masukkan API Key USDA terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const data = await searchFoods(query, apiKey, 12);
      setResults(data);
      if (data.length === 0) showError("Tidak ada hasil ditemukan");
    } catch (err: any) {
      showError(err.message || "Gagal mencari makanan");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (food: FoodItem, logAmount: number) => {
    addLog(food, logAmount);
    showSuccess(`Ditambahkan: ${food.description}`);
    setSelectedFood(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* API Key Management */}
      {showKeyInput ? (
        <Card className="bg-cyan-500/5 border-cyan-500/20 border-dashed">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400 uppercase">USDA API Key Required</span>
              </div>
              <Input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan API Key Anda..."
                className="bg-slate-900 border-slate-800 text-white"
              />
            </div>
            <Button onClick={saveApiKey} className="bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto mt-6 sm:mt-0">
              Simpan Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowKeyInput(true)}
            className="text-[10px] text-slate-500 hover:text-cyan-400 uppercase font-bold"
          >
            <Key className="h-3 w-3 mr-1" /> Ganti API Key
          </Button>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari makanan (Contoh: Nasi Goreng, Apel, Susu)..."
            className="pl-10 bg-slate-900/50 border-slate-800 text-white h-12 text-lg"
          />
          {query && (
            <button 
              type="button"
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 h-12 px-8">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Cari"}
        </Button>
      </form>

      {/* Results List */}
      <div className="grid grid-cols-1 gap-3">
        {results.map((food) => {
          const score = calculateSmartScore(food.foodNutrients);
          return (
            <Card 
              key={food.fdcId} 
              className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all group cursor-pointer overflow-hidden"
              onClick={() => setSelectedFood(food)}
            >
              <CardContent className="p-0 flex items-stretch">
                <div className={cn(
                  "w-1.5",
                  score > 70 ? "bg-green-500" : score > 40 ? "bg-yellow-500" : "bg-red-500"
                )} />
                <div className="p-4 flex-1 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-3 w-3 text-cyan-500" />
                      <h3 className="text-white font-bold truncate text-lg">
                        {food.description}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 italic truncate mb-2">
                      Original: {food.descriptionEn}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-400">
                        {Math.round(getNutrientValue(food.foodNutrients, "Energy"))} kcal
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-slate-800 text-blue-400">
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

        {!loading && results.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-700" />
            </div>
            <p className="text-slate-500 font-medium">Masukkan kata kunci dalam Bahasa Indonesia</p>
            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Powered by USDA & MyMemory</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl">
          {selectedFood && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Globe className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Detail Nutrisi Terjemahan</span>
                </div>
                <DialogTitle className="text-2xl font-bold">{selectedFood.description}</DialogTitle>
                <p className="text-slate-500 text-xs italic">Asli: {selectedFood.descriptionEn}</p>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Kalori</p>
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

                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Porsi (Gram)</label>
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 text-white text-center text-xl font-bold"
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400">
                      Data gizi berasal dari database USDA. Terjemahan dilakukan secara otomatis dan mungkin tidak 100% akurat untuk istilah teknis.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  onClick={() => handleAdd(selectedFood, amount)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-lg font-bold"
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