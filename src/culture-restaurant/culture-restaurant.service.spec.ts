import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { CultureRestaurantService } from './culture-restaurant.service';
import { CacheModule } from '@nestjs/common';

describe('CultureRestaurantService', () => {
  let service: CultureRestaurantService;
  let cultureRepository: Repository<CultureEntity>;
  let restaurantRepository: Repository<RestaurantEntity>;
  let culture: CultureEntity;
  let restaurantsList: RestaurantEntity[];
  const cultureNotFoundMessage = 'La cultura con el id dado no fue encontrado';
  const restaurantNotFoundMessage =
    'El restaurante con el id dado no fue encontrado';
  const associationNotFoundMessage =
    'El restaurante no tiene una asociación con la cultura dada';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(),CacheModule.register({})],
      providers: [CultureRestaurantService],
    }).compile();

    service = module.get<CultureRestaurantService>(CultureRestaurantService);
    cultureRepository = module.get<Repository<CultureEntity>>(
      getRepositoryToken(CultureEntity),
    );
    restaurantRepository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    restaurantRepository.clear();
    cultureRepository.clear();

    restaurantsList = [];
    for (let i = 0; i < 5; i++) {
      const restaurant: RestaurantEntity = await restaurantRepository.save({
        name: faker.company.name(),
        city: faker.address.city(),
      });
      restaurantsList.push(restaurant);
    }

    culture = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      restaurants: restaurantsList,
    });
  };

  it('addRestaurantCulture should add a Restaurant to a culture', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.company.name(),
      city: faker.address.city(),
    });

    const newCulture: CultureEntity = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });

    const result: CultureEntity = await service.addRestaurantCulture(
      newCulture.id,
      newRestaurant.id,
    );

    expect(result).toBeDefined();
    expect(result.restaurants.length).toBe(1);
    expect(result.restaurants[0]).not.toBeNull();
    expect(result.restaurants[0].name).toBe(newRestaurant.name);
  });

  it('addRestaurantCulture should thrown exception for invalid Restaurant', async () => {
    const newCulture: CultureEntity = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });

    await expect(() =>
      service.addRestaurantCulture(newCulture.id, '0'),
    ).rejects.toHaveProperty('message', restaurantNotFoundMessage);
  });

  it('addRestaurantCulture should throw an exception for an invalid culture', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.company.name(),
      city: faker.address.city(),
    });

    await expect(() =>
      service.addRestaurantCulture('0', newRestaurant.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('findRestaurantByCultureId should return Restaurant by culture', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];
    const storedRestaurant: RestaurantEntity =
      await service.findRestaurantByCultureId(culture.id, restaurant.id);
    expect(storedRestaurant).toBeDefined();
    expect(storedRestaurant.name).toBe(restaurant.name);
  });

  it('findRestaurantByCultureId should throw an exception for an invalid Restaurant', async () => {
    await expect(() =>
      service.findRestaurantByCultureId(culture.id, '0'),
    ).rejects.toHaveProperty('message', restaurantNotFoundMessage);
  });

  it('findRestaurantByCultureId should throw an exception for an invalid culture', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];
    await expect(() =>
      service.findRestaurantByCultureId('0', restaurant.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('findRestaurantByCultureId should throw an exception for an Restaurant not associated to the culture', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.company.name(),
      city: faker.address.city(),
    });

    await expect(() =>
      service.findRestaurantByCultureId(culture.id, newRestaurant.id),
    ).rejects.toHaveProperty('message', associationNotFoundMessage);
  });

  it('findRestaurantsByCultureId should return restaurants by culture', async () => {
    const Restaurants: RestaurantEntity[] =
      await service.findRestaurantsByCultureId(culture.id);
    expect(Restaurants.length).toBe(5);
  });

  it('findRestaurantsByCultureId should throw an exception for an invalid culture', async () => {
    await expect(() =>
      service.findRestaurantsByCultureId('0'),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('deleteRestaurantCulture should remove an Restaurant from a culture', async () => {
    const Restaurant: RestaurantEntity = restaurantsList[0];

    await service.deleteRestaurantCulture(culture.id, Restaurant.id);

    const storedCulture: CultureEntity = await cultureRepository.findOne({
      where: { id: culture.id },
      relations: ['restaurants'],
    });
    const deletedRestaurant: RestaurantEntity = storedCulture.restaurants.find(
      (a) => a.id === Restaurant.id,
    );

    expect(deletedRestaurant).toBeUndefined();
  });

  it('deleteRestaurantCulture should thrown an exception for an invalid Restaurant', async () => {
    await expect(() =>
      service.deleteRestaurantCulture(culture.id, '0'),
    ).rejects.toHaveProperty('message', restaurantNotFoundMessage);
  });

  it('deleteRestaurantCulture should thrown an exception for an invalid culture', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];
    await expect(() =>
      service.deleteRestaurantCulture('0', restaurant.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('deleteRestaurantCulture should thrown an exception for an non asocciated Restaurant', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.company.name(),
      city: faker.address.city(),
    });

    await expect(() =>
      service.deleteRestaurantCulture(culture.id, newRestaurant.id),
    ).rejects.toHaveProperty('message', associationNotFoundMessage);
  });
});
