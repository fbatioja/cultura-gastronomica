/* eslint-disable prettier/prettier */
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { CultureRestaurantService } from './culture-restaurant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/role.enum';
import { Roles } from '../user/roles.decorator';
@Controller('cultures')
@UseInterceptors(BusinessErrorsInterceptor)
export class CultureRestaurantController {
  constructor(
    private readonly cultureRestaurantService: CultureRestaurantService,
  ) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':cultureId/restaurants/:restaurantId')
  async addRestaurantCulture(
    @Param('cultureId') cultureId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return await this.cultureRestaurantService.addRestaurantCulture(
      cultureId,
      restaurantId,
    );
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':cultureId/restaurants/:restaurantId')
  async findRestaurantByCultureIdRestaurantId(
    @Param('cultureId') cultureId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return await this.cultureRestaurantService.findRestaurantByCultureId(
      cultureId,
      restaurantId,
    );
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':cultureId/restaurants/')
  async findRestaurantsByCultureId(@Param('cultureId') cultureId: string) {
    return await this.cultureRestaurantService.findRestaurantsByCultureId(
      cultureId,
    );
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':cultureId/restaurants/:restaurantId')
  @HttpCode(204)
  async deleteRestaurantCulture(
    @Param('cultureId') cultureId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return await this.cultureRestaurantService.deleteRestaurantCulture(
      cultureId,
      restaurantId,
    );
  }
}
