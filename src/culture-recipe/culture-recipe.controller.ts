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
import { CultureRecipeService } from './culture-recipe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/role.enum';
import { Roles } from '../user/roles.decorator';

@Controller('cultures')
@UseInterceptors(BusinessErrorsInterceptor)
export class CultureRecipeController {
  constructor(private readonly cultureRecipeService: CultureRecipeService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':cultureId/recipes/:recipeId')
  async addRecipeCulture(
    @Param('cultureId') cultureId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return await this.cultureRecipeService.addRecipeCulture(
      cultureId,
      recipeId,
    );
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':cultureId/recipes/:recipeId')
  async findRecipeByCultureIdRecipeId(
    @Param('cultureId') cultureId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return await this.cultureRecipeService.findRecipeByCultureId(
      cultureId,
      recipeId,
    );
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':cultureId/recipes/')
  async findRecipesByCultureId(@Param('cultureId') cultureId: string) {
    return await this.cultureRecipeService.findRecipesByCultureId(cultureId);
  }

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':cultureId/recipes/:recipeId')
  @HttpCode(204)
  async deleteRecipeCulture(
    @Param('cultureId') cultureId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return await this.cultureRecipeService.deleteRecipeCulture(
      cultureId,
      recipeId,
    );
  }
}
