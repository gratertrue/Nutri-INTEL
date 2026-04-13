import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, ChevronRight, BookOpen } from 'lucide-react';

const GrowthImpactInfo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 p-0 h-auto flex items-center gap-1">
          <Info className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase">Lihat Dampak & Riset</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            Analisis Riset Pertumbuhan
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Kekurangan Karbohidrat</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex gap-2">
                <ChevronRight className="h-3 w-3 text-cyan-500 shrink-0 mt-0.5" />
                <span><span className="text-white font-medium">Glukoneogenesis:</span> Tubuh terpaksa memecah protein otot untuk energi, menghambat anabolisme (pembentukan jaringan).</span>
              </li>
              <li className="flex gap-2">
                <ChevronRight className="h-3 w-3 text-cyan-500 shrink-0 mt-0.5" />
                <span><span className="text-white font-medium">Fungsi Kognitif:</span> Glukosa adalah bahan bakar utama otak; asupan rendah dikaitkan dengan penurunan fokus dan performa belajar.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Kekurangan Protein</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex gap-2">
                <ChevronRight className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                <span><span className="text-white font-medium">Hormon Pertumbuhan:</span> Riset menunjukkan asupan asam amino esensial yang rendah menghambat sekresi IGF-1 (Insulin-like Growth Factor 1).</span>
              </li>
              <li className="flex gap-2">
                <ChevronRight className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                <span><span className="text-white font-medium">Struktur Tulang:</span> Protein membentuk 50% volume tulang; defisiensi mengganggu matriks kolagen tulang.</span>
              </li>
            </ul>
          </section>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400">
              <BookOpen className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase">Kesimpulan Riset</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              "Keseimbangan makronutrien bukan hanya soal energi, tapi menyediakan sinyal hormonal dan bahan baku struktural yang diperlukan untuk mencapai potensi genetik tinggi badan dan perkembangan organ."
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GrowthImpactInfo;