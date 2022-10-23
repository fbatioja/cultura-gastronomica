import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProductCategoryService } from './product-category.service';
import { Role } from '../user/role.enum';
import { Roles } from '../user/roles.decorator';

@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':productId/category')
  async findCategoryByProductId(@Param('productId') productId: string) {
    return await this.productCategoryService.findCategoryByProductId(productId);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':productId/category/:categoryId')
  async update(
    @Param('productId') productId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return await this.productCategoryService.associateProductCategory(
      productId,
      categoryId,
    );
  }
}
