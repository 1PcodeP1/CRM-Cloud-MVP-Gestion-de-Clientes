import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ClientDetailPage } from '../pages/clients/ClientDetailPage';
import { clientService } from '../services/clientService';
import { ClientStatus } from '../types/client.types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/clientService', () => ({
  clientService: {
    getClientById: vi.fn(),
    deleteClient: vi.fn(),
  },
}));

vi.mock('../components/layout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: any }) => <div>{children}</div>,
}));

describe('ClientDetailPage', () => {
  const baseClient = {
    id: 'client-123',
    firstName: 'Ana',
    lastName: 'Lopez',
    company: 'Acme',
    email: 'ana@acme.com',
    phone: '3001112233',
    status: ClientStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/clients/client-123']}>
        <Routes>
          <Route path="/clients/:id" element={<ClientDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    (clientService.getClientById as any).mockResolvedValue(baseClient);
  });

  it('[CRITERIO 51] muestra boton Eliminar cliente en detalle', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Eliminar cliente' })).toBeInTheDocument();
    });
  });

  it('[CRITERIO 52 y 53] confirma eliminacion y redirige con mensaje de exito', async () => {
    const user = userEvent.setup();
    (clientService.deleteClient as any).mockResolvedValue({
      message: 'El cliente ha sido eliminado correctamente',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Eliminar cliente' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Eliminar cliente' }));

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Estás seguro de que deseas eliminar a Ana Lopez? Esta acción no se puede deshacer',
    );

    await waitFor(() => {
      expect(clientService.deleteClient).toHaveBeenCalledWith('client-123');
      expect(mockNavigate).toHaveBeenCalledWith('/clients', {
        state: {
          message: 'El cliente ha sido eliminado correctamente',
          type: 'success',
        },
      });
    });
  });

  it('[CRITERIO 54] si cancela no elimina ni redirige', async () => {
    const user = userEvent.setup();
    (window.confirm as any).mockReturnValue(false);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Eliminar cliente' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Eliminar cliente' }));

    expect(clientService.deleteClient).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('/clients', expect.anything());
  });
});
