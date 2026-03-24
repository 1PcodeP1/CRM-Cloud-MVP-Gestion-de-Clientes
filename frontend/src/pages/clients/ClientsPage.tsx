import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { clientService } from '../../services/clientService';
import { Client, ClientStatus, ClientsResponse } from '../../types/client.types';
import debounce from 'lodash.debounce';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('Todos');

  const fetchClients = useCallback(async (p: number, s: string, st: string) => {
    try {
      setLoading(true);
      const res = await clientService.getClients({ page: p, limit: 5, search: s, status: st });
      setClients(res.data);
      setTotal(res.meta.total);
      setLastPage(res.meta.lastPage);
      setPage(res.meta.page);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useRef(
    debounce((query: string, currentStatus: string) => {
      setPage(1);
      fetchClients(1, query, currentStatus);
    }, 400)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Initial load or pagination/status changes without search typing debounce
  useEffect(() => {
    fetchClients(page, search, status);
  }, [page, status]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value, status);
  };

  const getStatusBadge = (s: ClientStatus) => {
    const config = {
      [ClientStatus.ACTIVE]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [ClientStatus.PROSPECT]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      [ClientStatus.INACTIVE]: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${config[s]}`}>
        {s}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
            <p className="text-sm text-slate-500 mt-1">
              Mostrando {clients.length} de {total} clientes
            </p>
          </div>
          <button
            onClick={() => navigate('/clients/new')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nuevo Cliente
          </button>
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, empresa o correo..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); debouncedSearch('', status); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 min-w-[160px]">
              <span className="text-sm text-slate-500 font-medium">Estado:</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="flex-1 py-2 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value={ClientStatus.ACTIVE}>Activo</option>
                <option value={ClientStatus.PROSPECT}>Prospecto</option>
                <option value={ClientStatus.INACTIVE}>Inactivo</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Empresa</th>
                  <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                  <th className="px-6 py-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Cargando clientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-800">
                          {client.firstName} {client.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{client.company}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{client.email}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(client.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <p className="text-slate-500 text-sm">
                        {search ? 'No se encontraron clientes con ese criterio de búsqueda' : 'No hay clientes registrados aún'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              
              <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                Página {page} de {lastPage}
              </span>
              
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
