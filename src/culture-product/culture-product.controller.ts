/* eslint-disable prettier/prettier */
import { Controller, Delete, Get, HttpCode, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { Role } from 'src/user/role.enum';
import { Roles } from 'src/user/roles.decorator';
import { CultureProductService } from './culture-product.service';

@Controller('cultures')
@UseInterceptors(BusinessErrorsInterceptor)
export class CultureProductController {
  constructor(private readonly cultureProductService: CultureProductService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':cultureId/products/:productId')
  async addProductCulture(
    @Param('cultureId') cultureId: string,
    @Param('productId') productId: string,
  ) {
    return await this.cultureProductService.addProductCulture(
      cultureId,
      productId,
    );
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':cultureId/products/:productId')
  async findProductByCultureIdProductId(
    @Param('cultureId') cultureId: string,
    @Param('productId') productId: string,
  ) {
    return await this.cultureProductService.findProductByCultureId(
      cultureId,
      productId,
    );
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':cultureId/products/')
  async findProductsByCultureId(@Param('cultureId') cultureId: string) {
    return await this.cultureProductService.findProductsByCultureId(cultureId);
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':cultureId/products/:productId')
  @HttpCode(204)
  async deleteProductCulture(
    @Param('cultureId') cultureId: string,
    @Param('productId') productId: string,
  ) {
    return await this.cultureProductService.deleteProductCulture(
      cultureId,
      productId,
    );
  }
}
