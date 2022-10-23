import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CountryService } from './country.service';
import { faker } from '@faker-js/faker';
import { CountryEntity } from './country.entity';
import { CacheModule } from '@nestjs/common';

describe('CountryService', () => {
  let service: CountryService;
  let repository: Repository<CountryEntity>;
  let countriesList: CountryEntity[];
  const messageProperty = 'message';
  const notFoundMessage = 'El país con el id dado no fue encontrado';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [CountryService],
    }).compile();

    service = module.get<CountryService>(CountryService);
    repository = module.get<Repository<CountryEntity>>(
      getRepositoryToken(CountryEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    countriesList = [];
    for (let i = 0; i < 5; i++) {
      const country: CountryEntity = await repository.save({
        name: faker.company.name(),
      });
      countriesList.push(country);
    }
  };

  it('findAll should return all countries', async () => {
    const countries: CountryEntity[] = await service.findAll();
    expect(countries).not.toBeNull();
    expect(countries).toHaveLength(countriesList.length);
  });

  it('findOne should return a country by id', async () => {
    const storedCountry: CountryEntity = countriesList[0];
    const country: CountryEntity = await service.findOne(storedCountry.id);
    expect(country).not.toBeNull();
    expect(country.name).toEqual(storedCountry.name);
  });

  it('findOne should throw an exception for an invalid country', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });

  it('create should return a new country', async () => {
    const country: CountryEntity = {
      id: '',
      name: faker.company.name(),
      cultures: [],
      restaurants: [],
    };

    const newCountry: CountryEntity = await service.create(country);
    expect(newCountry).not.toBeNull();

    const storedCountry: CountryEntity = await repository.findOne({
      where: { id: `${newCountry.id}` },
    });
    expect(storedCountry).not.toBeNull();
    expect(storedCountry.name).toEqual(newCountry.name);
  });

  it('delete should remove a country', async () => {
    const country: CountryEntity = countriesList[0];
    await service.delete(country.id);
    const deletedCountry: CountryEntity = await repository.findOne({
      where: { id: country.id },
    });
    expect(deletedCountry).toBeNull();
  });

  it('delete should throw an exception for an invalid country', async () => {
    const country: CountryEntity = countriesList[0];
    await service.delete(country.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });
});
