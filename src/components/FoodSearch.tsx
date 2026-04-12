/* ############################################################
   # COMPONENT: FOOD SEARCH
   # This component handles searching the USDA database.
   ############################################################ */

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { searchFoods } from '@/lib/usda-api';

interface FoodSearchProps {
  onAdd: (name: string, cals: number) => void;
}

const FoodSearch = ({ onAdd }: FoodSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    const data = await searchFoods(query);
    setResults(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input 
          className="input-field" 
          placeholder="Search 300,000+ foods..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch} className="bg-cyan-600 p-3 rounded-xl"><Search /></button>
      </div>

      <div className="space-y-2">
        {results.map((f, i) => (
          <div key={i} className="glass-card !p-4 flex justify-between items-center !mb-2">
            <div>
              <p className="font-bold text-sm">{f.description}</p>
              <p className="text-xs text-slate-500">Click to add to log</p>
            </div>
            <button 
              onClick={() => onAdd(f.description, 100)} // Simplified calorie addition
              className="text-cyan-500 p-2 hover:bg-cyan-500/10 rounded-full"
            >
              <Plus size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodSearch;