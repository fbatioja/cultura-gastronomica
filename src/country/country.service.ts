import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { CountryEntity } from './country.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class CountryService {
  cacheKey = 'country';
  private readonly notFoundMessage: string =
    'El país con el id dado no fue encontrado';

  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<CountryEntity[]> {
    const cached: CountryEntity[] = await this.cacheManager.get<
      CountryEntity[]
    >(this.cacheKey);

    if (!cached) {
      const country: CountryEntity[] = await this.countryRepository.find();
      await this.cacheManager.set(this.cacheKey, country);
      return country;
    }

    return cached;
  }

  async findOne(id: string): Promise<CountryEntity> {
    const country: CountryEntity = await this.countryRepository.findOne({
      where: { id },
      relations: ['cultures'],
    });
    if (!country)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    return country;
  }

  async create(country: CountryEntity): Promise<CountryEntity> {
    return await this.countryRepository.save(country);
  }

  async delete(id: string) {
    const country: CountryEntity = await this.countryRepository.findOne({
      where: { id },
    });
    if (!country)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    await this.countryRepository.remove(country);
  }
}
