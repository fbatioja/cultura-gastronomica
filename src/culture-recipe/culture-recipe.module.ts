import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { RecipeEntity } from '../recipe/recipe.entity';
import { CultureRecipeService } from './culture-recipe.service';
import { CultureRecipeController } from './culture-recipe.controller';
import { CultureRecipeResolver } from './culture-recipe.resolver';

@Module({
  providers: [CultureRecipeService, CultureRecipeResolver],
  imports: [TypeOrmModule.forFeature([RecipeEntity, CultureEntity]), CacheModule.register()],
  controllers: [CultureRecipeController],
})
export class CultureRecipeModule {}
