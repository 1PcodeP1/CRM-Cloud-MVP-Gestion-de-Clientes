// backend/src/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { IndustryType } from '../../users/entities/user.entity';

export class RegisterDto {
    @IsString({ message: 'El nombre debe ser válido' })
    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @MaxLength(100, { message: 'Máximo 100 caracteres' })
    firstName: string;

    @IsString({ message: 'El apellido debe ser válido' })
    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @MaxLength(100, { message: 'Máximo 100 caracteres' })
    lastName: string;

    @IsEmail({}, { message: 'Ingresa una dirección de correo válida' })
    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @MaxLength(255, { message: 'Máximo 255 caracteres' })
    email: string;

    @IsString({ message: 'El teléfono debe ser válido' })
    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @Matches(/^[0-9]{10}$/, { message: 'El teléfono debe tener exactamente 10 dígitos numéricos' })
    phone: string;

    @IsString({ message: 'El nombre de empresa debe ser válido' })
    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @MaxLength(150, { message: 'Máximo 150 caracteres' })
    company: string;

    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @IsEnum(IndustryType, { message: 'Industria no válida' })
    industry: string;

    @IsString({ message: 'La contraseña debe ser válida' })
    @IsNotEmpty({ message: 'Este campo es obligatorio' })
    @MinLength(8, { message: 'Mínimo 8 caracteres' })
    @MaxLength(255, { message: 'Máximo 255 caracteres' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, { message: 'La contraseña debe tener al menos 1 letra y 1 número' })
    password: string;

    @IsOptional()
    @IsString()
    confirmPassword?: string;
}
