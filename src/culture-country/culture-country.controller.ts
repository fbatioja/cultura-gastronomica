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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { Role } from 'src/user/role.enum';
import { Roles } from 'src/user/roles.decorator';
import { CultureCountryService } from './culture-country.service';

@Controller('cultures')
@UseInterceptors(BusinessErrorsInterceptor)
export class CultureCountryController {
  constructor(private readonly cultureCountryService: CultureCountryService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':cultureId/countries/:countryId')
  async addCountryCulture(
    @Param('cultureId') cultureId: string,
    @Param('countryId') countryId: string,
  ) {
    return await this.cultureCountryService.addCountryCulture(
      cultureId,
      countryId,
    );
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':cultureId/countries')
  async findCountriesByCultureId(@Param('cultureId') cultureId: string) {
    return await this.cultureCountryService.findCountriesByCultureId(cultureId);
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':cultureId/countries/:countryId')
  @HttpCode(204)
  async deleteCountryCulture(
    @Param('cultureId') cultureId: string,
    @Param('countryId') countryId: string,
  ) {
    return await this.cultureCountryService.deleteCountryCulture(
      cultureId,
      countryId,
    );
  }
}
