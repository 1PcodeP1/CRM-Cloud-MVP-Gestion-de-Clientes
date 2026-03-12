import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
    message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm font-medium leading-relaxed">{message}</p>
        </div>
    );
};
