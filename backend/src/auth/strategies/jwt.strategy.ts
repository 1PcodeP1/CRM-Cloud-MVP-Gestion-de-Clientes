import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'super-secret-key-replace-in-production',
        });
    }

    async validate(payload: { sub: string; email: string }) {
        // This payload is automatically extracted and validated by passport-jwt
        const user = await this.usersService.findByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException('Tu sesión ha expirado. Por favor ingresa de nuevo');
        }
        // We attach the user to the request object
        return { id: payload.sub, email: payload.email };
    }
}
