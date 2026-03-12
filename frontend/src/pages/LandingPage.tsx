import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
            <Navbar />
            <main>
                <Hero />
            </main>
            <footer className="w-full bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800">
                <p>© {new Date().getFullYear()} CRM Cloud. MVP de Gestión de Clientes.</p>
            </footer>
        </div>
    );
};
