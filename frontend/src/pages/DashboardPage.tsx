// frontend/src/pages/DashboardPage.tsx
import React from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

export const DashboardPage: React.FC = () => {
  // Datos de ejemplo (en el futuro vendrán de la API)
  const stats = {
    total: 10,
    active: 7,
    prospects: 2,
    inactive: 1,
  };

  const KpiCard: React.FC<{
    label: string;
    value: number;
    sub: string;
    icon: React.ElementType;
    dark?: boolean;
    color?: string;
    pct?: number;
  }> = ({ label, value, sub, icon: Icon, dark, color, pct }) => (
    <div
      className="rounded-2xl border-0 shadow-sm overflow-hidden"
      style={{ background: dark ? "#0f1117" : "#ffffff" }}
    >
      <div
        className="flex flex-col justify-between px-7 pt-7 pb-7"
        style={{ minHeight: "180px" }}
      >
        {/* Top row: icon + badge */}
        <div className="flex justify-between items-start">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: dark ? "rgba(255,255,255,0.08)" : "#dcfce7",
            }}
          >
            <Icon
              size={18}
              style={{ color: dark ? "#94a3b8" : "#16a34a" }}
              strokeWidth={1.8}
            />
          </div>
          {pct !== undefined && (
            <span
              className="text-[11px] px-2.5 py-1 rounded-full font-semibold mono"
              style={{
                background: dark ? "rgba(255,255,255,0.06)" : "#dcfce7",
                color: dark ? "#64748b" : "#15803d",
              }}
            >
              {pct}%
            </span>
          )}
        </div>

        {/* Bottom block: label + value + sub */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: dark ? "#4b5563" : "#b0b8c8" }}
          >
            {label}
          </p>
          <p
            className="text-[44px] font-bold tracking-tight leading-none mb-2"
            style={{ color: color || (dark ? "#f1f5f9" : "#111827") }}
          >
            {value}
          </p>
          <p
            className="text-[11px]"
            style={{ color: dark ? "#374151" : "#c4c9d4" }}
          >
            {sub}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Welcome message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Bienvenido al CRM Cloud
        </h1>
        <p className="text-slate-600">
          Gestiona tus clientes de forma eficiente y mantén tu negocio
          organizado.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <KpiCard
          label="Total clientes"
          value={stats.total}
          sub="Base completa"
          icon={Users}
          dark
        />
        <KpiCard
          label="Clientes activos"
          value={stats.active}
          sub="En seguimiento"
          icon={UserCheck}
          color="#16a34a"
          pct={Math.round((stats.active / stats.total) * 100)}
        />
        <KpiCard
          label="Prospectos"
          value={stats.prospects}
          sub="Por convertir"
          icon={TrendingUp}
          color="#d97706"
          pct={Math.round((stats.prospects / stats.total) * 100)}
        />
        <KpiCard
          label="Inactivos"
          value={stats.inactive}
          sub="Sin actividad reciente"
          icon={UserX}
          color="#94a3b8"
          pct={Math.round((stats.inactive / stats.total) * 100)}
        />
      </div>

      {/* Placeholder para futuras secciones */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Próximamente
        </h2>
        <p className="text-slate-600">
          En esta sección podrás ver gráficos de crecimiento, clientes que
          requieren atención y más funcionalidades que llegarán en próximas
          versiones.
        </p>
      </div>
    </DashboardLayout>
  );
};
