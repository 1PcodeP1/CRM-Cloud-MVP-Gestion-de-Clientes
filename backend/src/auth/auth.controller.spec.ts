// backend/src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

describe('AuthController', () => {
    let app: INestApplication;
    let authService: jest.Mocked<Partial<AuthService>>;

    // ─── Datos de prueba reutilizables ───────────────────────────
    const validRegisterBody = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@empresa.com',
        phone: '5512345678',
        company: 'ACME Corp',
        industry: 'Tecnología',
        password: 'Password1',
        confirmPassword: 'Password1',
    };

    const validLoginBody = {
        email: 'juan@empresa.com',
        password: 'Password1',
    };

    // ─── Setup y teardown ────────────────────────────────────────
    beforeEach(async () => {
        authService = {
            register: jest.fn(),
            login: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();
    });

    afterEach(async () => {
        await app.close();
        jest.clearAllMocks();
    });

    // ═════════════════════════════════════════════════════════════
    // POST /auth/register
    // ═════════════════════════════════════════════════════════════
    describe('POST /auth/register', () => {

        describe('Registro exitoso', () => {

            it('[CRITERIO 7] debe retornar 201 y mensaje de éxito cuando los datos son válidos', async () => {
                // ARRANGE
                authService.register!.mockResolvedValue({
                    message: 'Cuenta creada correctamente. Ya puedes iniciar sesión',
                });

                // ACT
                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(validRegisterBody);

                // ASSERT
                expect(response.status).toBe(201);
                expect(response.body).toEqual({
                    message: 'Cuenta creada correctamente. Ya puedes iniciar sesión',
                });
                expect(authService.register).toHaveBeenCalledTimes(1);
            });
        });

        describe('Email duplicado', () => {

            it('[CRITERIO 5] debe retornar 409 cuando el email ya está registrado', async () => {
                // ARRANGE
                authService.register!.mockRejectedValue(
                    new ConflictException('Este correo ya tiene una cuenta registrada'),
                );

                // ACT
                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(validRegisterBody);

                // ASSERT
                expect(response.status).toBe(409);
                expect(response.body.message).toBe('Este correo ya tiene una cuenta registrada');
            });
        });

        describe('Campos obligatorios faltantes', () => {

            it('[CRITERIO 6] debe retornar 400 cuando faltan campos obligatorios', async () => {
                // ARRANGE — enviar body vacío
                const emptyBody = {};

                // ACT
                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(emptyBody);

                // ASSERT
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
                // class-validator retorna un arreglo de errores de validación
                expect(Array.isArray(response.body.message)).toBe(true);
                expect(response.body.message.length).toBeGreaterThan(0);
            });

            it('[CRITERIO 6] debe retornar 400 cuando solo faltan algunos campos', async () => {
                // ARRANGE — enviar solo nombre y email
                const partialBody = {
                    firstName: 'Juan',
                    email: 'juan@empresa.com',
                };

                // ACT
                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(partialBody);

                // ASSERT
                expect(response.status).toBe(400);
            });
        });

        describe('Error interno del servidor', () => {

            it('[CRITERIO 9] debe retornar 500 con mensaje genérico que no expone detalles técnicos', async () => {
                // ARRANGE
                authService.register!.mockRejectedValue(
                    new InternalServerErrorException('No fue posible crear la cuenta. Por favor intenta de nuevo más tarde'),
                );

                // ACT
                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(validRegisterBody);

                // ASSERT
                expect(response.status).toBe(500);
                expect(response.body.message).toBe('No fue posible crear la cuenta. Por favor intenta de nuevo más tarde');
                // Verificar que NO se exponen detalles internos
                expect(response.body).not.toHaveProperty('stack');
                expect(response.body).not.toHaveProperty('query');
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // POST /auth/login
    // ═════════════════════════════════════════════════════════════
    describe('POST /auth/login', () => {

        describe('Login exitoso', () => {

            it('[CRITERIO 14] debe retornar 200 con access_token cuando las credenciales son correctas', async () => {
                // ARRANGE
                authService.login!.mockResolvedValue({
                    access_token: 'test-jwt-token',
                    user: {
                        id: 'uuid-123',
                        email: 'juan@empresa.com',
                        firstName: 'Juan',
                        lastName: 'Pérez',
                        company: 'ACME Corp',
                    },
                });

                // ACT
                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send(validLoginBody);

                // ASSERT
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('access_token');
                expect(response.body.access_token).toBe('test-jwt-token');
                expect(response.body).toHaveProperty('user');
            });
        });

        describe('Credenciales incorrectas', () => {

            it('[CRITERIO 15] debe retornar 401 cuando el email no existe', async () => {
                // ARRANGE
                authService.login!.mockRejectedValue(
                    new UnauthorizedException('El correo o la contraseña son incorrectos'),
                );

                // ACT
                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'noexiste@empresa.com',
                        password: 'Password1',
                    });

                // ASSERT
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('El correo o la contraseña son incorrectos');
            });

            it('[CRITERIO 15] debe retornar 401 cuando la contraseña es incorrecta', async () => {
                // ARRANGE
                authService.login!.mockRejectedValue(
                    new UnauthorizedException('El correo o la contraseña son incorrectos'),
                );

                // ACT
                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'juan@empresa.com',
                        password: 'WrongPass1',
                    });

                // ASSERT
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('El correo o la contraseña son incorrectos');
            });

            it('[CRITERIO 15] el body del 401 debe ser idéntico sin importar si falla el email o la contraseña', async () => {
                // ARRANGE — mismo error para ambos casos
                const errorMessage = 'El correo o la contraseña son incorrectos';
                authService.login!.mockRejectedValue(
                    new UnauthorizedException(errorMessage),
                );

                // ACT — caso 1: email no existe
                const responseEmailFail = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: 'noexiste@empresa.com', password: 'Password1' });

                // ACT — caso 2: contraseña incorrecta
                const responsePasswordFail = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: 'juan@empresa.com', password: 'WrongPass1' });

                // ASSERT
                expect(responseEmailFail.status).toBe(401);
                expect(responsePasswordFail.status).toBe(401);
                expect(responseEmailFail.body.message).toBe(responsePasswordFail.body.message);
                expect(responseEmailFail.body.message).toBe(errorMessage);
            });
        });
    });
});
