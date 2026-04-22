"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Camera, Zap } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inisialisasi scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear().then(() => {
          onScan(decodedText);
        }).catch(err => {
          console.error("Failed to clear scanner", err);
          onScan(decodedText);
        });
      },
      (errorMessage) => {
        // Abaikan error scanning rutin
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Cleanup error", err));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">Pemindai Barcode</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Arahkan ke kode batang produk</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Card className="overflow-hidden bg-slate-900 border-slate-800 relative">
          <div id="reader" className="w-full"></div>
          <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/20 m-8 rounded-xl">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
          </div>
        </Card>

        <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-start gap-3">
          <Zap className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Sistem akan mendeteksi produk secara otomatis. Pastikan pencahayaan cukup dan barcode terlihat jelas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;