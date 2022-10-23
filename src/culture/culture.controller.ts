import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { CultureDto } from './culture.dto';
import { CultureEntity } from './culture.entity';
import { CultureService } from './culture.service';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/user/role.enum';
import { Roles } from 'src/user/roles.decorator';

@Controller('cultures')
@UseInterceptors(BusinessErrorsInterceptor)
export class CultureController {
  constructor(private readonly cultureService: CultureService) {}

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return await this.cultureService.findAll();
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':cultureId')
  async findOne(@Param('cultureId') cultureId: string) {
    return await this.cultureService.findOne(cultureId);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() cultureDto: CultureDto) {
    const culture: CultureEntity = plainToInstance(CultureEntity, cultureDto);
    return await this.cultureService.create(culture);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':cultureId')
  async update(
    @Param('cultureId') cultureId: string,
    @Body() cultureDto: CultureDto,
  ) {
    const culture: CultureEntity = plainToInstance(CultureEntity, cultureDto);
    return await this.cultureService.update(cultureId, culture);
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':cultureId')
  @HttpCode(204)
  async delete(@Param('cultureId') cultureId: string) {
    return await this.cultureService.delete(cultureId);
  }
}
