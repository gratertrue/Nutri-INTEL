import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNutritionStore } from '@/hooks/use-nutrition-store';
import { getNutrientValue } from '@/lib/usda-api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { History, Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NutritionHistory = () => {
  const { logs } = useNutritionStore();

  // Group logs by day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    return d;
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayLogs = logs.filter(l => {
      const logDate = new Date(l.timestamp);
      logDate.setHours(0,0,0,0);
      return logDate.getTime() === date.getTime();
    });

    const totals = dayLogs.reduce((acc, log) => {
      const factor = log.amount / 100;
      acc.calories += getNutrientValue(log.food.foodNutrients, "Energy") * factor;
      acc.protein += getNutrientValue(log.food.foodNutrients, "Protein") * factor;
      acc.carbs += getNutrientValue(log.food.foodNutrients, "Carbohydrate") * factor;
      acc.fat += getNutrientValue(log.food.foodNutrients, "Total lipid (fat)") * factor;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    };
  });

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "nutrition_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="h-6 w-6 text-cyan-400" />
          Nutrition History
        </h2>
        <Button onClick={exportData} variant="outline" className="border-slate-700 text-slate-400 hover:text-white">
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Calorie Intake (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="calories" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Macro Trends (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="protein" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="carbs" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NutritionHistory;