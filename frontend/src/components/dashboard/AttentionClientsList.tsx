import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { AttentionClient } from '../../services/clientService';

interface AttentionClientsListProps {
  clients: AttentionClient[];
  loading: boolean;
}

export const AttentionClientsList: React.FC<AttentionClientsListProps> = ({ clients, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-96 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Requieren atención</h2>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Requieren atención</h2>
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {clients.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-slate-600 font-medium">Todos tus clientes están al día</p>
            <p className="text-sm text-slate-400 mt-1">¡Buen trabajo manteniendo el contacto!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div 
                key={client.id} 
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-slate-800">
                    {client.firstName} {client.lastName}
                  </h3>
                  <p className="text-sm text-slate-500">{client.company}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    client.reason === 'Inactivo' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {client.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
