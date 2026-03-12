// frontend/src/__tests__/LoginForm.test.tsx
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { LoginForm } from '../components/auth/LoginForm';

// ─── Mock de useNavigate y useAuth ───────────────────────────────
const mockNavigate = vi.fn();
const mockSetAuth = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        setAuth: mockSetAuth,
        token: null,
        user: null,
        isAuthenticated: false,
        logout: vi.fn(),
    }),
}));

// ─── MSW Handlers ────────────────────────────────────────────────
const API_URL = 'http://localhost:3000';

const handlers = [
    // Handler por defecto: login exitoso
    http.post(`${API_URL}/auth/login`, () => {
        return HttpResponse.json(
            {
                access_token: 'test-jwt-token',
                user: {
                    id: 'uuid-123',
                    email: 'juan@empresa.com',
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    company: 'ACME Corp',
                },
            },
            { status: 200 },
        );
    }),
];

const server = setupServer(...handlers);

// ─── Setup/Teardown ─────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
    server.resetHandlers();
    mockNavigate.mockClear();
    mockSetAuth.mockClear();
});
afterAll(() => server.close());

// ─── Helper: renderizar el componente ────────────────────────────
const renderLoginForm = () => {
    return render(
        <BrowserRouter>
            <LoginForm />
        </BrowserRouter>,
    );
};

describe('LoginForm', () => {

    // ═════════════════════════════════════════════════════════════
    // Validación de email en tiempo real — CRITERIO 13
    // ═════════════════════════════════════════════════════════════
    describe('Validación de email en tiempo real', () => {

        it('[CRITERIO 13] debe mostrar error de email en tiempo real sin necesidad de submit', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderLoginForm();
            const emailInput = screen.getByLabelText('Correo electrónico');

            // ACT — escribir un email inválido y mover el foco fuera
            await user.type(emailInput, 'correo-invalido');
            await user.tab(); // Trigger blur/onChange validation

            // ASSERT
            await waitFor(() => {
                expect(screen.getByText('Ingresa una dirección de correo válida')).toBeInTheDocument();
            });
        });

        it('[CRITERIO 13] el mensaje debe ser exactamente "Ingresa una dirección de correo válida"', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderLoginForm();
            const emailInput = screen.getByLabelText('Correo electrónico');

            // ACT
            await user.type(emailInput, 'invalid-email');
            await user.tab();

            // ASSERT
            await waitFor(() => {
                const errorElement = screen.getByText('Ingresa una dirección de correo válida');
                expect(errorElement).toBeInTheDocument();
                expect(errorElement.textContent).toBe('Ingresa una dirección de correo válida');
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Credenciales incorrectas — CRITERIO 15
    // ═════════════════════════════════════════════════════════════
    describe('Credenciales incorrectas', () => {

        it('[CRITERIO 15] debe mostrar "El correo o la contraseña son incorrectos" con credenciales malas', async () => {
            // ARRANGE
            const user = userEvent.setup();
            server.use(
                http.post(`${API_URL}/auth/login`, () => {
                    return HttpResponse.json(
                        { message: 'El correo o la contraseña son incorrectos', statusCode: 401 },
                        { status: 401 },
                    );
                }),
            );
            renderLoginForm();

            // ACT
            await user.type(screen.getByLabelText('Correo electrónico'), 'juan@empresa.com');
            await user.type(screen.getByLabelText('Contraseña'), 'WrongPassword1');
            const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(
                    screen.getByText('El correo o la contraseña son incorrectos'),
                ).toBeInTheDocument();
            });
        });

        it('[CRITERIO 15] el mensaje de error debe ser idéntico tanto si falla el email como si falla la contraseña', async () => {
            // ARRANGE
            const user = userEvent.setup();
            const errorMessage = 'El correo o la contraseña son incorrectos';
            server.use(
                http.post(`${API_URL}/auth/login`, () => {
                    return HttpResponse.json(
                        { message: errorMessage, statusCode: 401 },
                        { status: 401 },
                    );
                }),
            );
            renderLoginForm();

            // ACT — probar con un email que "no existe"
            await user.type(screen.getByLabelText('Correo electrónico'), 'noexiste@empresa.com');
            await user.type(screen.getByLabelText('Contraseña'), 'Password1');
            const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                const errorElement = screen.getByText(errorMessage);
                expect(errorElement).toBeInTheDocument();
                // Verificar que el mensaje no indica cuál de los dos campos falló
                expect(errorElement.textContent).not.toContain('El correo es incorrecto');
                expect(errorElement.textContent).not.toContain('La contraseña es incorrecta');
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Login exitoso — CRITERIO 14
    // ═════════════════════════════════════════════════════════════
    describe('Login exitoso', () => {

        it('[CRITERIO 14] debe guardar el JWT en memoria y redirigir a /dashboard con login exitoso', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderLoginForm();

            // ACT
            await user.type(screen.getByLabelText('Correo electrónico'), 'juan@empresa.com');
            await user.type(screen.getByLabelText('Contraseña'), 'Password1');
            const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                // Verificar que setAuth fue llamado con el token JWT
                expect(mockSetAuth).toHaveBeenCalledWith(
                    expect.objectContaining({
                        access_token: 'test-jwt-token',
                        user: expect.objectContaining({
                            email: 'juan@empresa.com',
                        }),
                    }),
                );
                // Verificar redirección a /dashboard
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Link olvidé contraseña — CRITERIO 17
    // ═════════════════════════════════════════════════════════════
    describe('Link olvidé contraseña', () => {

        it('[CRITERIO 17] el link "¿Olvidaste tu contraseña?" debe ser visible en el formulario', () => {
            // ARRANGE & ACT
            renderLoginForm();

            // ASSERT
            const forgotLink = screen.getByText('¿Olvidaste tu contraseña?');
            expect(forgotLink).toBeInTheDocument();
            expect(forgotLink).toBeVisible();
        });

        it('[CRITERIO 17] al hacer clic debe mostrar "Esta función estará disponible próximamente"', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderLoginForm();

            // ACT
            const forgotLink = screen.getByText('¿Olvidaste tu contraseña?');
            await user.click(forgotLink);

            // ASSERT
            await waitFor(() => {
                expect(
                    screen.getByText('Esta función estará disponible próximamente'),
                ).toBeInTheDocument();
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Toggle de contraseña — CRITERIO 12
    // ═════════════════════════════════════════════════════════════
    describe('Toggle de mostrar/ocultar contraseña', () => {

        it('[CRITERIO 12] el campo contraseña debe tener toggle de mostrar/ocultar', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderLoginForm();
            const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;

            // ASSERT — inicialmente es password (oculto)
            expect(passwordInput.type).toBe('password');

            // ACT — hacer clic en el toggle
            const toggleButton = screen.getByLabelText('Mostrar contraseña');
            await user.click(toggleButton);

            // ASSERT — ahora es text (visible)
            expect(passwordInput.type).toBe('text');

            // ACT — hacer clic de nuevo para ocultar
            const hideButton = screen.getByLabelText('Ocultar contraseña');
            await user.click(hideButton);

            // ASSERT — de vuelta a password
            expect(passwordInput.type).toBe('password');
        });
    });
});
