import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, User, Users } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { InputField } from '../../components/ui/InputField';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { createClientSchema, CreateClientFormData } from '../../schemas/clientSchema';
import { clientService } from '../../services/clientService';
import { ClientStatus } from '../../types/client.types';

export const CreateClientPage: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      status: ClientStatus.PROSPECT,
    },
  });

  const onSubmit = async (data: CreateClientFormData) => {
    try {
      setServerError(null);
      await clientService.createClient(data);
      setSuccessMsg('Cliente registrado exitosamente');
      setTimeout(() => {
        navigate('/clients');
      }, 1500);
    } catch (error: any) {
      setServerError(error.message || 'No fue posible registrar el cliente');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    setValue('phone', onlyNums, { shouldValidate: true });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Nuevo Cliente</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingresa la información básica para registrar un nuevo cliente en el sistema.
          </p>
        </div>

        {serverError && <ErrorBanner message={serverError} />}
        {successMsg && (
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-emerald-800 text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nombre"
              placeholder="Ej. Juan"
              error={errors.firstName?.message}
              endIcon={<User size={18} />}
              {...register('firstName')}
            />
            <InputField
              label="Apellido"
              placeholder="Ej. Pérez"
              error={errors.lastName?.message}
              endIcon={<Users size={18} />}
              {...register('lastName')}
            />
          </div>

          <InputField
            label="Empresa"
            placeholder="Ej. Acme Corp"
            error={errors.company?.message}
            endIcon={<Building2 size={18} />}
            {...register('company')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Correo electrónico"
              type="email"
              placeholder="nombre@empresa.com"
              error={errors.email?.message}
              endIcon={<Mail size={18} />}
              {...register('email')}
            />
            <InputField
              label="Teléfono"
              placeholder="10 dígitos"
              maxLength={10}
              error={errors.phone?.message}
              endIcon={<Phone size={18} />}
              {...register('phone', {
                onChange: handlePhoneChange,
              })}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="field-status" className="text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              id="field-status"
              className={`w-full h-11 px-3 py-2 rounded-xl border ${
                errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
              } outline-none transition-colors shadow-sm text-slate-900 bg-white`}
              {...register('status')}
            >
              <option value={ClientStatus.ACTIVE}>Activo</option>
              <option value={ClientStatus.PROSPECT}>Prospecto</option>
              <option value={ClientStatus.INACTIVE}>Inactivo</option>
            </select>
            {errors.status && <span className="text-xs text-red-500 mt-1">{errors.status.message}</span>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
