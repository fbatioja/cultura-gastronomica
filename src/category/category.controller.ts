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
import { CategoryDto } from './category.dto';
import { CategoryEntity } from './category.entity';
import { CategoryService } from './category.service';
import { Role } from '../user/role.enum';
import { Roles } from '../user/roles.decorator';

@Controller('categories')
@UseInterceptors(BusinessErrorsInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':categoryId')
  async findOne(@Param('categoryId') categoryId: string) {
    return await this.categoryService.findOne(categoryId);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() categoryDto: CategoryDto) {
    const category: CategoryEntity = plainToInstance(
      CategoryEntity,
      categoryDto,
    );
    return await this.categoryService.create(category);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':categoryId')
  async update(
    @Param('categoryId') categoryId: string,
    @Body() categoryDto: CategoryDto,
  ) {
    const category: CategoryEntity = plainToInstance(
      CategoryEntity,
      categoryDto,
    );
    return await this.categoryService.update(categoryId, category);
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':categoryId')
  @HttpCode(204)
  async delete(@Param('categoryId') categoryId: string) {
    return await this.categoryService.delete(categoryId);
  }
}
