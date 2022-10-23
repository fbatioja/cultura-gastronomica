import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductEntity } from './product.entity';
import { faker } from '@faker-js/faker';
import { ProductService } from './product.service';
import { CacheModule } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<ProductEntity>;
  let productsList: ProductEntity[];
  const defaultId = '00000000-0000-0000-0000-000000000000';
  const messageProperty = 'message';
  const notFoundMessage = 'El producto con el id dado no fue encontrado';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    productsList = [];
    for (let i = 0; i < 10; i++) {
      const product: ProductEntity = await repository.save({
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        history: faker.lorem.sentence(),
      });
      productsList.push(product);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all products', async () => {
    const products: ProductEntity[] = await service.findAll();
    expect(products).not.toBeNull();
    expect(products).toHaveLength(productsList.length);
  });

  it('findOne should return a product by id', async () => {
    const storedProduct: ProductEntity = productsList[0];
    const product: ProductEntity = await service.findOne(storedProduct.id);
    expect(product).not.toBeNull();
    expect(product.name).toEqual(storedProduct.name);
    expect(product.description).toEqual(storedProduct.description);
    expect(product.history).toEqual(storedProduct.history);
  });

  it('findOne should throw an exception for an invalid product', async () => {
    await expect(() => service.findOne(defaultId)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });

  it('create should return a new product', async () => {
    const product: ProductEntity = {
      id: '',
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      history: faker.lorem.sentence(),
      category: undefined,
      culture: undefined,
    };

    const newProduct: ProductEntity = await service.create(product);
    expect(newProduct).not.toBeNull();

    const storedProduct: ProductEntity = await repository.findOne({
      where: { id: newProduct.id },
    });
    expect(storedProduct).not.toBeNull();
    expect(storedProduct.name).toEqual(newProduct.name);
    expect(storedProduct.description).toEqual(newProduct.description);
    expect(storedProduct.history).toEqual(newProduct.history);
    expect(storedProduct.category).toEqual(newProduct.category);
  });

  it('update should modify a product', async () => {
    const product: ProductEntity = productsList[0];
    product.name = 'New name';
    product.description = 'New description';
    product.history = 'New history';

    const updatedMuseum: ProductEntity = await service.update(
      product.id,
      product,
    );
    expect(updatedMuseum).not.toBeNull();

    const storedProduct: ProductEntity = await repository.findOne({
      where: { id: product.id },
    });
    expect(storedProduct).not.toBeNull();
    expect(storedProduct.name).toEqual(product.name);
    expect(storedProduct.description).toEqual(product.description);
    expect(storedProduct.history).toEqual(product.history);
    expect(storedProduct.category).toEqual(product.category);
  });

  it('update should throw an exception for an invalid product', async () => {
    let product: ProductEntity = productsList[0];
    product = {
      ...product,
      name: 'New name',
      description: 'New description',
      history: 'New history',
    };
    await expect(() =>
      service.update(defaultId, product),
    ).rejects.toHaveProperty(messageProperty, notFoundMessage);
  });

  it('delete should remove a product', async () => {
    const product: ProductEntity = productsList[0];
    await service.delete(product.id);

    const deletedProduct: ProductEntity = await repository.findOne({
      where: { id: product.id },
    });
    expect(deletedProduct).toBeNull();
  });

  it('delete should throw an exception for an invalid product', async () => {
    const product: ProductEntity = productsList[0];
    await service.delete(product.id);
    await expect(() => service.delete(defaultId)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });
});
