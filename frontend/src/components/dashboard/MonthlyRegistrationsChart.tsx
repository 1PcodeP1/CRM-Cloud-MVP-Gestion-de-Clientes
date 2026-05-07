import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MonthlyStat {
  month: string;
  newClients: number;
}

interface MonthlyRegistrationsChartProps {
  data: MonthlyStat[];
  variationText: string;
  variationValue: number;
  loading: boolean;
}

export const MonthlyRegistrationsChart: React.FC<MonthlyRegistrationsChartProps> = ({
  data,
  variationText,
  variationValue,
  loading,
}) => {
  // Determine if it's a positive, neutral, or negative variation
  const isPositive = variationValue > 0;
  const isNeutral = variationValue === 0;
  
  const variationColorClass = isPositive
    ? 'text-emerald-600 bg-emerald-50'
    : isNeutral
    ? 'text-slate-600 bg-slate-50'
    : 'text-red-600 bg-red-50';

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-80 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Nuevos Clientes (6 meses)</h2>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Cargando gráfica...</p>
        </div>
      </div>
    );
  }

  // Ensure minimum height for bars with 0 value so they don't look like load errors
  const chartData = data.map((item) => ({
    ...item,
    // We keep the real value for the tooltip, but add a displayValue for the chart height
    displayValue: item.newClients === 0 ? 0.2 : item.newClients,
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-96 flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Nuevos Clientes</h2>
          <p className="text-sm text-slate-500">Últimos 6 meses</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${variationColorClass}`}>
          {variationText}
        </div>
      </div>

      <div className="flex-1 w-full mt-4 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl">
                      <p className="font-semibold">{payload[0].payload.month}</p>
                      <p>{payload[0].payload.newClients} cliente(s)</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="displayValue" radius={[4, 4, 4, 4]} maxBarSize={40}>
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  // Index 5 is the most recent month
                  fill={index === 5 ? '#10b981' : '#a7f3d0'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
