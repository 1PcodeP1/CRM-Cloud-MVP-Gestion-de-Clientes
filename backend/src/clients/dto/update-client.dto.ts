import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ClientStatus } from '../entities/client.entity';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEmail({}, { message: 'Ingresa una dirección de correo válida' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'El teléfono solo debe contener números' })
  @Length(10, 10, { message: 'El teléfono debe tener 10 dígitos' })
  phone?: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}
