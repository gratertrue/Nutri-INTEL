"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Share2, MessageCircle, Search, Sparkles, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';
import { showError } from '@/utils/toast';

interface CommunityRecipe {
  id: string;
  author_name: string;
  recipe_name: string;
  calories: number;
  protein: number;
  likes: number;
  tags: string[];
}

const Community = () => {
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (err: any) {
      console.error("Error fetching community recipes:", err);
      // Jika tabel belum ada, kita tampilkan pesan edukatif
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter(r => 
    r.recipe_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            Komunitas Nutri-INTEL
          </h2>
          <p className="text-xs text-slate-500 mt-1">Inspirasi sehat dari pengguna lain di seluruh dunia.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Cari resep komunitas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900/50 border-slate-800 text-xs h-9" 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2 text-cyan-500" />
          <p className="text-sm">Memuat resep komunitas...</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800 border-dashed border-2">
          <CardContent className="p-12 text-center space-y-3">
            <Sparkles className="h-10 w-10 text-slate-700 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">Belum Ada Resep Publik</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Jadilah yang pertama membagikan resep sehat Anda ke komunitas!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-all group overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                <Sparkles className="h-8 w-8 text-slate-700 group-hover:text-cyan-500/20 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1">
                  {recipe.tags?.map(tag => (
                    <Badge key={tag} className="bg-slate-950/80 text-[8px] border-slate-800">{tag}</Badge>
                  ))}
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[8px] font-bold text-white">
                    {recipe.author_name?.[0] || 'U'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{recipe.author_name}</span>
                </div>
                <CardTitle className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {recipe.recipe_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex gap-4 text-[10px] text-slate-400">
                  <span>{recipe.calories} kkal</span>
                  <span>{recipe.protein}g Protein</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className="flex gap-3">
                    <button className="flex items-center gap-1 text-slate-500 hover:text-pink-500 transition-colors">
                      <Heart className="h-3.5 w-3.5" />
                      <span className="text-[10px]">{recipe.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="text-[10px]">0</span>
                    </button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;