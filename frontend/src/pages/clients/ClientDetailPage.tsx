import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { clientService } from '../../services/clientService';
import { Client, ClientStatus } from '../../types/client.types';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await clientService.getClientById(id);
        setClient(data);
      } catch (error: any) {
        if (error.message === 'Este cliente no existe') {
          setErrorNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (errorNotFound || !client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <h2 className="text-xl font-bold text-slate-800">Este cliente no existe</h2>
          <button
            onClick={() => navigate('/clients')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            <ChevronLeft size={16} />
            Volver al listado
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (s: ClientStatus) => {
    const config = {
      [ClientStatus.ACTIVE]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [ClientStatus.PROSPECT]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      [ClientStatus.INACTIVE]: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config[s]}`}>
        {s}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(new Date(dateString));
  };

  const handleDelete = () => {
    window.alert('Esta función estará disponible próximamente');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/clients')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
          >
            <ChevronLeft size={16} />
            Volver a clientes
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
            >
              <Trash2 size={16} />
              Eliminar cliente
            </button>
            <button
              onClick={() => navigate(`/clients/${client.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-medium text-sm tracking-wide transition-colors"
            >
              <Edit2 size={16} />
              Editar cliente
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {client.firstName} {client.lastName}
              </h1>
              <p className="text-slate-500 mt-1">{client.company}</p>
            </div>
            {getStatusBadge(client.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Nombre</h3>
                <p className="text-slate-800 font-medium text-base">{client.firstName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Apellido</h3>
                <p className="text-slate-800 font-medium text-base">{client.lastName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Correo electrónico</h3>
                <p className="text-slate-800 font-medium text-base">{client.email}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Empresa</h3>
                <p className="text-slate-800 font-medium text-base">{client.company}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Teléfono</h3>
                <p className="text-slate-800 font-medium text-base">{client.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Fecha de registro</h3>
                <p className="text-slate-800 font-medium text-base">{formatDate(client.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
