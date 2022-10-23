import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CountryEntity } from '../country/country.entity';
import { CultureEntity } from '../culture/culture.entity';
import { Repository } from 'typeorm';
import { CultureCountryService } from './culture-country.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { CacheModule } from '@nestjs/common';

describe('CultureCountryService', () => {
  let service: CultureCountryService;
  let cultureRepository: Repository<CultureEntity>;
  let countryRepository: Repository<CountryEntity>;
  let culture: CultureEntity;
  let countriesList: CountryEntity[];
  const cultureNotFoundMessage = 'La cultura con el id dado no fue encontrado';
  const countryNotFoundMessage = 'El país con el id dado no fue encontrado';
  const countryNotAssociatedMessage =
    'El país con el id dado no está asociado a la cultura';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [CultureCountryService],
    }).compile();

    service = module.get<CultureCountryService>(CultureCountryService);
    cultureRepository = module.get<Repository<CultureEntity>>(
      getRepositoryToken(CultureEntity),
    );
    countryRepository = module.get<Repository<CountryEntity>>(
      getRepositoryToken(CountryEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    countryRepository.clear();
    cultureRepository.clear();

    countriesList = [];
    for (let i = 0; i < 5; i++) {
      const country: CountryEntity = await countryRepository.save({
        name: faker.address.country(),
      });
      countriesList.push(country);
    }

    culture = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      countries: countriesList,
    });
  };

  it('addCountryCulture should add an country to a culture', async () => {
    const newCountry: CountryEntity = await countryRepository.save({
      name: faker.address.country(),
    });

    const newCulture: CultureEntity = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });

    const result: CultureEntity = await service.addCountryCulture(
      newCulture.id,
      newCountry.id,
    );

    expect(result.countries.length).toBe(1);
    expect(result.countries[0]).not.toBeNull();
    expect(result.countries[0].name).toBe(newCountry.name);
  });

  it('addCountryCulture should thrown exception for an invalid country', async () => {
    const newCulture: CultureEntity = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });

    await expect(() =>
      service.addCountryCulture(newCulture.id, '0'),
    ).rejects.toHaveProperty('message', countryNotFoundMessage);
  });

  it('addCountryCulture should throw an exception for an invalid culture', async () => {
    const newCountry: CountryEntity = await countryRepository.save({
      name: faker.address.country(),
    });

    await expect(() =>
      service.addCountryCulture('0', newCountry.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('findCountryByCultureIdCountryId should return country by culture', async () => {
    const country: CountryEntity = countriesList[0];
    const storedCountry: CountryEntity =
      await service.findCountryByCultureIdCountryId(culture.id, country.id);
    expect(storedCountry).not.toBeNull();
    expect(storedCountry.name).toBe(country.name);
  });

  it('findCountryByCultureIdCountryId should throw an exception for an invalid country', async () => {
    await expect(() =>
      service.findCountryByCultureIdCountryId(culture.id, '0'),
    ).rejects.toHaveProperty('message', countryNotFoundMessage);
  });

  it('findCountryByCultureIdCountryId should throw an exception for an invalid culture', async () => {
    const country: CountryEntity = countriesList[0];
    await expect(() =>
      service.findCountryByCultureIdCountryId('0', country.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('findCountryByCultureIdCountryId should throw an exception for an country not associated to the culture', async () => {
    const newCountry: CountryEntity = await countryRepository.save({
      name: faker.address.country(),
    });

    await expect(() =>
      service.findCountryByCultureIdCountryId(culture.id, newCountry.id),
    ).rejects.toHaveProperty('message', countryNotAssociatedMessage);
  });

  it('findCountriesByCultureId should return countries by culture', async () => {
    const countries: CountryEntity[] = await service.findCountriesByCultureId(
      culture.id,
    );
    expect(countries.length).toBe(5);
  });

  it('findCountriesByCultureId should throw an exception for an invalid culture', async () => {
    await expect(() =>
      service.findCountriesByCultureId('0'),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('associateCountriesCulture should update countries list for a culture', async () => {
    const newCountry: CountryEntity = await countryRepository.save({
      name: faker.address.country(),
    });

    const updatedCulture: CultureEntity =
      await service.associateCountriesCulture(culture.id, [newCountry]);
    expect(updatedCulture.countries.length).toBe(1);
    expect(updatedCulture.countries[0].name).toBe(newCountry.name);
  });

  it('associateCountriesCulture should throw an exception for an invalid culture', async () => {
    const newCountry: CountryEntity = await countryRepository.save({
      name: faker.address.country(),
    });

    await expect(() =>
      service.associateCountriesCulture('0', [newCountry]),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('associateCountriesCulture should throw an exception for an invalid country', async () => {
    const newCountry: CountryEntity = countriesList[0];
    newCountry.id = '0';

    await expect(() =>
      service.associateCountriesCulture(culture.id, [newCountry]),
    ).rejects.toHaveProperty('message', countryNotFoundMessage);
  });

  it('deleteCountryToCulture should remove an country from a culture', async () => {
    const country: CountryEntity = countriesList[0];

    await service.deleteCountryCulture(culture.id, country.id);

    const storedCulture: CultureEntity = await cultureRepository.findOne({
      where: { id: culture.id },
      relations: ['countries'],
    });
    const deletedCountry: CountryEntity = storedCulture.countries.find(
      (a) => a.id === country.id,
    );

    expect(deletedCountry).toBeUndefined();
  });

  it('deleteCountryToCulture should thrown an exception for an invalid country', async () => {
    await expect(() =>
      service.deleteCountryCulture(culture.id, '0'),
    ).rejects.toHaveProperty('message', countryNotFoundMessage);
  });

  it('deleteCountryToCulture should thrown an exception for an invalid culture', async () => {
    const country: CountryEntity = countriesList[0];
    await expect(() =>
      service.deleteCountryCulture('0', country.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('deleteCountryToCulture should thrown an exception for an non asocciated country', async () => {
    const newCountry: CountryEntity = await countryRepository.save({
      name: faker.address.country(),
    });

    await expect(() =>
      service.deleteCountryCulture(culture.id, newCountry.id),
    ).rejects.toHaveProperty('message', countryNotAssociatedMessage);
  });
});
