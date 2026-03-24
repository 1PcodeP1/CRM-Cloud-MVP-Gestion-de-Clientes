import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ClientStatus } from '../entities/client.entity';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsEmail({}, { message: 'Ingresa una dirección de correo válida' })
  @IsNotEmpty()
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
