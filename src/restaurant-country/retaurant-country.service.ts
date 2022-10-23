import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CountryEntity } from '../country/country.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

@Injectable()
export class RestaurantCountryService {
  private readonly restaurantNotFoundMessage: string =
    'El restaurante con el id dado no fue encontrado';
  private readonly countryNotFoundMessage: string =
    'El país con el id dado no fue encontrado';
  private readonly associationNotFoundMessage: string =
    'El restaurante no tiene una asociación con el pais dado';

  cacheKey = 'restaurant-country';

  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,

    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async associateCountryRestaurant(
    restaurantId: string,
    countryId: string,
  ): Promise<RestaurantEntity> {
    const country: CountryEntity = await this.countryRepository.findOne({
      where: { id: countryId },
    });
    if (!country)
      throw new BusinessLogicException(
        this.countryNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const restaurant: RestaurantEntity =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['country'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        this.restaurantNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    restaurant.country = country;
    return await this.restaurantRepository.save(restaurant);
  }

  async findCountryByRestaurantId(
    restaurantId: string,
  ): Promise<CountryEntity> {
    const cached: CountryEntity = await this.cacheManager.get<CountryEntity>(
      this.cacheKey + restaurantId,
    );

    if (!cached) {
      const restaurant: RestaurantEntity =
        await this.restaurantRepository.findOne({
          where: { id: restaurantId },
          relations: ['country'],
        });
      if (!restaurant)
        throw new BusinessLogicException(
          this.restaurantNotFoundMessage,
          BusinessError.NOT_FOUND,
        );
      await this.cacheManager.set(
        this.cacheKey + restaurantId,
        restaurant.country,
      );
      return restaurant.country;
    }
    return cached;
  }

  async deleteRestaurantCountry(countryId: string, restaurantId: string) {
    const [restaurant, country] = await Promise.all([
      this.restaurantRepository.findOne({
        where: { id: restaurantId },
      }),
      this.countryRepository.findOne({
        where: { id: countryId },
        relations: ['restaurants'],
      }),
    ]);
    if (!restaurant)
      throw new BusinessLogicException(
        this.restaurantNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!country)
      throw new BusinessLogicException(
        this.countryNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const restaurantCountry: RestaurantEntity = country.restaurants.find(
      ({ id }) => id === restaurant.id,
    );

    if (!restaurantCountry)
      throw new BusinessLogicException(
        this.associationNotFoundMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    country.restaurants = country.restaurants.filter(
      ({ id }) => id !== restaurantCountry.id,
    );
    await this.countryRepository.save(country);
  }
}
