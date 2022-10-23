import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { RecipeEntity } from './recipe.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class RecipeService {
  private readonly notFoundMessage: string =
    'La receta con el id dado no fue encontrado';

  cacheKey: string = 'recipes';

  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<RecipeEntity[]> {
    const cached: RecipeEntity[] = await this.cacheManager.get<RecipeEntity[]>(
      this.cacheKey,
    );
    if (!cached) {
      const recipes: RecipeEntity[] = await this.recipeRepository.find();
      await this.cacheManager.set(this.cacheKey, recipes);
      return recipes;
    }
    return cached;
  }

  async findOne(id: string): Promise<RecipeEntity> {
    const cached: RecipeEntity = await this.cacheManager.get<RecipeEntity>(
      `${this.cacheKey}-${id}`,
    );
    if (!cached) {
      const recipe: RecipeEntity = await this.recipeRepository.findOne({
        where: { id },
        relations: ['culture'],
      });
      if (!recipe) {
        throw new BusinessLogicException(
          this.notFoundMessage,
          BusinessError.NOT_FOUND,
        );
      }
      await this.cacheManager.set(`${this.cacheKey}-${id}`, recipe);
      return recipe;
    }
    return cached;
  }

  async create(recipe: RecipeEntity): Promise<RecipeEntity> {
    return await this.recipeRepository.save(recipe);
  }

  async update(id: string, recipe: RecipeEntity): Promise<RecipeEntity> {
    const dbRecipe: RecipeEntity = await this.recipeRepository.findOne({
      where: { id },
    });
    if (!dbRecipe) {
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );
    }

    return await this.recipeRepository.save({ ...dbRecipe, ...recipe });
  }

  async delete(id: string) {
    const recipe: RecipeEntity = await this.recipeRepository.findOne({
      where: { id },
    });
    if (!recipe) {
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );
    }
    await this.recipeRepository.remove(recipe);
  }
}
