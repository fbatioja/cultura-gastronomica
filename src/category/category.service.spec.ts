import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { CategoryEntity } from './category.entity';
import { CategoryService } from './category.service';
import { faker } from '@faker-js/faker';
import { CacheModule } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: Repository<CategoryEntity>;
  let categoriesList: CategoryEntity[];
  const defaultId = '00000000-0000-0000-0000-000000000000';
  const messageProperty = 'message';
  const notFoundMessage = 'La categoria con el id dado no fue encontrada';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [CategoryService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get<Repository<CategoryEntity>>(
      getRepositoryToken(CategoryEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    categoriesList = [];
    for (let i = 0; i < 10; i++) {
      const category: CategoryEntity = await repository.save({
        name: faker.company.name(),
      });
      categoriesList.push(category);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all categories', async () => {
    const categories: CategoryEntity[] = await service.findAll();
    expect(categories).not.toBeNull();
    expect(categories).toHaveLength(categoriesList.length);
  });

  it('findOne should return a category by id', async () => {
    const storedCategory: CategoryEntity = categoriesList[0];
    const category: CategoryEntity = await service.findOne(storedCategory.id);
    expect(category).not.toBeNull();
    expect(category.name).toEqual(storedCategory.name);
  });

  it('findOne should throw an exception for an invalid category', async () => {
    await expect(() => service.findOne(defaultId)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });

  it('create should return a new category', async () => {
    const category: CategoryEntity = {
      id: '',
      name: faker.company.name(),
      products: [],
    };

    const newCategory: CategoryEntity = await service.create(category);
    expect(newCategory).not.toBeNull();

    const storedCategory: CategoryEntity = await repository.findOne({
      where: { id: newCategory.id },
    });
    expect(storedCategory).not.toBeNull();
    expect(storedCategory.name).toEqual(newCategory.name);
  });

  it('update should modify a category', async () => {
    const category: CategoryEntity = categoriesList[0];
    category.name = 'New name';

    const updatedMuseum: CategoryEntity = await service.update(
      category.id,
      category,
    );
    expect(updatedMuseum).not.toBeNull();

    const storedCategory: CategoryEntity = await repository.findOne({
      where: { id: category.id },
    });
    expect(storedCategory).not.toBeNull();
    expect(storedCategory.name).toEqual(category.name);
  });

  it('update should throw an exception for an invalid category', async () => {
    let category: CategoryEntity = categoriesList[0];
    category = {
      ...category,
      name: 'New name',
    };
    await expect(() =>
      service.update(defaultId, category),
    ).rejects.toHaveProperty(messageProperty, notFoundMessage);
  });

  it('delete should remove a category', async () => {
    const category: CategoryEntity = categoriesList[0];
    await service.delete(category.id);

    const deletedCategory: CategoryEntity = await repository.findOne({
      where: { id: category.id },
    });
    expect(deletedCategory).toBeNull();
  });

  it('delete should throw an exception for an invalid category', async () => {
    const category: CategoryEntity = categoriesList[0];
    await service.delete(category.id);
    await expect(() => service.delete(defaultId)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });
});
