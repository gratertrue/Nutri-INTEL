"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Zap, 
  Target, 
  Moon, 
  ChevronRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    title: "Selamat Datang di Nutri-INTEL",
    description: "Asisten nutrisi cerdas Anda untuk mencapai potensi kesehatan maksimal.",
    icon: Sparkles,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10"
  },
  {
    title: "Cari & Catat Makanan",
    description: "Cari ribuan database makanan (English/Indonesia) dan catat asupan Anda dengan satu ketukan.",
    icon: Search,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10"
  },
  {
    title: "Analisis Nutrisi Cerdas",
    description: "Dapatkan skor kesehatan instan dan analisis dampak nutrisi terhadap pertumbuhan & energi Anda.",
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-400/10"
  },
  {
    title: "Pantau Target Harian",
    description: "Lihat progres kalori, protein, dan hidrasi secara real-time di dasbor Anda.",
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-400/10"
  },
  {
    title: "Lacak Gaya Hidup",
    description: "Catat waktu tidur dan aktivitas harian untuk mendapatkan analisis tren kesehatan 3 hari.",
    icon: Moon,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10"
  }
];

const OnboardingGuide = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('nutri_intel_onboarding_seen');
    if (!hasSeenGuide) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem('nutri_intel_onboarding_seen', 'true');
    setOpen(false);
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-md rounded-3xl overflow-hidden p-0">
        <div className="relative h-32 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 flex items-center justify-center border-b border-slate-800">
          <div className={cn("p-4 rounded-2xl", steps[currentStep].bg)}>
            <StepIcon className={cn("h-10 w-10", steps[currentStep].color)} />
          </div>
          <div className="absolute top-4 right-4 flex gap-1">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  idx === currentStep ? "w-4 bg-cyan-500" : "w-1 bg-slate-700"
                )} 
              />
            ))}
          </div>
        </div>

        <div className="p-8 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <h3 className="text-2xl font-bold text-white">{steps[currentStep].title}</h3>
              <p className="text-slate-400 leading-relaxed">{steps[currentStep].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button 
            onClick={handleNext}
            className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 font-bold rounded-xl group"
          >
            {currentStep === steps.length - 1 ? (
              <>Mulai Sekarang <CheckCircle2 className="ml-2 h-4 w-4" /></>
            ) : (
              <>Lanjut <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { cn } from '@/lib/utils';
export default OnboardingGuide;