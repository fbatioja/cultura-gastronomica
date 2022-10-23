import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantCountryService } from './retaurant-country.service';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CountryEntity } from '../country/country.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { CacheModule } from '@nestjs/common';

describe('RetaurantCountryService', () => {
  let service: RestaurantCountryService;
  let restaurantRepository: Repository<RestaurantEntity>;
  let countryRepository: Repository<CountryEntity>;
  let restaurant: RestaurantEntity;
  let countriesList: CountryEntity[];
  const restaurantNotFoundMessage =
    'El restaurante con el id dado no fue encontrado';
  const countryNotFoundMessage = 'El país con el id dado no fue encontrado';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [RestaurantCountryService],
    }).compile();

    service = module.get<RestaurantCountryService>(RestaurantCountryService);
    restaurantRepository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );
    countryRepository = module.get<Repository<CountryEntity>>(
      getRepositoryToken(CountryEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    countryRepository.clear();
    restaurantRepository.clear();

    countriesList = [];
    for (let i = 0; i < 5; i++) {
      const country: CountryEntity = await countryRepository.save({
        name: faker.address.country(),
      });
      countriesList.push(country);
    }

    restaurant = await restaurantRepository.save({
      name: faker.company.name(),
      city: faker.address.city(),
      country: countriesList[0],
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addCountryRestaurant should add an country to a restaurant', async () => {
    const newCountry: CountryEntity = await countryRepository.save({
      name: faker.address.country(),
    });

    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.company.name(),
      city: faker.address.city(),
    });

    const result: RestaurantEntity = await service.associateCountryRestaurant(
      newRestaurant.id,
      newCountry.id,
    );

    expect(result.country).toEqual(newCountry);
  });

  it('addCountryRestaurant should thrown exception for an invalid country', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.company.name(),
      city: faker.address.city(),
    });

    await expect(() =>
      service.associateCountryRestaurant(newRestaurant.id, '0'),
    ).rejects.toHaveProperty('message', countryNotFoundMessage);
  });

  it('addCountryRestaurant should throw an exception for an invalid restaurant', async () => {
    const newCountry: CountryEntity = await countryRepository.save({
      name: faker.address.country(),
    });

    await expect(() =>
      service.associateCountryRestaurant('0', newCountry.id),
    ).rejects.toHaveProperty('message', restaurantNotFoundMessage);
  });

  it('findCountriesByRestaurantId should return countries by restaurant', async () => {
    const country: CountryEntity = await service.findCountryByRestaurantId(
      restaurant.id,
    );
    expect(country).toEqual(countriesList[0]);
  });

  it('findCountriesByRestaurantId should throw an exception for an invalid restaurant', async () => {
    await expect(() =>
      service.findCountryByRestaurantId('0'),
    ).rejects.toHaveProperty('message', restaurantNotFoundMessage);
  });
});
