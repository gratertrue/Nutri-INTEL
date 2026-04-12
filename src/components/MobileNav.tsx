import React from 'react';
import { LayoutDashboard, Search, Utensils, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav = ({ activeTab, setActiveTab }: MobileNavProps) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'recipes', label: 'Recipes', icon: Utensils },
    { id: 'planner', label: 'Plan', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 px-6 py-3 z-50 flex justify-between items-center pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === item.id ? "text-cyan-400" : "text-slate-500"
          )}
        >
          <item.icon className="h-6 w-6" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MobileNav;