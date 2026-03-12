import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessBannerProps {
    message: string;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({ message }) => {
    return (
        <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-emerald-800 text-sm font-medium leading-relaxed">{message}</p>
        </div>
    );
};
