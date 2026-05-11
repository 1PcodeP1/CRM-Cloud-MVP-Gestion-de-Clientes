import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';
import { ClientStatus } from '../entities/client.entity';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: 'Máximo 150 caracteres' })
  company: string;

  @IsEmail({}, { message: 'Ingresa una dirección de correo válida' })
  @IsNotEmpty()
  @MaxLength(255, { message: 'Máximo 255 caracteres' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'El teléfono solo debe contener números' })
  @Length(10, 10, { message: 'El teléfono debe tener 10 dígitos' })
  phone: string;

  @IsEnum(ClientStatus)
  @IsNotEmpty()
  status: ClientStatus;
}
