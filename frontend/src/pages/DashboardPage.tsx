import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { clientService, MonthlyStat, AttentionClient } from '../services/clientService';
import { MonthlyRegistrationsChart } from '../components/dashboard/MonthlyRegistrationsChart';
import { AttentionClientsList } from '../components/dashboard/AttentionClientsList';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    prospects: 0,
    inactive: 0,
  });
  const [chartData, setChartData] = useState<{
    data: MonthlyStat[];
    variationText: string;
    variationValue: number;
  }>({
    data: [],
    variationText: '',
    variationValue: 0,
  });
  const [attentionClients, setAttentionClients] = useState<AttentionClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [totalRes, activeRes, prospectRes, inactiveRes, statsRes, attentionRes] = await Promise.all([
          clientService.getClients({ limit: 1 }),
          clientService.getClients({ limit: 1, status: 'Activo' }),
          clientService.getClients({ limit: 1, status: 'Prospecto' }),
          clientService.getClients({ limit: 1, status: 'Inactivo' }),
          clientService.getMonthlyStats(),
          clientService.getAttentionClients(),
        ]);

        setStats({
          total: totalRes.meta.total,
          active: activeRes.meta.total,
          prospects: prospectRes.meta.total,
          inactive: inactiveRes.meta.total,
        });

        setChartData({
          data: statsRes.data,
          variationText: statsRes.variationText,
          variationValue: statsRes.variationValue,
        });

        setAttentionClients(attentionRes);
      } catch {
        setError('No pudimos conectar con el servidor. Por favor, verifica tu conexión a internet o intenta recargar la página.');
        setStats({
          total: 0,
          active: 0,
          prospects: 0,
          inactive: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getPercent = (value: number) => {
    if (stats.total === 0) {
      return 0;
    }

    return Math.round((value / stats.total) * 100);
  };

  const cards = useMemo(
    () => [
      {
        key: 'total',
        testId: 'kpi-total',
        label: 'Total de clientes',
        icon: Users,
        value: stats.total,
        percentage: stats.total > 0 ? 100 : 0,
        cardClass: 'border-slate-200 bg-white',
        iconClass: 'bg-slate-100 text-slate-700',
        valueClass: 'text-slate-900',
      },
      {
        key: 'active',
        testId: 'kpi-active',
        label: 'Clientes activos',
        icon: UserCheck,
        value: stats.active,
        percentage: getPercent(stats.active),
        cardClass: 'border-emerald-200 bg-emerald-50/60',
        iconClass: 'bg-emerald-100 text-emerald-700',
        valueClass: 'text-emerald-700',
      },
      {
        key: 'prospects',
        testId: 'kpi-prospects',
        label: 'Prospectos',
        icon: TrendingUp,
        value: stats.prospects,
        percentage: getPercent(stats.prospects),
        cardClass: 'border-amber-200 bg-amber-50/70',
        iconClass: 'bg-amber-100 text-amber-700',
        valueClass: 'text-amber-700',
      },
      {
        key: 'inactive',
        testId: 'kpi-inactive',
        label: 'Inactivos',
        icon: UserX,
        value: stats.inactive,
        percentage: getPercent(stats.inactive),
        cardClass: 'border-slate-300 bg-slate-100/70',
        iconClass: 'bg-slate-200 text-slate-700',
        valueClass: 'text-slate-700',
      },
    ],
    [stats],
  );

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <UserX size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Problema de Conexión</h2>
          <p className="text-slate-600 max-w-md mb-8">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Reintentar conexión
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Bienvenido al CRM Cloud
        </h1>
        <p className="text-slate-600">
          Gestiona tus clientes de forma eficiente y mantén tu negocio
          organizado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.key}
              data-testid={card.testId}
              className={`rounded-2xl border p-5 shadow-sm ${card.cardClass}`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {card.label}
                </p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconClass}`}>
                  <Icon size={18} />
                </div>
              </div>

              <p className={`text-4xl font-bold leading-none mb-3 ${card.valueClass}`}>
                {loading ? '...' : card.value}
              </p>

              <p className="text-sm text-slate-600">
                {loading
                  ? 'Calculando...'
                  : `${card.value} clientes · ${card.percentage}%`}
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MonthlyRegistrationsChart 
          data={chartData.data} 
          variationText={chartData.variationText}
          variationValue={chartData.variationValue}
          loading={loading} 
        />
        
        <AttentionClientsList 
          clients={attentionClients} 
          loading={loading} 
        />
      </div>
    </DashboardLayout>
  );
};
