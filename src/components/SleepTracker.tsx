import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { Moon, Play, Square, RotateCcw, Clock, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const SleepTracker = () => {
  const { wearableData, toggleSleep, resetSleep } = useNutritionStore();
  const [elapsed, setElapsed] = useState(0);

  // Fungsi pembantu untuk memformat milidetik ke Jam & Menit
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (wearableData.isSleeping && wearableData.sleepStartTime) {
      const update = () => {
        setElapsed(Date.now() - wearableData.sleepStartTime!);
      };
      
      interval = setInterval(update, 1000); // Update setiap detik
      update();
    } else {
      setElapsed(0);
    }

    return () => clearInterval(interval);
  }, [wearableData.isSleeping, wearableData.sleepStartTime]);

  const current = formatDuration(elapsed);
  const history = wearableData.sleepHistory || [];

  return (
    <Card className={cn(
      "bg-slate-900/50 border-slate-800 backdrop-blur-xl transition-all duration-500 overflow-hidden flex flex-col",
      wearableData.isSleeping && "border-purple-500/50 bg-purple-500/10"
    )}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className={cn("h-4 w-4", wearableData.isSleeping ? "text-purple-400 animate-pulse" : "text-slate-400")} />
            Pelacak Tidur
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetSleep}
            className="h-7 w-7 text-slate-500 hover:text-red-400"
            title="Reset Semua Data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-4 flex-1 flex flex-col">
        <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
            {wearableData.isSleeping ? "Waktu Berjalan" : "Sesi Terakhir"}
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-white">
              {wearableData.isSleeping ? current.h : Math.floor(wearableData.sleepHours)}
            </span>
            <span className="text-sm font-bold text-slate-500 mr-1">j</span>
            <span className="text-4xl font-black text-white">
              {wearableData.isSleeping ? current.m : Math.round((wearableData.sleepHours % 1) * 60)}
            </span>
            <span className="text-sm font-bold text-slate-500">m</span>
            {wearableData.isSleeping && (
              <>
                <span className="text-2xl font-bold text-purple-500/50 ml-1">:</span>
                <span className="text-2xl font-bold text-purple-500/50">
                  {current.s.toString().padStart(2, '0')}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={toggleSleep}
            className={cn(
              "flex-1 h-12 font-bold rounded-xl shadow-lg transition-all",
              wearableData.isSleeping 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-purple-600 hover:bg-purple-700 text-white"
            )}
          >
            {wearableData.isSleeping ? (
              <><Square className="h-4 w-4 mr-2 fill-current" /> Berhenti Tidur</>
            ) : (
              <><Play className="h-4 w-4 mr-2 fill-current" /> Mulai Tidur</>
            )}
          </Button>
        </div>

        <div className="space-y-2 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 text-slate-500 px-1">
            <History className="h-3 w-3" />
            <span className="text-[10px] uppercase font-bold">Riwayat Sesi</span>
          </div>
          <ScrollArea className="flex-1 h-[120px] pr-3">
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-[10px] text-slate-600 text-center py-4 italic">Belum ada riwayat sesi</p>
              ) : (
                history.map((session) => {
                  const date = new Date(session.endTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                  const h = Math.floor(session.durationHours);
                  const m = Math.round((session.durationHours % 1) * 60);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800/50">
                      <span className="text-[10px] font-medium text-slate-400">{date}</span>
                      <span className="text-[10px] font-bold text-white">{h}j {m}m</span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepTracker;