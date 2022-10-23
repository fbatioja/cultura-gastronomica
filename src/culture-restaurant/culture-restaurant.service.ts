import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

@Injectable()
export class CultureRestaurantService {
  private readonly cultureNotFoundMessage: string =
    'La cultura con el id dado no fue encontrado';
  private readonly restaurantNotFoundMessage: string =
    'El restaurante con el id dado no fue encontrado';
  private readonly associationNotFoundMessage: string =
    'El restaurante no tiene una asociación con la cultura dada';

  cacheKey: string = "culture-restaurant";

  constructor(
    @InjectRepository(CultureEntity)
    private readonly cultureRepository: Repository<CultureEntity>,

    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async addRestaurantCulture(
    cultureId: string,
    restaurantId: string,
  ): Promise<CultureEntity> {
    const [restaurant, culture] = await Promise.all([
      this.restaurantRepository.findOne({
        where: { id: restaurantId },
      }),
      this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['restaurants'],
      }),
    ]);
    if (!restaurant)
      throw new BusinessLogicException(
        this.restaurantNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    culture.restaurants.push(restaurant);
    return await this.cultureRepository.save(culture);
  }

  async findRestaurantByCultureId(
    cultureId: string,
    restaurantId: string,
  ): Promise<RestaurantEntity> {
    const [restaurant, culture] = await Promise.all([
      this.restaurantRepository.findOne({
        where: { id: restaurantId },
      }),
      this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['restaurants'],
      }),
    ]);
    if (!restaurant)
      throw new BusinessLogicException(
        this.restaurantNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const culturerestaurant: RestaurantEntity = culture.restaurants.find(
      ({ id }) => restaurant.id === id,
    );

    if (!culturerestaurant)
      throw new BusinessLogicException(
        this.associationNotFoundMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    return culturerestaurant;
  }

  async findRestaurantsByCultureId(cultureId: string): Promise<RestaurantEntity[]> {
    
    const cached: RestaurantEntity[] = await this.cacheManager.
    get<RestaurantEntity[]>(this.cacheKey + cultureId);

    if (!cached) {
      const culture: CultureEntity = await this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['restaurants'],
      });
      if (!culture)
        throw new BusinessLogicException(
          this.cultureNotFoundMessage,
          BusinessError.NOT_FOUND,
        );
      await this.cacheManager.set(this.cacheKey + cultureId, culture.restaurants);
      return culture.restaurants;
    }
    return cached;
  }

  async deleteRestaurantCulture(cultureId: string, restaurantId: string) {
    const [restaurant, culture] = await Promise.all([
      this.restaurantRepository.findOne({
        where: { id: restaurantId },
      }),
      this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['restaurants'],
      }),
    ]);
    if (!restaurant)
      throw new BusinessLogicException(
        this.restaurantNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const restaurantCulture: RestaurantEntity = culture.restaurants.find(
      ({ id }) => id === restaurant.id,
    );

    if (!restaurantCulture)
      throw new BusinessLogicException(
        this.associationNotFoundMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    culture.restaurants = culture.restaurants.filter(
      ({ id }) => id !== restaurantCulture.id,
    );
    await this.cultureRepository.save(culture);
  }
}
