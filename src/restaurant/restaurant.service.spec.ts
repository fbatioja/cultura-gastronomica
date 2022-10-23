import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { faker } from '@faker-js/faker';
import { CacheModule } from '@nestjs/common';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let repository: Repository<RestaurantEntity>;
  let restaurantsList: RestaurantEntity[];

  const seedDatabase = async () => {
    repository.clear();
    restaurantsList = [];
    for (let i = 0; i <= 5; i++) {
      const restaurant: RestaurantEntity = await repository.save({
        name: faker.company.name(),
        city: faker.address.city(),
      });
      restaurantsList.push(restaurant);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    repository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all restaurants', async () => {
    const restaurants: RestaurantEntity[] = await service.findAll();
    expect(restaurants).not.toBeNull();
    expect(restaurants).toHaveLength(restaurantsList.length);
  });

  it('findOne should return a restaurant by id', async () => {
    const storedRestaurant: RestaurantEntity = restaurantsList[0];
    const restaurant: RestaurantEntity = await service.findOne(
      storedRestaurant.id,
    );
    expect(restaurant).not.toBeNull();
    expect(restaurant.name).toEqual(storedRestaurant.name);
    expect(restaurant.city).toEqual(storedRestaurant.city);
  });

  it('findOne should throw an exception for an invalid restaurant', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El restaurante con el id dado no fue encontrado',
    );
  });

  it('create should return a new restaurant', async () => {
    const restaurant: RestaurantEntity = {
      id: '',
      name: faker.company.name(),
      city: faker.address.city(),
      country: null,
      stars: [],
      cultures: [],
    };

    const newRestaurant: RestaurantEntity = await service.create(restaurant);
    expect(newRestaurant).not.toBeNull();

    const storedRestaurant: RestaurantEntity = await repository.findOne({
      where: { id: `${newRestaurant.id}` },
    });
    expect(storedRestaurant).not.toBeNull();
    expect(storedRestaurant.name).toEqual(newRestaurant.name);
    expect(storedRestaurant.city).toEqual(newRestaurant.city);
  });

  it('update should modify a restaurant', async () => {
    const Restaurant: RestaurantEntity = restaurantsList[0];
    Restaurant.name = 'New name';
    Restaurant.city = 'New city';
    const updatedRestaurant: RestaurantEntity = await service.update(
      Restaurant.id,
      Restaurant,
    );
    expect(updatedRestaurant).not.toBeNull();

    const storedRestaurant: RestaurantEntity = await repository.findOne({
      where: { id: `${Restaurant.id}` },
    });
    expect(storedRestaurant).not.toBeNull();
    expect(storedRestaurant.name).toEqual(Restaurant.name);
    expect(storedRestaurant.city).toEqual(Restaurant.city);
  });

  it('update should throw an exception for an invalid restaurant', async () => {
    let restaurant: RestaurantEntity = restaurantsList[0];
    restaurant = {
      ...restaurant,
      name: 'New name',
      city: 'New address',
    };
    await expect(() => service.update('0', restaurant)).rejects.toHaveProperty(
      'message',
      'El restaurante con el id dado no fue encontrado',
    );
  });

  it('delete should remove a restaurant', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];
    await service.delete(restaurant.id);
    const deletedRestaurant: RestaurantEntity = await repository.findOne({
      where: { id: `${restaurant.id}` },
    });
    expect(deletedRestaurant).toBeNull();
  });

  it('delete should throw an exception for an invalid Restaurant', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];
    await service.delete(restaurant.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El restaurante con el id dado no fue encontrado',
    );
  });
});
