import React from 'react';
import { Users, BarChart2, AlertCircle, Filter, Shield, Zap } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
    const features = [
        {
            icon: <Users className="w-6 h-6 text-emerald-600" />,
            title: 'Gestión de clientes',
            description: 'Registra y organiza toda tu base de clientes en un solo lugar. Accede al historial, datos de contacto y estado de cada cuenta al instante.',
        },
        {
            icon: <BarChart2 className="w-6 h-6 text-emerald-600" />,
            title: 'Panel de métricas',
            description: 'Visualiza en tiempo real cuántos clientes tienes activos, cuántos son prospectos y cuántos requieren atención, con gráficas claras y sin ruido.',
        },
        {
            icon: <AlertCircle className="w-6 h-6 text-emerald-600" />,
            title: 'Alertas de seguimiento',
            description: 'El sistema detecta automáticamente clientes sin contacto reciente o con estado inactivo para que tu equipo nunca pierda una oportunidad.',
        },
        {
            icon: <Filter className="w-6 h-6 text-emerald-600" />,
            title: 'Búsqueda y filtros',
            description: 'Encuentra cualquier cliente en segundos usando búsqueda por nombre, empresa o email, combinada con filtros de estado.',
        },
        {
            icon: <Shield className="w-6 h-6 text-emerald-600" />,
            title: 'Acceso por empresa',
            description: 'Cada empresa tiene su propio espacio aislado. Los datos de tus clientes son exclusivamente tuyos y están seguros.',
        },
        {
            icon: <Zap className="w-6 h-6 text-emerald-600" />,
            title: 'Listo para escalar',
            description: 'El MVP cubre la gestión esencial. Próximamente: pipeline de ventas, tareas, notas por cliente e integraciones con email.',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
