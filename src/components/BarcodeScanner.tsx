"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Camera, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  // Gunakan ID unik setiap kali mount untuk mencegah konflik DOM
  const [readerId] = useState(`reader-${Math.random().toString(36).substr(2, 9)}`);

  const cleanupScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        // Hapus elemen secara manual dari internal library jika memungkinkan
        await scannerRef.current.clear();
      } catch (e) {
        console.warn("Cleanup warning:", e);
      } finally {
        scannerRef.current = null;
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      if (typeof window.Html5Qrcode === 'undefined') {
        setError("Library scanner belum dimuat. Silakan refresh.");
        return;
      }

      try {
        const html5QrCode = new window.Html5Qrcode(readerId);
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0 
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          async (decodedText: string) => {
            if (!isMounted) return;
            
            // 1. Berikan feedback visual/haptic
            if (window.navigator.vibrate) window.navigator.vibrate(50);
            
            // 2. Matikan kamera SEBELUM mengirim data ke parent
            // Ini adalah kunci agar tidak terjadi tabrakan proses
            await cleanupScanner();
            
            if (isMounted) onScan(decodedText);
          },
          undefined
        );

        if (isMounted) setIsInitializing(false);
      } catch (err: any) {
        console.error("Camera start error:", err);
        if (isMounted) {
          setError("Gagal mengakses kamera. Pastikan izin diberikan.");
          setIsInitializing(false);
        }
      }
    };

    // Beri jeda sedikit agar DOM benar-benar siap
    const timer = setTimeout(startCamera, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      cleanupScanner();
    };
  }, [onScan, readerId]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-md flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-white">Smart Scan</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Card className="relative flex-1 bg-slate-900 border-slate-800 overflow-hidden rounded-3xl shadow-2xl flex items-center justify-center">
          <div id={readerId} className="w-full h-full"></div>
          
          {isInitializing && !error && (
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 text-cyan-500 animate-spin" />
              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Inisialisasi Kamera...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col items-center justify-center text-center gap-4">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <p className="text-sm text-slate-300">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-700">
                Refresh Aplikasi
              </Button>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/10 m-10 rounded-2xl">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />
          </div>
        </Card>

        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-start gap-3">
          <Zap className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Arahkan kamera ke barcode produk. Pastikan cahaya cukup dan barcode terlihat jelas di dalam kotak.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BarcodeScanner;