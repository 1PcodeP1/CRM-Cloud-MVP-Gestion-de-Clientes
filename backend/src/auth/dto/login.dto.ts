import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'El correo o la contraseña son incorrectos' })
    @IsNotEmpty({ message: 'El correo o la contraseña son incorrectos' })
    email: string;

    @IsString({ message: 'El correo o la contraseña son incorrectos' })
    @IsNotEmpty({ message: 'El correo o la contraseña son incorrectos' })
    password: string;
}
