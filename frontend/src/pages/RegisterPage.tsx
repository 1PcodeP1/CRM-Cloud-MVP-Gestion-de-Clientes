import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#f4f5f7] flex flex-col items-center justify-center p-4 py-12">
            <Link to="/" className="flex items-center gap-2 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                    <Activity className="text-white w-6 h-6" />
                </div>
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight">CRM Cloud</span>
            </Link>

            <RegisterForm />
        </div>
    );
};
