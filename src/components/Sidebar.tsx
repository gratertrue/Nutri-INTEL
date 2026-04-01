import React from 'react';
import { LayoutDashboard, Search, Utensils, Calendar, History, User, Trophy, Droplets, Zap, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Food Lookup', icon: Search },
    { id: 'recipes', label: 'Recipe Builder', icon: Utensils },
    { id: 'planner', label: 'Meal Planner', icon: Calendar },
    { id: 'hydration', label: 'Hydration', icon: Droplets },
    { id: 'history', label: 'History', icon: History },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
          <Zap className="text-white h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Nutri-<span className="text-cyan-500">INTEL</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5",
              activeTab === item.id ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-500 mb-1">Current Streak</p>
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500 h-4 w-4" />
            <span className="text-white font-bold">3 Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;