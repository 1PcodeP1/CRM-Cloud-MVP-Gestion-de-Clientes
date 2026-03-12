// frontend/src/__tests__/RegisterForm.test.tsx
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RegisterForm } from '../components/auth/RegisterForm';

// ─── Mock de useNavigate ─────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// ─── MSW Handlers ────────────────────────────────────────────────
const API_URL = 'http://localhost:3000';

const handlers = [
    // Handler por defecto: registro exitoso
    http.post(`${API_URL}/auth/register`, () => {
        return HttpResponse.json(
            { message: 'Cuenta creada correctamente. Ya puedes iniciar sesión' },
            { status: 201 },
        );
    }),
];

const server = setupServer(...handlers);

// ─── Setup/Teardown ─────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
    server.resetHandlers();
    mockNavigate.mockClear();
});
afterAll(() => server.close());

// ─── Helper: renderizar el componente ────────────────────────────
const renderRegisterForm = () => {
    return render(
        <BrowserRouter>
            <RegisterForm />
        </BrowserRouter>,
    );
};

// ─── Helper: llenar el formulario completo con datos válidos ─────
const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText('Nombre'), 'Juan');
    await user.type(screen.getByLabelText('Apellido'), 'Pérez');
    await user.type(screen.getByLabelText('Correo'), 'juan@empresa.com');
    await user.type(screen.getByLabelText('Teléfono'), '5512345678');
    await user.type(screen.getByLabelText('Nombre empresa'), 'ACME Corp');
    await user.selectOptions(screen.getByLabelText('Industria'), 'Tecnología');
    await user.type(screen.getByLabelText('Contraseña'), 'Password1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password1');
};

describe('RegisterForm', () => {

    // ═════════════════════════════════════════════════════════════
    // Campos vacíos — CRITERIO 6
    // ═════════════════════════════════════════════════════════════
    describe('Validación de campos vacíos', () => {

        it('[CRITERIO 6] debe mostrar "Este campo es obligatorio" en todos los campos al hacer submit vacío', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();

            // ACT — click en submit sin llenar nada
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                const errorMessages = screen.getAllByText('Este campo es obligatorio');
                // Debe haber errores para: firstName, lastName, email, phone, company, industry, password, confirmPassword
                expect(errorMessages.length).toBeGreaterThanOrEqual(7);
            });
        });

        it('[CRITERIO 6] los campos vacíos deben tener borde de color rojo', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();

            // ACT
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT — verificar que los inputs tienen la clase de borde rojo
            await waitFor(() => {
                const nameInput = screen.getByLabelText('Nombre');
                expect(nameInput.className).toContain('border-red-500');
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Validación de email — CRITERIO 2
    // ═════════════════════════════════════════════════════════════
    describe('Validación de formato de email', () => {

        it('[CRITERIO 2] debe mostrar "Ingresa una dirección de correo válida" con email mal formado', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();

            // ACT — escribir email inválido y enviar
            await user.type(screen.getByLabelText('Correo'), 'correo-invalido');
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(screen.getByText('Ingresa una dirección de correo válida')).toBeInTheDocument();
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Teléfono solo numérico — CRITERIO 3
    // ═════════════════════════════════════════════════════════════
    describe('Validación de teléfono', () => {

        it('[CRITERIO 3] el campo teléfono no debe registrar letras ni símbolos', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();
            const phoneInput = screen.getByLabelText('Teléfono') as HTMLInputElement;

            // ACT — intentar escribir letras y símbolos
            await user.type(phoneInput, 'abc!@#$%');

            // ASSERT — el valor debe permanecer vacío
            expect(phoneInput.value).toBe('');
        });

        it('[CRITERIO 3] el campo teléfono solo acepta exactamente 10 dígitos', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();
            const phoneInput = screen.getByLabelText('Teléfono') as HTMLInputElement;

            // ACT — escribir 10 dígitos
            await user.type(phoneInput, '5512345678');

            // ASSERT
            expect(phoneInput.value).toBe('5512345678');
            expect(phoneInput.value).toHaveLength(10);
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Contraseñas no coinciden — CRITERIO 4
    // ═════════════════════════════════════════════════════════════
    describe('Validación de contraseñas', () => {

        it('[CRITERIO 4] debe mostrar "Las contraseñas no coinciden" cuando no son iguales', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();

            // ACT
            await user.type(screen.getByLabelText('Contraseña'), 'Password1');
            await user.type(screen.getByLabelText('Confirmar contraseña'), 'OtraPassword2');
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
            });
        });

        it('[CRITERIO 4] no debe mostrar error de contraseña cuando sí coinciden', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();

            // ACT
            await user.type(screen.getByLabelText('Contraseña'), 'Password1');
            await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password1');
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(screen.queryByText('Las contraseñas no coinciden')).not.toBeInTheDocument();
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Botón desactivado durante procesamiento — CRITERIO 10
    // ═════════════════════════════════════════════════════════════
    describe('Estado del botón durante procesamiento', () => {

        it('[CRITERIO 10] el botón debe desactivarse visualmente mientras procesa la petición', async () => {
            // ARRANGE
            const user = userEvent.setup();
            // Hacer que la petición tarde en responder
            server.use(
                http.post(`${API_URL}/auth/register`, async () => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    return HttpResponse.json(
                        { message: 'Cuenta creada correctamente. Ya puedes iniciar sesión' },
                        { status: 201 },
                    );
                }),
            );
            renderRegisterForm();

            // ACT — llenar formulario y enviarlo
            await fillValidForm(user);
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT — verificar que el botón está deshabilitado durante el envío
            await waitFor(() => {
                const processingButton = screen.getByRole('button', { name: /creando cuenta/i });
                expect(processingButton).toBeDisabled();
            });
        });

        it('[CRITERIO 10] el botón no puede ser clickeado dos veces en el mismo envío', async () => {
            // ARRANGE
            const user = userEvent.setup();
            let callCount = 0;
            server.use(
                http.post(`${API_URL}/auth/register`, async () => {
                    callCount++;
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return HttpResponse.json(
                        { message: 'Cuenta creada correctamente. Ya puedes iniciar sesión' },
                        { status: 201 },
                    );
                }),
            );
            renderRegisterForm();

            // ACT — llenar formulario, hacer clic múltiples veces
            await fillValidForm(user);
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // Intentar clic adicional mientras está procesando
            await waitFor(() => {
                const processingButton = screen.getByRole('button', { name: /creando cuenta/i });
                expect(processingButton).toBeDisabled();
            });

            // ASSERT — solo debe haberse enviado una vez
            expect(callCount).toBe(1);
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Banner de éxito — CRITERIO 8
    // ═════════════════════════════════════════════════════════════
    describe('Registro exitoso', () => {

        it('[CRITERIO 8] debe redirigir con el mensaje de éxito "Tu cuenta ha sido creada. Bienvenido a CRM Cloud"', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();

            // ACT
            await fillValidForm(user);
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/login', {
                    replace: true,
                    state: {
                        message: 'Tu cuenta ha sido creada. Bienvenido a CRM Cloud',
                        type: 'success',
                    },
                });
            });
        });

        it('[CRITERIO 7] debe redirigir a /login después de registro exitoso', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();

            // ACT
            await fillValidForm(user);
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/login', expect.any(Object));
            });
        });

        it('[CRITERIO 11] debe usar replace: true (equivalente a history.replace()) y no push en la redirección', async () => {
            // ARRANGE
            const user = userEvent.setup();
            renderRegisterForm();

            // ACT
            await fillValidForm(user);
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(
                    '/login',
                    expect.objectContaining({ replace: true }),
                );
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Banner rojo de error — CRITERIO 9
    // ═════════════════════════════════════════════════════════════
    describe('Error del servidor', () => {

        it('[CRITERIO 9] debe mostrar banner rojo con texto exacto cuando hay error del servidor', async () => {
            // ARRANGE
            const user = userEvent.setup();
            server.use(
                http.post(`${API_URL}/auth/register`, () => {
                    return HttpResponse.json(
                        { message: 'No fue posible crear la cuenta. Por favor intenta de nuevo más tarde', statusCode: 500 },
                        { status: 500 },
                    );
                }),
            );
            renderRegisterForm();

            // ACT
            await fillValidForm(user);
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(
                    screen.getByText('No fue posible crear la cuenta. Por favor intenta de nuevo más tarde'),
                ).toBeInTheDocument();
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // Email duplicado — CRITERIO 5
    // ═════════════════════════════════════════════════════════════
    describe('Email duplicado', () => {

        it('[CRITERIO 5] debe mostrar "Este correo ya tiene una cuenta registrada" con email duplicado', async () => {
            // ARRANGE
            const user = userEvent.setup();
            server.use(
                http.post(`${API_URL}/auth/register`, () => {
                    return HttpResponse.json(
                        { message: 'Este correo ya tiene una cuenta registrada', statusCode: 409 },
                        { status: 409 },
                    );
                }),
            );
            renderRegisterForm();

            // ACT
            await fillValidForm(user);
            const submitButton = screen.getByRole('button', { name: /registrarse/i });
            await user.click(submitButton);

            // ASSERT
            await waitFor(() => {
                expect(
                    screen.getByText('Este correo ya tiene una cuenta registrada'),
                ).toBeInTheDocument();
            });
        });
    });
});
