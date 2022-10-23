import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { RecipeEntity } from './recipe.entity';
import { RecipeService } from './recipe.service';
import { CacheModule } from '@nestjs/common';

describe('RecipeService', () => {
  let service: RecipeService;
  let repository: Repository<RecipeEntity>;
  let recipesList: RecipeEntity[];
  const notFoundMessage = 'La receta con el id dado no fue encontrado';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [RecipeService],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
    repository = module.get<Repository<RecipeEntity>>(
      getRepositoryToken(RecipeEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    recipesList = [];
    for (let i = 0; i < 5; i++) {
      const recipe: RecipeEntity = await repository.save({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        photoURI: faker.lorem.words(),
        videoURI: faker.lorem.words(),
        preparationProcess: faker.lorem.words(),
        culture: null,
      });
      recipesList.push(recipe);
    }
  };

  it('findAll should return all recipes', async () => {
    const recipes: RecipeEntity[] = await service.findAll();
    expect(recipes).toBeDefined();
    expect(recipes).toHaveLength(recipesList.length);
  });

  it('findOne should return a recipe', async () => {
    const storedRecipe: RecipeEntity = recipesList[0];
    const recipe: RecipeEntity = await service.findOne(storedRecipe.id);
    expect(recipe).toBeDefined();
    expect(recipe.name).toEqual(storedRecipe.name);
    expect(recipe.description).toEqual(storedRecipe.description);
  });

  it('findOne should throw an exception', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      notFoundMessage,
    );
  });

  it('create should create a new recipe', async () => {
    const recipe: RecipeEntity = {
      id: '',
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      videoURI: faker.lorem.sentence(),
      photoURI: faker.lorem.sentence(),
      preparationProcess: faker.lorem.sentence(),
      culture: null,
    };

    const newRecipe: RecipeEntity = await service.create(recipe);
    expect(newRecipe).not.toBeNull();

    const storedRecipe: RecipeEntity = await repository.findOne({
      where: { id: newRecipe.id },
    });

    expect(storedRecipe).not.toBeNull();
    expect(storedRecipe.name).toBe(newRecipe.name);
    expect(storedRecipe.description).toBe(newRecipe.description);
  });

  it('update should modify a recipe', async () => {
    const recipe: RecipeEntity = recipesList[0];
    recipe.name = faker.company.name();
    const updateRecipe: RecipeEntity = await service.update(recipe.id, recipe);

    expect(updateRecipe).toBeDefined();
    const storedRecipe: RecipeEntity = await repository.findOne({
      where: { id: recipe.id },
    });

    expect(storedRecipe).toBeDefined();
    expect(storedRecipe).toMatchObject({
      name: recipe.name,
    });
  });

  it('update should throw an exception', async () => {
    let recipe: RecipeEntity = recipesList[0];
    recipe.name = 'New name';
    await expect(() => service.update('0', recipe)).rejects.toHaveProperty(
      'message',
      notFoundMessage,
    );
  });

  it('remove should remove a recipe', async () => {
    const recipe: RecipeEntity = recipesList[0];
    await service.delete(recipe.id);
    const deletedRecipe: RecipeEntity = await repository.findOne({
      where: { id: recipe.id },
    });
    expect(deletedRecipe).toBeNull();
  });

  it('remove should throw an exception', async () => {
    const recipe: RecipeEntity = recipesList[0];
    await service.delete(recipe.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      notFoundMessage,
    );
  });
});
