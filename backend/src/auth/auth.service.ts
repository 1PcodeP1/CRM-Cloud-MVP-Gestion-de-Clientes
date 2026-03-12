import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);

        if (existingUser) {
            throw new ConflictException('Este correo ya tiene una cuenta registrada');
        }

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

            const user = await this.usersService.create({
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                email: registerDto.email,
                phone: registerDto.phone,
                company: registerDto.company,
                industry: registerDto.industry,
                password: hashedPassword,
            });

            return {
                message: 'Cuenta creada correctamente. Ya puedes iniciar sesión',
            };
        } catch (error) {
            throw new InternalServerErrorException('No fue posible crear la cuenta. Por favor intenta de nuevo más tarde');
        }
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('El correo o la contraseña son incorrectos');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('El correo o la contraseña son incorrectos');
        }

        const payload = { sub: user.id, email: user.email };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                company: user.company,
            },
        };
    }
}
