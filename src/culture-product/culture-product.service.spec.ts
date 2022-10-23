import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { ProductEntity } from '../product/product.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { CultureProductService } from './culture-product.service';
import { CacheModule } from '@nestjs/common';

describe('CultureProductService', () => {
  let service: CultureProductService;
  let cultureRepository: Repository<CultureEntity>;
  let productRepository: Repository<ProductEntity>;
  let culture: CultureEntity;
  let productsList: ProductEntity[];
  const cultureNotFoundMessage = 'La cultura con el id dado no fue encontrado';
  const productNotFoundMessage = 'El product con el id dado no fue encontrado';
  const associationNotFoundMessage =
    'La cultura no tiene una asociación con el producto dado';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [CultureProductService],
    }).compile();

    service = module.get<CultureProductService>(CultureProductService);
    cultureRepository = module.get<Repository<CultureEntity>>(
      getRepositoryToken(CultureEntity),
    );
    productRepository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    await productRepository.clear();
    await cultureRepository.clear();

    productsList = [];

    for (let i = 0; i < 5; i++) {
      const product: ProductEntity = await productRepository.save({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        history: faker.lorem.words(),
      });
      productsList.push(product);
    }

    culture = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      products: productsList,
    });
  };

  it('addProductCulture should add a Product to a culture', async () => {
    const newProduct: ProductEntity = await productRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      history: faker.lorem.words(),
    });

    const newCulture: CultureEntity = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });

    const result: CultureEntity = await service.addProductCulture(
      newCulture.id,
      newProduct.id,
    );

    expect(result).toBeDefined();
    expect(result.products.length).toBe(1);
    expect(result.products[0]).not.toBeNull();
    expect(result.products[0].name).toBe(newProduct.name);
  });

  it('addProductCulture should thrown exception for invalid product', async () => {
    const newCulture: CultureEntity = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });

    await expect(() =>
      service.addProductCulture(newCulture.id, '0'),
    ).rejects.toHaveProperty('message', productNotFoundMessage);
  });

  it('addProductCulture should throw an exception for an invalid culture', async () => {
    const newProduct: ProductEntity = await productRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      history: faker.lorem.words(),
    });

    await expect(() =>
      service.addProductCulture('0', newProduct.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('findProductByCultureId should return product by culture', async () => {
    const product: ProductEntity = productsList[0];
    const storedProduct: ProductEntity = await service.findProductByCultureId(
      culture.id,
      product.id,
    );
    expect(storedProduct).toBeDefined();
    expect(storedProduct.name).toBe(product.name);
  });

  it('findProductByCultureId should throw an exception for an invalid product', async () => {
    await expect(() =>
      service.findProductByCultureId(culture.id, '0'),
    ).rejects.toHaveProperty('message', productNotFoundMessage);
  });

  it('findProductByCultureId should throw an exception for an invalid culture', async () => {
    const product: ProductEntity = productsList[0];
    await expect(() =>
      service.findProductByCultureId('0', product.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('findProductByCultureId should throw an exception for an product not associated to the culture', async () => {
    const newProduct: ProductEntity = await productRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      history: faker.lorem.words(),
    });

    await expect(() =>
      service.findProductByCultureId(culture.id, newProduct.id),
    ).rejects.toHaveProperty('message', associationNotFoundMessage);
  });

  it('findProductsByCultureId should return countries by culture', async () => {
    const products: ProductEntity[] = await service.findProductsByCultureId(
      culture.id,
    );
    expect(products.length).toBe(5);
  });

  it('findProductsByCultureId should throw an exception for an invalid culture', async () => {
    await expect(() =>
      service.findProductsByCultureId('0'),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('deleteProductCulture should remove an Product from a culture', async () => {
    const product: ProductEntity = productsList[0];

    await service.deleteProductCulture(culture.id, product.id);

    const storedCulture: CultureEntity = await cultureRepository.findOne({
      where: { id: culture.id },
      relations: ['products'],
    });
    const deletedProduct: ProductEntity = storedCulture.products.find(
      (a) => a.id === product.id,
    );

    expect(deletedProduct).toBeUndefined();
  });

  it('deleteProductCulture should thrown an exception for an invalid Product', async () => {
    await expect(() =>
      service.deleteProductCulture(culture.id, '0'),
    ).rejects.toHaveProperty('message', productNotFoundMessage);
  });

  it('deleteProductCulture should thrown an exception for an invalid culture', async () => {
    const product: ProductEntity = productsList[0];
    await expect(() =>
      service.deleteProductCulture('0', product.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('deleteProductCulture should thrown an exception for an non asocciated Product', async () => {
    const newProduct: ProductEntity = await productRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      history: faker.lorem.words(),
    });

    await expect(() =>
      service.deleteProductCulture(culture.id, newProduct.id),
    ).rejects.toHaveProperty('message', associationNotFoundMessage);
  });
});
