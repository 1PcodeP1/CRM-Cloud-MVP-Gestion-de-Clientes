import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Client, ClientStatus } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });

    if (existingClient) {
      throw new ConflictException('Ya existe un cliente registrado con este correo');
    }

    try {
      const client = this.clientRepository.create(createClientDto);
      return await this.clientRepository.save(client);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un cliente registrado con este correo');
      }
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  async findAll(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const limit = query.limit ? Number(query.limit) : 5;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clientRepository.createQueryBuilder('client');

    if (query.search) {
      queryBuilder.where(
        '(client.firstName ILIKE :search OR client.lastName ILIKE :search OR client.company ILIKE :search OR client.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status && query.status !== 'Todos') {
      queryBuilder.andWhere('client.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('client.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [clients, total] = await queryBuilder.getManyAndCount();

    return {
      data: clients,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existingEmail = await this.clientRepository.findOne({
        where: { email: updateClientDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Ya existe un cliente registrado con este correo');
      }
    }

    Object.assign(client, updateClientDto);

    try {
      return await this.clientRepository.save(client);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un cliente registrado con este correo');
      }
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }
}
