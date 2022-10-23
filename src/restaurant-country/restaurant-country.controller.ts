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
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CountryDto } from 'src/country/country.dto';
import { CountryEntity } from 'src/country/country.entity';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { Role } from 'src/user/role.enum';
import { Roles } from 'src/user/roles.decorator';
import { RestaurantCountryService } from './retaurant-country.service';

@Controller('restaurants')
@UseInterceptors(BusinessErrorsInterceptor)
export class RestaurantCountryController {
  constructor(
    private readonly restaurantCountryService: RestaurantCountryService,
  ) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':restaurantId/countries/:countryId')
  async addCountryRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('countryId') countryId: string,
  ) {
    return await this.restaurantCountryService.associateCountryRestaurant(
      restaurantId,
      countryId,
    );
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':restaurantId/countries')
  async findCountryByRestaurantId(@Param('restaurantId') restaurantId: string) {
    return await this.restaurantCountryService.findCountryByRestaurantId(
      restaurantId,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':restaurantId/countries/:countryId')
  async associateCountryRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('countryId') countryId: string,
  ) {
    return await this.restaurantCountryService.associateCountryRestaurant(
      restaurantId,
      countryId,
    );
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':restaurantId/countries/:countryId')
  @HttpCode(204)
  async deleteCountryRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('countryId') countryId: string,
  ) {
    return await this.restaurantCountryService.deleteRestaurantCountry(
      countryId,
      restaurantId,
    );
  }
}
