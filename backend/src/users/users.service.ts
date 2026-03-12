import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email: email.toLowerCase() }
        });
    }

    async create(userData: Partial<User>): Promise<User> {
        if (userData.email) {
            userData.email = userData.email.toLowerCase();
        }
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }
}
