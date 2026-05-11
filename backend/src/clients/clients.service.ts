import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, ClientStatus } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    createClientDto.email = createClientDto.email.toLowerCase();
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email, userId },
    });

    if (existingClient) {
      throw new ConflictException('Ya existe un cliente registrado con este correo');
    }

    try {
      const client = this.clientRepository.create({ ...createClientDto, userId });
      return await this.clientRepository.save(client);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un cliente registrado con este correo');
      }
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  async findAll(query: { page?: number; limit?: number; search?: string; status?: string }, userId: string) {
    const limit = query.limit ? Number(query.limit) : 5;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clientRepository.createQueryBuilder('client')
      .where('client.userId = :userId', { userId });

    if (query.search) {
      queryBuilder.andWhere(
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

  // Used internally by remove() — signature unchanged to preserve test expectations
  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return client;
  }

  // Used by GET/:id, PUT/:id — verifies ownership
  private async findOneOwned(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id, userId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return client;
  }

  // Public method for controller GET/:id — enforces ownership
  async findOneForUser(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id, userId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return client;
  }

  // Public method for controller DELETE/:id — enforces ownership
  async removeOwned(id: string, userId: string): Promise<{ message: string }> {
    const client = await this.findOneForUser(id, userId);
    try {
      await this.clientRepository.remove(client);
      return { message: 'El cliente ha sido eliminado correctamente' };
    } catch {
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    const client = await this.findOneOwned(id, userId);

    if (updateClientDto.email) {
      updateClientDto.email = updateClientDto.email.toLowerCase();
    }

    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existingEmail = await this.clientRepository.findOne({
        where: { email: updateClientDto.email, userId },
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

  async getMonthlyStats(userId: string) {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      months.push({ name: monthNames[start.getMonth()], startDate: start, endDate: end });
    }

    const stats = await Promise.all(
      months.map(async (m) => {
        const count = await this.clientRepository.createQueryBuilder('client')
          .where('client.userId = :userId', { userId })
          .andWhere('client.createdAt >= :start', { start: m.startDate })
          .andWhere('client.createdAt <= :end', { end: m.endDate })
          .getCount();

        return { month: m.name, newClients: count };
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

    return { data: stats, variationText, variationValue: variation };
  }

  async getStatusCounts(userId: string): Promise<{ total: number; active: number; prospects: number; inactive: number }> {
    const rows = await this.clientRepository
      .createQueryBuilder('client')
      .select('client.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('client.userId = :userId', { userId })
      .groupBy('client.status')
      .getRawMany<{ status: string; count: string }>();

    const counts = { total: 0, active: 0, prospects: 0, inactive: 0 };
    for (const row of rows) {
      const count = parseInt(row.count, 10);
      counts.total += count;
      if (row.status === ClientStatus.ACTIVE) counts.active = count;
      else if (row.status === ClientStatus.PROSPECT) counts.prospects = count;
      else if (row.status === ClientStatus.INACTIVE) counts.inactive = count;
    }
    return counts;
  }

  async getAttentionClients(userId: string) {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const clients = await this.clientRepository.createQueryBuilder('client')
      .where('client.userId = :userId', { userId })
      .andWhere(
        '(client.status = :inactiveStatus OR (client.status != :activeStatus AND client.updatedAt < :tenDaysAgo))',
        {
          inactiveStatus: ClientStatus.INACTIVE,
          activeStatus: ClientStatus.ACTIVE,
          tenDaysAgo,
        },
      )
      .orderBy('client.updatedAt', 'ASC')
      .take(4)
      .getMany();

    return clients.map((client) => {
      const msDiff = new Date().getTime() - new Date(client.updatedAt).getTime();
      const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      const reason = client.status === ClientStatus.INACTIVE ? 'Inactivo' : `${daysDiff} días sin actividad`;

      return { id: client.id, firstName: client.firstName, lastName: client.lastName, company: client.company, reason };
    });
  }
}
