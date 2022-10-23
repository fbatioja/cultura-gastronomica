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
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProductDto } from './product.dto';
import { ProductEntity } from './product.entity';
import { ProductService } from './product.service';
import { Role } from '../user/role.enum';
import { Roles } from '../user/roles.decorator';

@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return await this.productService.findAll();
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':productId')
  async findOne(@Param('productId') productId: string) {
    return await this.productService.findOne(productId);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() productDto: ProductDto) {
    const product: ProductEntity = plainToInstance(ProductEntity, productDto);
    return await this.productService.create(product);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':productId')
  async update(
    @Param('productId') productId: string,
    @Body() productDto: ProductDto,
  ) {
    const product: ProductEntity = plainToInstance(ProductEntity, productDto);
    return await this.productService.update(productId, product);
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':productId')
  @HttpCode(204)
  async delete(@Param('productId') productId: string) {
    return await this.productService.delete(productId);
  }
}
