import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ClientsController', () => {
  let app: INestApplication;
  const clientsService = {
    remove: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [{ provide: ClientsService, useValue: clientsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('[CRITERIO 53] DELETE /clients/:id debe eliminar y retornar mensaje de confirmacion', async () => {
    clientsService.remove.mockResolvedValue({
      message: 'El cliente ha sido eliminado correctamente',
    });

    const response = await request(app.getHttpServer()).delete('/clients/client-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'El cliente ha sido eliminado correctamente' });
    expect(clientsService.remove).toHaveBeenCalledWith('client-123');
  });
});
