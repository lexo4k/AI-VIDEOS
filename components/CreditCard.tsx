import React, { useState } from 'react';
import { Button } from './Button';
import { CreditCard as IconCreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CreditCardProps {
  balance: number;
  onAddCredits: (amount: number) => void;
}

const data = [
  { name: 'Mon', usage: 20 },
  { name: 'Tue', usage: 45 },
  { name: 'Wed', usage: 30 },
  { name: 'Thu', usage: 80 },
  { name: 'Fri', usage: 50 },
  { name: 'Sat', usage: 10 },
  { name: 'Sun', usage: 5 },
];

export const CreditCard: React.FC<CreditCardProps> = ({ balance, onAddCredits }) => {
  const [amount, setAmount] = useState<number>(50);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-xl">
        <div>
          <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
            <IconCreditCard className="w-4 h-4" /> Current Balance
          </h3>
          <div className="text-5xl font-bold text-white mb-1">{balance} <span className="text-emerald-500 text-2xl">credits</span></div>
          <p className="text-slate-500 text-sm">~ {Math.floor(balance / 20)} videos (Standard quality)</p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800">
           <label className="block text-sm font-medium text-slate-300 mb-2">Quick Top-up</label>
           <div className="flex gap-2">
             <input 
               type="number" 
               min="10"
               value={amount}
               onChange={(e) => setAmount(Number(e.target.value))}
               className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 focus:outline-none"
             />
             <Button onClick={() => onAddCredits(amount)} className="whitespace-nowrap">
               <DollarSign className="w-4 h-4" /> Pay ${amount/10}
             </Button>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Usage History
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#4ade80' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="usage" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 4 ? '#4ade80' : '#334155'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};