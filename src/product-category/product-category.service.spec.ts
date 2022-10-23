import { Test, TestingModule } from '@nestjs/testing';
import { CategoryEntity } from '../category/category.entity';
import { ProductEntity } from '../product/product.entity';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductCategoryService } from './product-category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let productRepository: Repository<ProductEntity>;
  let categoryRepository: Repository<CategoryEntity>;
  let product: ProductEntity;
  let category: CategoryEntity;
  const defaultId = '00000000-0000-0000-0000-000000000000';
  const messageProperty = 'message';
  const categoryNotFoundMessage =
    'La categoria con el id dado no fue encontrada';
  const productNotFoundMessage = 'El producto con el id dado no fue encontrado';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductCategoryService],
    }).compile();

    service = module.get<ProductCategoryService>(ProductCategoryService);
    productRepository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );
    categoryRepository = module.get<Repository<CategoryEntity>>(
      getRepositoryToken(CategoryEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    productRepository.clear();
    categoryRepository.clear();

    category = await categoryRepository.save({
      name: faker.company.name(),
    });

    product = await productRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      history: faker.lorem.sentence(),
      category: category,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findCategoryByProductId should return category by product', async () => {
    const storedCategory: CategoryEntity =
      await service.findCategoryByProductId(product.id);

    expect(storedCategory).not.toBeNull();
    expect(category.name).toEqual(storedCategory.name);
  });

  it('findCategoryByProductId should throw an exception for an invalid product', async () => {
    await expect(() =>
      service.findCategoryByProductId(defaultId),
    ).rejects.toHaveProperty(messageProperty, productNotFoundMessage);
  });

  it('associateProductCategory should update category for a product', async () => {
    const newCategory: CategoryEntity = await categoryRepository.save({
      name: faker.company.name(),
    });

    const updatedProduct: ProductEntity =
      await service.associateProductCategory(product.id, newCategory.id);

    expect(updatedProduct.category).not.toBeNull();
    expect(updatedProduct.category.name).toBe(newCategory.name);
  });

  it('associateProductCategory should throw an exception for an invalid product', async () => {
    const newCategory: CategoryEntity = await categoryRepository.save({
      name: faker.company.name(),
    });

    await expect(() =>
      service.associateProductCategory(defaultId, newCategory.id),
    ).rejects.toHaveProperty(messageProperty, productNotFoundMessage);
  });

  it('associateProductCategory should throw an exception for an invalid category', async () => {
    await expect(() =>
      service.associateProductCategory(product.id, defaultId),
    ).rejects.toHaveProperty(messageProperty, categoryNotFoundMessage);
  });
});
