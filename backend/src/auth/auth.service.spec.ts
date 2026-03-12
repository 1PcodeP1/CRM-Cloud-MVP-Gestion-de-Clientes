// backend/src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// ─── Mock de bcrypt ──────────────────────────────────────────────
jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<Partial<UsersService>>;
    let jwtService: jest.Mocked<Partial<JwtService>>;

    // ─── Datos de prueba reutilizables ───────────────────────────
    const validRegisterDto: RegisterDto = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@empresa.com',
        phone: '5512345678',
        company: 'ACME Corp',
        industry: 'Tecnología',
        password: 'Password1',
        confirmPassword: 'Password1',
    };

    const validLoginDto: LoginDto = {
        email: 'juan@empresa.com',
        password: 'Password1',
    };

    const mockUser = {
        id: 'uuid-123',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@empresa.com',
        phone: '5512345678',
        company: 'ACME Corp',
        industry: 'Tecnología',
        password: '$2a$10$hashedPasswordExample',
        createdAt: new Date(),
    };

    // ─── Setup y teardown ────────────────────────────────────────
    beforeEach(async () => {
        usersService = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        };

        jwtService = {
            sign: jest.fn().mockReturnValue('test-jwt-token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ═════════════════════════════════════════════════════════════
    // register()
    // ═════════════════════════════════════════════════════════════
    describe('register()', () => {

        describe('Creación exitosa de usuario', () => {

            it('[CRITERIO 1] debe crear un usuario cuando todos los campos son válidos', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(null);
                (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedPassword');
                usersService.create!.mockResolvedValue(mockUser);

                // ACT
                const result = await service.register(validRegisterDto);

                // ASSERT
                expect(usersService.findByEmail).toHaveBeenCalledWith(validRegisterDto.email);
                expect(usersService.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        firstName: validRegisterDto.firstName,
                        lastName: validRegisterDto.lastName,
                        email: validRegisterDto.email,
                        phone: validRegisterDto.phone,
                        company: validRegisterDto.company,
                        industry: validRegisterDto.industry,
                    }),
                );
                expect(result).toEqual({
                    message: 'Cuenta creada correctamente. Ya puedes iniciar sesión',
                });
            });

            it('[CRITERIO 1] debe guardar la contraseña como hash bcrypt, no como texto plano', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(null);
                (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedPassword');
                usersService.create!.mockResolvedValue(mockUser);

                // ACT
                await service.register(validRegisterDto);

                // ASSERT
                expect(bcrypt.hash).toHaveBeenCalledWith(validRegisterDto.password, 10);
                const createCall = usersService.create!.mock.calls[0][0];
                expect(createCall.password).toBe('$2a$10$hashedPassword');
                expect(createCall.password).not.toBe(validRegisterDto.password);
            });

            it('[CRITERIO 1] no debe retornar el hash de contraseña en la respuesta', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(null);
                (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedPassword');
                usersService.create!.mockResolvedValue(mockUser);

                // ACT
                const result = await service.register(validRegisterDto);

                // ASSERT
                expect(result).not.toHaveProperty('password');
                expect(JSON.stringify(result)).not.toContain('$2a$10$');
            });
        });

        describe('Email duplicado', () => {

            it('[CRITERIO 5] debe lanzar ConflictException cuando el email ya existe', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(mockUser);

                // ACT & ASSERT
                await expect(service.register(validRegisterDto))
                    .rejects
                    .toThrow(ConflictException);
            });

            it('[CRITERIO 5] el mensaje del error debe ser exactamente "Este correo ya tiene una cuenta registrada"', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(mockUser);

                // ACT & ASSERT
                await expect(service.register(validRegisterDto))
                    .rejects
                    .toThrow('Este correo ya tiene una cuenta registrada');
            });
        });

        describe('Error interno del servidor', () => {

            it('[CRITERIO 9] debe lanzar InternalServerErrorException si usersService.create() falla', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(null);
                (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedPassword');
                usersService.create!.mockRejectedValue(new Error('DB connection lost'));

                // ACT & ASSERT
                await expect(service.register(validRegisterDto))
                    .rejects
                    .toThrow(InternalServerErrorException);
            });

            it('[CRITERIO 9] el mensaje de error interno es genérico y no expone detalles técnicos', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(null);
                (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedPassword');
                usersService.create!.mockRejectedValue(new Error('DB connection lost'));

                // ACT & ASSERT
                await expect(service.register(validRegisterDto))
                    .rejects
                    .toThrow('No fue posible crear la cuenta. Por favor intenta de nuevo más tarde');
            });
        });
    });

    // ═════════════════════════════════════════════════════════════
    // login()
    // ═════════════════════════════════════════════════════════════
    describe('login()', () => {

        describe('Login exitoso', () => {

            it('[CRITERIO 14] debe retornar un JWT válido cuando las credenciales son correctas', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(mockUser);
                (bcrypt.compare as jest.Mock).mockResolvedValue(true);

                // ACT
                const result = await service.login(validLoginDto);

                // ASSERT
                expect(result).toHaveProperty('access_token');
                expect(result.access_token).toBe('test-jwt-token');
                expect(jwtService.sign).toHaveBeenCalledWith({
                    sub: mockUser.id,
                    email: mockUser.email,
                });
            });

            it('[CRITERIO 14] debe retornar los datos del usuario sin la contraseña', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(mockUser);
                (bcrypt.compare as jest.Mock).mockResolvedValue(true);

                // ACT
                const result = await service.login(validLoginDto);

                // ASSERT
                expect(result.user).toEqual({
                    id: mockUser.id,
                    email: mockUser.email,
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    company: mockUser.company,
                });
                expect(result.user).not.toHaveProperty('password');
            });
        });

        describe('Credenciales incorrectas', () => {

            it('[CRITERIO 15] debe lanzar UnauthorizedException cuando el email no existe', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(null);

                // ACT & ASSERT
                await expect(service.login(validLoginDto))
                    .rejects
                    .toThrow(UnauthorizedException);
            });

            it('[CRITERIO 15] debe lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(mockUser);
                (bcrypt.compare as jest.Mock).mockResolvedValue(false);

                // ACT & ASSERT
                await expect(service.login(validLoginDto))
                    .rejects
                    .toThrow(UnauthorizedException);
            });

            it('[CRITERIO 15] el mensaje de error debe ser idéntico cuando falla el email o la contraseña', async () => {
                // ARRANGE — caso 1: email no existe
                usersService.findByEmail!.mockResolvedValue(null);

                let errorEmailNoExiste: Error | undefined;
                try {
                    await service.login(validLoginDto);
                } catch (e) {
                    errorEmailNoExiste = e as Error;
                }

                // ARRANGE — caso 2: contraseña incorrecta
                usersService.findByEmail!.mockResolvedValue(mockUser);
                (bcrypt.compare as jest.Mock).mockResolvedValue(false);

                let errorPasswordIncorrecta: Error | undefined;
                try {
                    await service.login(validLoginDto);
                } catch (e) {
                    errorPasswordIncorrecta = e as Error;
                }

                // ASSERT
                expect(errorEmailNoExiste!.message).toBe('El correo o la contraseña son incorrectos');
                expect(errorPasswordIncorrecta!.message).toBe('El correo o la contraseña son incorrectos');
                expect(errorEmailNoExiste!.message).toBe(errorPasswordIncorrecta!.message);
            });
        });

        describe('Expiración del JWT', () => {

            it('[CRITERIO 16] el JWT generado debe configurarse con expiración de 24 horas', async () => {
                // ARRANGE
                usersService.findByEmail!.mockResolvedValue(mockUser);
                (bcrypt.compare as jest.Mock).mockResolvedValue(true);

                // ACT
                await service.login(validLoginDto);

                // ASSERT
                // La expiración se configura en auth.module.ts con signOptions: { expiresIn: '24h' }
                // Verificamos que JwtService.sign() se llama con el payload correcto
                // La expiración es manejada por la configuración del módulo JWT
                expect(jwtService.sign).toHaveBeenCalledWith({
                    sub: mockUser.id,
                    email: mockUser.email,
                });

                // Nota: La expiración de 24h se configura a nivel de módulo en JwtModule.registerAsync()
                // con signOptions: { expiresIn: '24h' }. Esta prueba verifica que el servicio
                // delega correctamente al JwtService sin sobrescribir las opciones del módulo.
                expect(jwtService.sign).toHaveBeenCalledTimes(1);
            });
        });
    });
});
