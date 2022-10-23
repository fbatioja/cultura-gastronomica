import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { CultureEntity } from './culture.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class CultureService {
  cacheKey = 'culture';
  private readonly notFoundMessage: string =
    'La cultura con el id dado no fue encontrado';

  constructor(
    @InjectRepository(CultureEntity)
    private readonly cultureRepository: Repository<CultureEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<CultureEntity[]> {
    const cached: CultureEntity[] = await this.cacheManager.get<
      CultureEntity[]
    >(this.cacheKey);

    if (!cached) {
      const culture: CultureEntity[] = await this.cultureRepository.find();
      await this.cacheManager.set(this.cacheKey, culture);
      return culture;
    }
    return cached;
  }

  async findOne(id: string): Promise<CultureEntity> {
    const culture: CultureEntity = await this.cultureRepository.findOne({
      where: { id },
      relations: ['countries', 'recipes', 'restaurants', 'products'],
    });
    if (!culture)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    return culture;
  }

  async create(culture: CultureEntity): Promise<CultureEntity> {
    return await this.cultureRepository.save(culture);
  }

  async update(id: string, culture: CultureEntity): Promise<CultureEntity> {
    const persistedCulture: CultureEntity =
      await this.cultureRepository.findOne({ where: { id } });
    if (!persistedCulture)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    return await this.cultureRepository.save({
      ...persistedCulture,
      ...culture,
    });
  }

  async delete(id: string) {
    const culture: CultureEntity = await this.cultureRepository.findOne({
      where: { id },
    });
    if (!culture)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    await this.cultureRepository.remove(culture);
  }
}
