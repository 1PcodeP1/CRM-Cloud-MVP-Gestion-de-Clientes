import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SuccessBanner } from '../components/ui/SuccessBanner';

export const LoginPage: React.FC = () => {
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (location.state?.message) {
            if (location.state.type === 'success') {
                setSuccessMessage(location.state.message);
            } else {
                setErrorMessage(location.state.message);
            }
            // Clean up state so refresh doesn't show message again
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-[#f4f5f7] flex flex-col items-center justify-center p-4">
            <Link to="/" className="flex items-center gap-2 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                    <Activity className="text-white w-6 h-6" />
                </div>
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight">CRM Cloud</span>
            </Link>

            <div className="w-full max-w-md">
                {successMessage && <SuccessBanner message={successMessage} />}
                {errorMessage && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm mb-6">
                        <p className="text-red-800 text-sm font-medium leading-relaxed">{errorMessage}</p>
                    </div>
                )}
            </div>

            <LoginForm />
        </div>
    );
};
