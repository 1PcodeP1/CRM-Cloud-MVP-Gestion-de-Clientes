// backend/src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'first_name', length: 100 })
    firstName!: string;

    @Column({ name: 'last_name', length: 100 })
    lastName!: string;

    @Column({ unique: true, length: 255 })
    email!: string;

    @Column({ length: 10 })
    phone!: string;

    @Column({ length: 150 })
    company!: string;

    @Column({ length: 100 })
    industry!: string;

    @Column({ length: 255 })
    password!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
