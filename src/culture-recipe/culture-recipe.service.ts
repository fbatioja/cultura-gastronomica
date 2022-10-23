import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { RecipeEntity } from '../recipe/recipe.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

@Injectable()
export class CultureRecipeService {
  private readonly cultureNotFoundMessage: string =
    'La cultura con el id dado no fue encontrado';
  private readonly recipeNotFoundMessage: string =
    'La receta con el id dado no fue encontrado';
  private readonly associationNotFoundMessage: string =
    'EL pais no tiene una asociación con la reseta dada';

  cacheKey: string = 'culture-recipe';
  constructor(
    @InjectRepository(CultureEntity)
    private readonly cultureRepository: Repository<CultureEntity>,

    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async addRecipeCulture(
    cultureId: string,
    recipeId: string,
  ): Promise<CultureEntity> {
    const [recipe, culture] = await Promise.all([
      this.recipeRepository.findOne({
        where: { id: recipeId },
      }),
      this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['recipes'],
      }),
    ]);
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!recipe)
      throw new BusinessLogicException(
        this.recipeNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    culture.recipes.push(recipe);
    return await this.cultureRepository.save(culture);
  }

  async findRecipeByCultureId(
    cultureId: string,
    recipeId: string,
  ): Promise<RecipeEntity> {
    const cached: RecipeEntity = await this.cacheManager.get<RecipeEntity>(
      `${this.cacheKey}-${cultureId}-${recipeId}`,
    );
    if (!cached) {
      const [recipe, culture] = await Promise.all([
        this.recipeRepository.findOne({
          where: { id: recipeId },
        }),
        this.cultureRepository.findOne({
          where: { id: cultureId },
          relations: ['recipes'],
        }),
      ]);
      if (!recipe)
        throw new BusinessLogicException(
          this.recipeNotFoundMessage,
          BusinessError.NOT_FOUND,
        );
      if (!culture)
        throw new BusinessLogicException(
          this.cultureNotFoundMessage,
          BusinessError.NOT_FOUND,
        );

      const cultureRecipe: RecipeEntity = culture.recipes.find(
        ({ id }) => recipe.id === id,
      );

      if (!cultureRecipe)
        throw new BusinessLogicException(
          this.associationNotFoundMessage,
          BusinessError.PRECONDITION_FAILED,
        );

      await this.cacheManager.set(
        `${this.cacheKey}-${cultureId}-${recipeId}`,
        cultureRecipe,
      );

      return cultureRecipe;
    }
    return cached;
  }

  async findRecipesByCultureId(cultureId: string): Promise<RecipeEntity[]> {
    const cached: RecipeEntity[] = await this.cacheManager.get<RecipeEntity[]>(
      `${this.cacheKey}-${cultureId}`,
    );
    if (!cached) {
      const culture: CultureEntity = await this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['recipes'],
      });
      if (!culture)
        throw new BusinessLogicException(
          this.cultureNotFoundMessage,
          BusinessError.NOT_FOUND,
        );

      await this.cacheManager.set(
        `${this.cacheKey}-${cultureId}`,
        culture.recipes,
        { ttl: 0 },
      );
      return culture.recipes;
    }
    return cached;
  }

  async deleteRecipeCulture(cultureId: string, recipeId: string) {
    const [recipe, culture] = await Promise.all([
      this.recipeRepository.findOne({
        where: { id: recipeId },
      }),
      this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['recipes'],
      }),
    ]);
    if (!recipe)
      throw new BusinessLogicException(
        this.recipeNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const recipeCulture: RecipeEntity = culture.recipes.find(
      ({ id }) => id === recipe.id,
    );

    if (!recipeCulture)
      throw new BusinessLogicException(
        this.associationNotFoundMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    culture.recipes = culture.recipes.filter(
      ({ id }) => id !== recipeCulture.id,
    );
    await this.cultureRepository.save(culture);
  }
}
