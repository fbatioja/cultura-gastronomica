import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class CategoryService {
  cacheKey = 'category';

  private readonly notFoundMessage: string =
    'La categoria con el id dado no fue encontrada';

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<CategoryEntity[]> {
    const cached: CategoryEntity[] = await this.cacheManager.get<
      CategoryEntity[]
    >(this.cacheKey);

    if (!cached) {
      const categories: CategoryEntity[] = await this.categoryRepository.find({
        relations: ['products'],
      });
      await this.cacheManager.set(this.cacheKey, categories);

      return categories;
    }

    return cached;
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const category: CategoryEntity = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    return category;
  }

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    return await this.categoryRepository.save(category);
  }

  async update(id: string, category: CategoryEntity): Promise<CategoryEntity> {
    const persistedCategory: CategoryEntity =
      await this.categoryRepository.findOne({ where: { id } });
    if (!persistedCategory)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    category.id = id;

    return await this.categoryRepository.save(category);
  }

  async delete(id: string) {
    const category: CategoryEntity = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    await this.categoryRepository.remove(category);
  }
}
