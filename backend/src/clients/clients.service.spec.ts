import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client, ClientStatus } from './entities/client.entity';

describe('ClientsService', () => {
  let service: ClientsService;
  const clientRepository = {
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const existingClient: Client = {
    id: 'client-1',
    firstName: 'Ana',
    lastName: 'Lopez',
    company: 'Acme',
    email: 'ana@acme.com',
    phone: '3001112233',
    status: ClientStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getRepositoryToken(Client), useValue: clientRepository },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('[CRITERIO 53] remove elimina cliente y retorna mensaje de exito', async () => {
    clientRepository.findOne.mockResolvedValue(existingClient);
    clientRepository.remove.mockResolvedValue(existingClient);

    const response = await service.remove(existingClient.id);

    expect(clientRepository.findOne).toHaveBeenCalledWith({ where: { id: existingClient.id } });
    expect(clientRepository.remove).toHaveBeenCalledWith(existingClient);
    expect(response).toEqual({ message: 'El cliente ha sido eliminado correctamente' });
  });

  it('[CRITERIO 53] remove lanza NotFoundException si cliente no existe', async () => {
    clientRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('[CRITERIO 53] remove lanza error interno si falla la eliminacion', async () => {
    clientRepository.findOne.mockResolvedValue(existingClient);
    clientRepository.remove.mockRejectedValue(new Error('db failure'));

    await expect(service.remove(existingClient.id)).rejects.toThrow(InternalServerErrorException);
  });
});
