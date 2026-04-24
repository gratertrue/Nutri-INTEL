import React, { useRef, useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Utensils, 
  Calendar, 
  User, 
  History, 
  Droplets, 
  Trophy,
  ChevronRight,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav = ({ activeTab, setActiveTab }: MobileNavProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const items = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'search', label: 'Cari', icon: Search },
    { id: 'community', label: 'Komunitas', icon: Users },
    { id: 'hydration', label: 'Hidrasi', icon: Droplets },
    { id: 'recipes', label: 'Resep', icon: Utensils },
    { id: 'planner', label: 'Rencana', icon: Calendar },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'achievements', label: 'Prestasi', icon: Trophy },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="relative flex items-center">
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto no-scrollbar px-2 py-1.5 gap-1 items-center w-full"
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[58px] py-1.5 px-0.5 rounded-lg transition-all duration-200",
                activeTab === item.id 
                  ? "bg-cyan-500/10 text-cyan-400" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 mb-0.5",
                activeTab === item.id ? "text-cyan-400" : "text-slate-500"
              )} />
              <span className="text-[8px] font-bold uppercase tracking-tighter whitespace-nowrap">
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="w-1 h-1 bg-cyan-400 rounded-full mt-0.5 shadow-[0_0_5px_#22d3ee]" />
              )}
            </button>
          ))}
        </div>

        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none flex items-center justify-end pr-1">
            <ChevronRight className="h-4 w-4 text-cyan-400 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNav;