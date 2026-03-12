import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginSchema, LoginFormValues } from '../../schemas/loginSchema';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { InputField } from '../ui/InputField';
import { ErrorBanner } from '../ui/ErrorBanner';

export const LoginForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string>('');
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string>('');
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setServerError('');
            setForgotPasswordMessage('');
            const response = await authService.login(data);
            setAuth(response);
            navigate('/dashboard', { replace: true });
        } catch (error: any) {
            setServerError(error.message);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setForgotPasswordMessage('Esta función estará disponible próximamente');
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Iniciar sesión</h2>
                <p className="text-slate-600">Bienvenido de nuevo a CRM Cloud</p>
            </div>

            <ErrorBanner message={serverError} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <InputField
                    label="Correo electrónico"
                    type="email"
                    placeholder="nombre@empresa.com"
                    {...register('email')}
                    error={errors.email?.message}
                />

                <div className="space-y-1">
                    <InputField
                        label="Contraseña"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        error={errors.password?.message}
                        endIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                    />
                    <div className="flex justify-end pt-1">
                        <button
                            onClick={handleForgotPassword}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    {forgotPasswordMessage && (
                        <p className="text-sm text-emerald-600 mt-1">{forgotPasswordMessage}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Iniciando sesión...
                        </>
                    ) : (
                        'Iniciar sesión'
                    )}
                </button>

                <div className="pt-4 text-center">
                    <p className="text-slate-600 text-sm">
                        ¿No tienes una cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-emerald-600 hover:text-emerald-700 font-medium ml-1"
                        >
                            Regístrate aquí
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};
