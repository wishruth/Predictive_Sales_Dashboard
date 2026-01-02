import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { DollarSign, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react'; 
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

export default function App() {
  const [stats, setStats] = useState({ total_revenue: 0, total_orders: 0, avg_order_value: 0 });
  const [trends, setTrends] = useState([]);
  
  useEffect(() => {
    // 1. Fetch Summary Stats
    axios.get('http://127.0.0.1:8000/api/v1/analytics/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats fetch error:", err)); 
    
    // 2. Fetch Time-Series Trends
    axios.get('http://127.0.0.1:8000/api/v1/analytics/trends')
      .then(res => setTrends(res.data))
      .catch(err => console.error("Trends fetch error:", err)); 
    
    // 3. Fetch Forecasted Trends  
    axios.get('http://127.0.0.1:8000/api/v1/analytics/forecast')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setTrends(prev => {
            if (prev.length === 0) return res.data; // Safety for empty state
            
            // Create a fresh copy to avoid mutating state directly
            const newTrends = [...prev];
            const lastHistoryPoint = { ...newTrends[newTrends.length - 1] };
          
            // Stitch the lines together
            lastHistoryPoint.forecast = lastHistoryPoint.amount;
            newTrends[newTrends.length - 1] = lastHistoryPoint;

            return [...newTrends, ...res.data];
          });
        }
      })
      .catch(err => console.error("Forecast fetch error:", err));
  }, []); // Added missing dependency array and closing brace

  const cards = [
    { name: 'Total Revenue', value: `$${(stats.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { name: 'Total Orders', value: stats.total_orders || 0, icon: ShoppingCart, color: 'text-blue-600' },
    { name: 'Avg Order Value', value: `$${stats.avg_order_value || 0}`, icon: TrendingUp, color: 'text-purple-600' },
    { name: 'Growth Metric', value: '+12.5%', icon: BarChart3, color: 'text-orange-600' },
  ]; 

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Executive Overview</h1>
          <p className="text-slate-500">Real-time business analytics from Supabase</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => (
            <div key={card.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-slate-50 ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{card.name}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue Trend</h2>
  
          <div className="h-[400px] w-full min-h-[400px]">
            {trends && trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 10}} 
                    interval="preserveStartEnd"
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    domain={[0, (dataMax) => Math.round(dataMax * 1.15)]} 
                  />
                  <Tooltip 
                    shared={true}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
  
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    connectNulls={true}
                  />
  
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    fill="#f1f5f9"
                    fillOpacity={0.4}
                    connectNulls={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 animate-pulse">Gathering real-time analytics...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
