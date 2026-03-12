import React, { useState } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { registerSchema, RegisterFormValues } from '../../schemas/registerSchema';
import { authService } from '../../services/authService';
import { InputField } from '../ui/InputField';
import { ErrorBanner } from '../ui/ErrorBanner';

// Custom resolver that runs Zod AND always checks password equality
const registerResolver: Resolver<RegisterFormValues> = async (values, context, options) => {
    const zodResult = await zodResolver(registerSchema)(values, context, options);
    // Always run password match check independently of other field errors
    if (
        values.password &&
        values.confirmPassword &&
        values.password !== values.confirmPassword
    ) {
        return {
            ...zodResult,
            errors: {
                ...zodResult.errors,
                confirmPassword: {
                    type: 'manual',
                    message: 'Las contraseñas no coinciden',
                },
            },
        };
    }
    return zodResult;
};

export const RegisterForm: React.FC = () => {
    const [serverError, setServerError] = useState<string>('');
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: registerResolver,
        mode: 'onSubmit', // Validate on submit as mostly preferred for long forms empty check
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            setServerError('');
            const response = await authService.register(data);
            // history.replace equivalent in react-router v6:
            navigate('/login', {
                replace: true,
                state: {
                    message: 'Tu cuenta ha sido creada. Bienvenido a CRM Cloud',
                    type: 'success'
                }
            });
        } catch (error: any) {
            setServerError(error.message);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Crear cuenta</h2>
                <p className="text-slate-600">Únete a CRM Cloud y organiza tu base de clientes</p>
            </div>

            <ErrorBanner message={serverError} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                        label="Nombre"
                        type="text"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                        maxLength={100}
                    />
                    <InputField
                        label="Apellido"
                        type="text"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                        maxLength={100}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                        label="Correo"
                        type="email"
                        placeholder="nombre@empresa.com"
                        {...register('email')}
                        error={errors.email?.message}
                        maxLength={255}
                    />

                    <Controller
                        name="phone"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <InputField
                                label="Teléfono"
                                type="text"
                                placeholder="Ej. 5512345678"
                                error={errors.phone?.message}
                                maxLength={10}
                                {...field}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Only allow digits
                                    if (val === '' || /^[0-9]+$/.test(val)) {
                                        field.onChange(val);
                                    }
                                }}
                            />
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                        label="Nombre empresa"
                        type="text"
                        {...register('company')}
                        error={errors.company?.message}
                        maxLength={150}
                    />

                    <div className="flex flex-col gap-1 w-full">
                        <label htmlFor="field-industry" className="text-sm font-medium text-slate-700">Industria</label>
                        <select
                            id="field-industry"
                            {...register('industry')}
                            className={`w-full h-11 px-3 py-2 rounded-xl border ${errors.industry ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                                } outline-none transition-colors shadow-sm text-slate-900 bg-white`}
                        >
                            <option value="">Selecciona una industria</option>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Comercio">Comercio</option>
                            <option value="Servicios">Servicios</option>
                            <option value="Educación">Educación</option>
                            <option value="Salud">Salud</option>
                        </select>
                        {errors.industry && <span className="text-xs text-red-500 mt-1">{errors.industry.message}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                        label="Contraseña"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        {...register('password')}
                        error={errors.password?.message}
                        maxLength={255}
                    />
                    <InputField
                        label="Confirmar contraseña"
                        type="password"
                        placeholder="Repite la contraseña"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        maxLength={255}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 mt-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creando cuenta...
                        </>
                    ) : (
                        'Registrarse'
                    )}
                </button>

                <div className="pt-4 text-center">
                    <p className="text-slate-600 text-sm">
                        ¿Ya tienes una cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-emerald-600 hover:text-emerald-700 font-medium ml-1"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};
