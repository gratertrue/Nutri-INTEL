"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Share2, MessageCircle, Search, Sparkles } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MOCK_COMMUNITY_RECIPES = [
  {
    id: '1',
    author: 'Budi Sehat',
    name: 'Smoothie Bowl Naga Biru',
    calories: 320,
    protein: 12,
    likes: 124,
    comments: 18,
    tags: ['Sarapan', 'Vegan']
  },
  {
    id: '2',
    author: 'Siti Fit',
    name: 'Ayam Panggang Lemon Herbal',
    calories: 450,
    protein: 42,
    likes: 89,
    comments: 5,
    tags: ['Tinggi Protein', 'Makan Malam']
  },
  {
    id: '3',
    author: 'Andi Gym',
    name: 'Oatmeal Protein Cokelat',
    calories: 380,
    protein: 30,
    likes: 256,
    comments: 42,
    tags: ['Bulking', 'Cepat']
  }
];

const Community = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            Komunitas Nutri-INTEL
          </h2>
          <p className="text-xs text-slate-500 mt-1">Temukan dan bagikan inspirasi makanan sehat dari seluruh dunia.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Cari resep komunitas..." className="pl-9 bg-slate-900/50 border-slate-800 text-xs h-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_COMMUNITY_RECIPES.map((recipe) => (
          <Card key={recipe.id} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-all group overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
              <Sparkles className="h-8 w-8 text-slate-700 group-hover:text-cyan-500/20 transition-colors" />
              <div className="absolute top-2 right-2 flex gap-1">
                {recipe.tags.map(tag => (
                  <Badge key={tag} className="bg-slate-950/80 text-[8px] border-slate-800">{tag}</Badge>
                ))}
              </div>
            </div>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[8px] font-bold text-white">
                  {recipe.author[0]}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{recipe.author}</span>
              </div>
              <CardTitle className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                {recipe.name}
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
                    <span className="text-[10px]">{recipe.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-[10px]">{recipe.comments}</span>
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

      <Card className="bg-cyan-500/5 border-cyan-500/20 border-dashed border-2">
        <CardContent className="p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
            <Share2 className="h-6 w-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Bagikan Resep Anda!</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Resep yang Anda buat di menu "Pembuat Resep" akan muncul di sini setelah Anda menghubungkan database.
          </p>
          <Button className="bg-cyan-600 hover:bg-cyan-700 font-bold rounded-xl">
            Hubungkan Supabase Sekarang
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Community;