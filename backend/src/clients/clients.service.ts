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

  async remove(id: string): Promise<{ message: string }> {
    const client = await this.findOne(id);

    try {
      await this.clientRepository.remove(client);
      return { message: 'El cliente ha sido eliminado correctamente' };
    } catch {
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }

  async getMonthlyStats() {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      months.push({
        name: monthNames[start.getMonth()],
        startDate: start,
        endDate: end,
      });
    }

    const stats = await Promise.all(
      months.map(async (m) => {
        const count = await this.clientRepository.createQueryBuilder('client')
          .where('client.createdAt >= :start', { start: m.startDate })
          .andWhere('client.createdAt <= :end', { end: m.endDate })
          .getCount();
          
        return {
          month: m.name,
          newClients: count,
        };
      })
    );

    let variation = 0;
    let variationText = '0% respecto al mes anterior';
    
    if (stats.length >= 2) {
      const current = stats[5].newClients;
      const previous = stats[4].newClients;
      
      if (previous === 0) {
        if (current > 0) {
           variation = 100;
           variationText = '+100% respecto al mes anterior';
        }
      } else {
        variation = Math.round(((current - previous) / previous) * 100);
        const sign = variation > 0 ? '+' : '';
        variationText = `${sign}${variation}% respecto al mes anterior`;
      }
    }

    return {
      data: stats,
      variationText,
      variationValue: variation
    };
  }

  async getAttentionClients() {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const clients = await this.clientRepository.createQueryBuilder('client')
      .where('client.status = :inactiveStatus', { inactiveStatus: 'Inactivo' })
      .orWhere('client.updatedAt < :tenDaysAgo', { tenDaysAgo })
      .orderBy('client.updatedAt', 'ASC') // Oldest first (highest time without activity)
      .take(4)
      .getMany();

    return clients.map((client) => {
      const msDiff = new Date().getTime() - new Date(client.updatedAt).getTime();
      const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      
      let reason = '';
      if (client.status === 'Inactivo') {
        reason = 'Inactivo';
      } else {
        reason = `${daysDiff} días sin actividad`;
      }

      return {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        company: client.company,
        reason,
      };
    });
  }
}
