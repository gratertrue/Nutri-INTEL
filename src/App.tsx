import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { NutritionProvider } from "./hooks/use-nutrition-store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NutritionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" expand={false} richColors />
        <BrowserRouter 
          future={{ 
            v7_startTransition: true, 
            v7_relativeSplatPath: true 
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NutritionProvider>
  </QueryClientProvider>
);

export default App;