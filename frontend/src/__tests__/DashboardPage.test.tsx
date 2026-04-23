import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardPage } from '../pages/DashboardPage';
import { clientService } from '../services/clientService';

vi.mock('../services/clientService', () => ({
  clientService: {
    getClients: vi.fn(),
  },
}));

vi.mock('../components/layout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: any }) => <div>{children}</div>,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[CRITERIO 56, 57 y 59] muestra 4 indicadores con conteo, porcentaje y colores por estado', async () => {
    (clientService.getClients as any)
      .mockResolvedValueOnce({ meta: { total: 10, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 6, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 3, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 1, page: 1, lastPage: 1 }, data: [] });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('kpi-total')).toHaveTextContent('Total de clientes');
      expect(screen.getByTestId('kpi-active')).toHaveTextContent('Clientes activos');
      expect(screen.getByTestId('kpi-prospects')).toHaveTextContent('Prospectos');
      expect(screen.getByTestId('kpi-inactive')).toHaveTextContent('Inactivos');
    });

    expect(screen.getByTestId('kpi-total')).toHaveTextContent('10 clientes · 100%');
    expect(screen.getByTestId('kpi-active')).toHaveTextContent('6 clientes · 60%');
    expect(screen.getByTestId('kpi-prospects')).toHaveTextContent('3 clientes · 30%');
    expect(screen.getByTestId('kpi-inactive')).toHaveTextContent('1 clientes · 10%');

    expect(screen.getByTestId('kpi-active').className).toContain('border-emerald-200');
    expect(screen.getByTestId('kpi-prospects').className).toContain('border-amber-200');
    expect(screen.getByTestId('kpi-inactive').className).toContain('border-slate-300');
  });

  it('[CRITERIO 58] calcula indicadores en tiempo real consultando datos actuales', async () => {
    (clientService.getClients as any)
      .mockResolvedValueOnce({ meta: { total: 5, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 2, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 2, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 1, page: 1, lastPage: 1 }, data: [] });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(clientService.getClients).toHaveBeenCalledTimes(4);
    });

    expect(clientService.getClients).toHaveBeenNthCalledWith(1, { limit: 1 });
    expect(clientService.getClients).toHaveBeenNthCalledWith(2, { limit: 1, status: 'Activo' });
    expect(clientService.getClients).toHaveBeenNthCalledWith(3, { limit: 1, status: 'Prospecto' });
    expect(clientService.getClients).toHaveBeenNthCalledWith(4, { limit: 1, status: 'Inactivo' });
  });

  it('[CRITERIO 60] muestra 0 sin errores cuando no hay clientes', async () => {
    (clientService.getClients as any)
      .mockResolvedValueOnce({ meta: { total: 0, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 0, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 0, page: 1, lastPage: 1 }, data: [] })
      .mockResolvedValueOnce({ meta: { total: 0, page: 1, lastPage: 1 }, data: [] });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('kpi-total')).toHaveTextContent('0 clientes · 0%');
      expect(screen.getByTestId('kpi-active')).toHaveTextContent('0 clientes · 0%');
      expect(screen.getByTestId('kpi-prospects')).toHaveTextContent('0 clientes · 0%');
      expect(screen.getByTestId('kpi-inactive')).toHaveTextContent('0 clientes · 0%');
    });
  });
});
