import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CultureEntity } from '../culture/culture.entity';
import { RecipeEntity } from '../recipe/recipe.entity';
import { CultureRecipeService } from './culture-recipe.service';

@Resolver()
export class CultureRecipeResolver {
  constructor(private readonly cultureRecipeService: CultureRecipeService) {}

  @Query(() => [RecipeEntity])
  findRecipesByCultureId(
    @Args('cultureId') cultureId: string,
  ): Promise<RecipeEntity[]> {
    return this.cultureRecipeService.findRecipesByCultureId(cultureId);
  }

  @Query(() => RecipeEntity)
  findRecipeByCultureId(
    @Args('cultureId') cultureId: string,
    @Args('recipeId') recipeId: string,
  ): Promise<RecipeEntity> {
    return this.cultureRecipeService.findRecipeByCultureId(cultureId, recipeId);
  }

  @Mutation(() => CultureEntity)
  addRecipeCulture(
    @Args('cultureId') cultureId: string,
    @Args('recipeId') recipeId: string,
  ): Promise<CultureEntity> {
    return this.cultureRecipeService.addRecipeCulture(cultureId, recipeId);
  }

  @Mutation(() => CultureEntity)
  deleteRecipeCulture(
    @Args('cultureId') cultureId: string,
    @Args('recipeId') recipeId: string,
  ) {
    return this.cultureRecipeService.deleteRecipeCulture(cultureId, recipeId);
  }
}
