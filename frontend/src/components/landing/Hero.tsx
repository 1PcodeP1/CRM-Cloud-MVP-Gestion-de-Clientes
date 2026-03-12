import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { FeaturesGrid } from './FeaturesGrid';

export const Hero: React.FC = () => {
    const navigate = useNavigate();
    const [showFeatures, setShowFeatures] = useState(false);

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-8 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                    MVP · Gestión de clientes
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                    Tu base de clientes,<br />
                    <span className="text-emerald-600">siempre organizada</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
                    Centraliza la información de tus clientes, monitorea su estado y actúa rápido cuando algo requiere atención.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-lg transition-colors shadow-sm shadow-emerald-200"
                    >
                        Empezar gratis
                    </button>
                    <button
                        onClick={() => setShowFeatures(!showFeatures)}
                        className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-medium text-lg transition-colors shadow-sm flex items-center justify-center gap-2 group"
                    >
                        Ver funcionalidades
                        <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${showFeatures ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {showFeatures && (
                <div className="pb-20 animate-in fade-in slide-in-from-top-4 duration-500">
                    <FeaturesGrid />
                </div>
            )}
        </div>
    );
};
