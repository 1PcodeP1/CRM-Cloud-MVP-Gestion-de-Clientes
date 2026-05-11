import { Controller, Get, Post, Body, Query, UseGuards, Param, Put, Delete, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto, @Req() req: any) {
    return this.clientsService.create(createClientDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Req() req: any,
  ) {
    return this.clientsService.findAll({ page, limit, search, status }, req.user.id);
  }

  @Get('attention')
  getAttentionClients(@Req() req: any) {
    return this.clientsService.getAttentionClients(req.user.id);
  }

  @Get('stats/monthly')
  getMonthlyStats(@Req() req: any) {
    return this.clientsService.getMonthlyStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.clientsService.findOneForUser(id, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @Req() req: any) {
    return this.clientsService.update(id, updateClientDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.clientsService.removeOwned(id, req.user.id);
  }
}
