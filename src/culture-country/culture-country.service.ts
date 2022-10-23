import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CountryEntity } from '../country/country.entity';
import { CultureEntity } from '../culture/culture.entity';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

@Injectable()
export class CultureCountryService {
  cacheKey = 'culture-country';
  private readonly cultureNotFoundMessage: string =
    'La cultura con el id dado no fue encontrado';
  private readonly countryNotFoundMessage: string =
    'El país con el id dado no fue encontrado';
  private readonly countryNotAssociatedMessage: string =
    'El país con el id dado no está asociado a la cultura';

  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(CultureEntity)
    private readonly cultureRepository: Repository<CultureEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async addCountryCulture(
    cultureId: string,
    countryId: string,
  ): Promise<CultureEntity> {
    const country: CountryEntity = await this.countryRepository.findOne({
      where: { id: countryId },
    });
    if (!country)
      throw new BusinessLogicException(
        this.countryNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const culture: CultureEntity = await this.cultureRepository.findOne({
      where: { id: cultureId },
      relations: ['countries'],
    });
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    culture.countries = [...culture.countries, country];
    return await this.cultureRepository.save(culture);
  }

  async findCountryByCultureIdCountryId(
    cultureId: string,
    countryId: string,
  ): Promise<CountryEntity> {
    const country: CountryEntity = await this.checkCountry(countryId);

    const culture: CultureEntity = await this.checkCulture(cultureId);

    const cultureCountry: CountryEntity = await this.checkCultureCountry(
      culture,
      country,
    );

    return cultureCountry;
  }

  private async checkCultureCountry(
    culture: CultureEntity,
    country: CountryEntity,
  ) {
    const cultureCountry: CountryEntity = await culture.countries.find(
      (e) => e.id === country.id,
    );

    if (!cultureCountry)
      throw new BusinessLogicException(
        this.countryNotAssociatedMessage,
        BusinessError.PRECONDITION_FAILED,
      );
    return cultureCountry;
  }

  private async checkCulture(cultureId: string) {
    const culture: CultureEntity = await this.cultureRepository.findOne({
      where: { id: cultureId },
      relations: ['countries'],
    });
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    return culture;
  }

  private async checkCountry(countryId: string) {
    const country: CountryEntity = await this.countryRepository.findOne({
      where: { id: countryId },
    });
    if (!country)
      throw new BusinessLogicException(
        this.countryNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    return country;
  }

  async findCountriesByCultureId(cultureId: string): Promise<CountryEntity[]> {
    const cached: CountryEntity[] = await this.cacheManager.get<
      CountryEntity[]
    >(this.cacheKey + cultureId);

    if (!cached) {
      const culture: CultureEntity = await this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['countries'],
      });
      if (!culture)
        throw new BusinessLogicException(
          this.cultureNotFoundMessage,
          BusinessError.NOT_FOUND,
        );
      await this.cacheManager.set(this.cacheKey + cultureId, culture.countries);
      return culture.countries;
    }
    return cached;
  }

  async associateCountriesCulture(
    cultureId: string,
    countries: CountryEntity[],
  ): Promise<CultureEntity> {
    const culture: CultureEntity = await this.cultureRepository.findOne({
      where: { id: cultureId },
      relations: ['countries'],
    });

    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < countries.length; i++) {
      const country: CountryEntity = await this.countryRepository.findOne({
        where: { id: countries[i].id },
      });
      if (!country)
        throw new BusinessLogicException(
          this.countryNotFoundMessage,
          BusinessError.NOT_FOUND,
        );
    }

    culture.countries = countries;
    return await this.cultureRepository.save(culture);
  }

  async deleteCountryCulture(cultureId: string, countryId: string) {
    const country: CountryEntity = await this.checkCountry(countryId);

    const culture: CultureEntity = await this.checkCulture(cultureId);

    await this.checkCultureCountry(culture, country);

    culture.countries = culture.countries.filter((e) => e.id !== countryId);
    await this.cultureRepository.save(culture);
  }
}
