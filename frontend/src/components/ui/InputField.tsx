import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    endIcon?: React.ReactNode;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, error, endIcon, className = '', ...props }, ref) => {
        const inputId = props.id ?? (props.name ? `field-${props.name}` : undefined);
        return (
            <div className="flex flex-col gap-1 w-full">
                <label htmlFor={inputId} className="text-sm font-medium text-slate-700">{label}</label>
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        className={`w-full h-11 px-3 py-2 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                            } outline-none transition-colors shadow-sm text-slate-900 bg-white disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
                        {...props}
                    />
                    {endIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {endIcon}
                        </div>
                    )}
                </div>
                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            </div>
        );
    }
);

InputField.displayName = 'InputField';
