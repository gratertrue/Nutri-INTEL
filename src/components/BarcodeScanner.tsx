"use client";

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Camera, Zap } from 'lucide-react';

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
  const elementId = "reader";

  useEffect(() => {
    if (typeof window.Html5Qrcode === 'undefined') {
      console.error("Html5Qrcode library not loaded");
      return;
    }

    // Menggunakan Html5Qrcode (mesin) bukan Html5QrcodeScanner (UI) untuk kontrol lebih baik
    const html5QrCode = new window.Html5Qrcode(elementId);
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 150 } };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText: string) => {
        // Berhenti segera setelah scan berhasil
        html5QrCode.stop().then(() => {
          onScan(decodedText);
        }).catch(() => {
          onScan(decodedText);
        });
      },
      undefined
    ).catch((err: any) => {
      console.error("Unable to start scanning", err);
    });

    return () => {
      // Cleanup total saat komponen unmount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err: any) => console.error("Stop error", err));
      }
    };
  }, [onScan]);

  const handleManualClose = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">Barcode Scanner</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Point at product barcode</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleManualClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Card className="overflow-hidden bg-slate-900 border-slate-800 relative aspect-square flex items-center justify-center">
          <div id={elementId} className="w-full h-full"></div>
          <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/20 m-12 rounded-xl">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-400/30 animate-pulse" />
          </div>
        </Card>

        <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-start gap-3">
          <Zap className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Ensure good lighting. The scanner will automatically close after a successful scan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;