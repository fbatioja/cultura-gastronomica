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
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { RecipeDto } from './recipe.dto';
import { RecipeEntity } from './recipe.entity';
import { RecipeService } from './recipe.service';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../user/roles.decorator';
import { Role } from '../user/role.enum';

@Controller('recipes')
@UseInterceptors(BusinessErrorsInterceptor)
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return await this.recipeService.findAll();
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':recipeId')
  async finOne(@Param('recipeId') recipeId: string) {
    return await this.recipeService.findOne(recipeId);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() recipeDto: RecipeDto) {
    const recipe: RecipeEntity = plainToInstance(RecipeEntity, recipeDto);
    return await this.recipeService.create(recipe);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':recipeId')
  async update(
    @Param('recipeId') recipeId: string,
    @Body() recipeDto: RecipeDto,
  ) {
    const recipe: RecipeEntity = plainToInstance(RecipeEntity, recipeDto);
    return await this.recipeService.update(recipeId, recipe);
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':recipeId')
  @HttpCode(204)
  async delete(@Param('recipeId') recipeId: string) {
    return await this.recipeService.delete(recipeId);
  }
}
