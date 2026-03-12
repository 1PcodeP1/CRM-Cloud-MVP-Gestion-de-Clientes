// frontend/src/components/layout/DashboardLayout.tsx
import React, { useState } from "react";
import {
  Activity,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout("Has cerrado sesión correctamente", true);
  };

  const NavItem: React.FC<{
    to: string;
    icon: React.ElementType;
    label: string;
  }> = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all select-none ${
          isActive
            ? "bg-emerald-600 text-white font-medium shadow-sm"
            : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
        }`}
      >
        <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f4f5f7]">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside
          className="w-56 flex flex-col py-6 px-5 gap-7 border-r"
          style={{ background: "#0f1117", borderColor: "#1e2130" }}
        >
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Activity size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[13px] font-semibold text-slate-100 tracking-tight">
                CRM Cloud
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Nav */}
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest px-3 mb-2">
              Principal
            </p>
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/clients" icon={Users} label="Clientes" />
          </div>

          {/* User + Logout */}
          <div
            className="mt-auto pt-4 border-t"
            style={{ borderColor: "#1e2130" }}
          >
            <div className="flex items-center gap-2.5 px-1 mb-3">
              <div className="w-7 h-7 rounded-full bg-emerald-700/40 border border-emerald-600/30 flex items-center justify-center text-emerald-400 text-[11px] font-semibold">
                {user?.firstName?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-slate-200 leading-tight truncate">
                  {user?.firstName || "Usuario"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={15} strokeWidth={1.8} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Topbar */}
        <div
          className="flex items-center justify-between px-8 py-5 border-b bg-white"
          style={{ borderColor: "#e8eaed" }}
        >
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <Menu size={16} className="text-slate-500" />
              </button>
            )}
            <h3 className="text-[15px] font-semibold text-slate-800 tracking-tight">
              Panel de gestión
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
