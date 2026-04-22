"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Camera, Zap, ZapOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    Html5Qrcode: any;
  }
}

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<any>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const elementId = "reader-container";

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        // Memberikan waktu bagi hardware kamera untuk benar-benar rilis
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn("Scanner stop warning:", e);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initScanner = async () => {
      if (typeof window.Html5Qrcode === 'undefined') return;

      const html5QrCode = new window.Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      try {
        const config = { 
          fps: 15, 
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            // Haptic feedback
            if (window.navigator.vibrate) window.navigator.vibrate(100);
            
            stopScanner().then(() => {
              if (isMounted) onScan(decodedText);
            });
          },
          undefined
        );

        if (isMounted) {
          setIsInitializing(false);
          // Cek dukungan senter
          const track = html5QrCode.getRunningTrack();
          const capabilities = track.getCapabilities();
          setHasTorch(!!capabilities.torch);
        }
      } catch (err) {
        console.error("Scanner init error:", err);
        if (isMounted) setIsInitializing(false);
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [onScan]);

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const newState = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: newState }]
      });
      setIsTorchOn(newState);
    } catch (e) {
      console.error("Torch toggle error:", e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-md h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Smart Scanner</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Nutri-INTEL Engine v2</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="relative flex-1 flex items-center justify-center">
          <Card className="w-full aspect-square overflow-hidden bg-slate-900 border-slate-800 relative shadow-2xl rounded-3xl">
            <div id={elementId} className="w-full h-full object-cover"></div>
            
            {/* Overlay UI */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning Frame */}
              <div className="absolute inset-0 m-12 border-2 border-cyan-500/20 rounded-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />
                
                {/* Laser Line */}
                <motion.div 
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee]"
                />
              </div>
            </div>

            <AnimatePresence>
              {isInitializing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                >
                  <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                  <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Menyiapkan Kamera...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          {hasTorch && (
            <Button 
              onClick={toggleTorch}
              variant="outline"
              className={cn(
                "h-14 w-14 rounded-2xl border-slate-800 transition-all",
                isTorchOn ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" : "bg-slate-900 text-slate-400"
              )}
            >
              {isTorchOn ? <ZapOff className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
            </Button>
          )}
        </div>

        <div className="mt-auto pb-8">
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-start gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Posisikan barcode di dalam kotak. Pastikan pencahayaan cukup untuk hasil yang maksimal.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BarcodeScanner;