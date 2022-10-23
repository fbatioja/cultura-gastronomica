import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { RecipeEntity } from '../recipe/recipe.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { CultureRecipeService } from './culture-recipe.service';
import { CacheModule } from '@nestjs/common';

describe('CultureRecipeService', () => {
  let service: CultureRecipeService;
  let cultureRepository: Repository<CultureEntity>;
  let recipeRepository: Repository<RecipeEntity>;
  let culture: CultureEntity;
  let recipesList: RecipeEntity[];
  const cultureNotFoundMessage = 'La cultura con el id dado no fue encontrado';
  const recipeNotFoundMessage = 'La receta con el id dado no fue encontrado';
  const associationNotFoundMessage =
    'EL pais no tiene una asociación con la reseta dada';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(), CacheModule.register({})],
      providers: [CultureRecipeService],
    }).compile();

    service = module.get<CultureRecipeService>(CultureRecipeService);
    cultureRepository = module.get<Repository<CultureEntity>>(
      getRepositoryToken(CultureEntity),
    );
    recipeRepository = module.get<Repository<RecipeEntity>>(
      getRepositoryToken(RecipeEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    recipeRepository.clear();
    cultureRepository.clear();

    recipesList = [];
    for (let i = 0; i < 5; i++) {
      const recipe: RecipeEntity = await recipeRepository.save({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        photoURI: faker.lorem.words(),
        videoURI: faker.lorem.words(),
        preparationProcess: faker.lorem.words(),
      });
      recipesList.push(recipe);
    }

    culture = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      recipes: recipesList,
    });
  };

  it('addRecipeCulture should add a recipe to a culture', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      videoURI: faker.lorem.sentence(),
      photoURI: faker.lorem.sentence(),
      preparationProcess: faker.lorem.sentence(),
    });

    const newCulture: CultureEntity = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });

    const result: CultureEntity = await service.addRecipeCulture(
      newCulture.id,
      newRecipe.id,
    );

    expect(result).toBeDefined();
    expect(result.recipes.length).toBe(1);
    expect(result.recipes[0]).not.toBeNull();
    expect(result.recipes[0].name).toBe(newRecipe.name);
  });

  it('addRecipeCulture should thrown exception for invalid recipe', async () => {
    const newCulture: CultureEntity = await cultureRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
    });

    await expect(() =>
      service.addRecipeCulture(newCulture.id, '0'),
    ).rejects.toHaveProperty('message', recipeNotFoundMessage);
  });

  it('addRecipeCulture should throw an exception for an invalid culture', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      videoURI: faker.lorem.sentence(),
      photoURI: faker.lorem.sentence(),
      preparationProcess: faker.lorem.sentence(),
    });

    await expect(() =>
      service.addRecipeCulture('0', newRecipe.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('findRecipeByCultureId should return recipe by culture', async () => {
    const recipe: RecipeEntity = recipesList[0];
    const storedRecipe: RecipeEntity = await service.findRecipeByCultureId(
      culture.id,
      recipe.id,
    );
    expect(storedRecipe).toBeDefined();
    expect(storedRecipe.name).toBe(recipe.name);
  });

  it('findRecipeByCultureId should throw an exception for an invalid recipe', async () => {
    await expect(() =>
      service.findRecipeByCultureId(culture.id, '0'),
    ).rejects.toHaveProperty('message', recipeNotFoundMessage);
  });

  it('findRecipeByCultureId should throw an exception for an invalid culture', async () => {
    const recipe: RecipeEntity = recipesList[0];
    await expect(() =>
      service.findRecipeByCultureId('0', recipe.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('findRecipeByCultureId should throw an exception for an recipe not associated to the culture', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      videoURI: faker.lorem.sentence(),
      photoURI: faker.lorem.sentence(),
      preparationProcess: faker.lorem.sentence(),
    });

    await expect(() =>
      service.findRecipeByCultureId(culture.id, newRecipe.id),
    ).rejects.toHaveProperty('message', associationNotFoundMessage);
  });

  it('findRecipesByCultureId should return recipes by culture', async () => {
    const recipes: RecipeEntity[] = await service.findRecipesByCultureId(
      culture.id,
    );
    expect(recipes.length).toBe(5);
  });

  it('findRecipesByCultureId should throw an exception for an invalid culture', async () => {
    await expect(() =>
      service.findRecipesByCultureId('0'),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('deleteRecipeCulture should remove an recipe from a culture', async () => {
    const recipe: RecipeEntity = recipesList[0];

    await service.deleteRecipeCulture(culture.id, recipe.id);

    const storedCulture: CultureEntity = await cultureRepository.findOne({
      where: { id: culture.id },
      relations: ['recipes'],
    });
    const deletedRecipe: RecipeEntity = storedCulture.recipes.find(
      (a) => a.id === recipe.id,
    );

    expect(deletedRecipe).toBeUndefined();
  });

  it('deleteRecipeCulture should thrown an exception for an invalid recipe', async () => {
    await expect(() =>
      service.deleteRecipeCulture(culture.id, '0'),
    ).rejects.toHaveProperty('message', recipeNotFoundMessage);
  });

  it('deleteRecipeCulture should thrown an exception for an invalid culture', async () => {
    const recipe: RecipeEntity = recipesList[0];
    await expect(() =>
      service.deleteRecipeCulture('0', recipe.id),
    ).rejects.toHaveProperty('message', cultureNotFoundMessage);
  });

  it('deleteRecipeCulture should thrown an exception for an non asocciated recipe', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      videoURI: faker.lorem.sentence(),
      photoURI: faker.lorem.sentence(),
      preparationProcess: faker.lorem.sentence(),
    });

    await expect(() =>
      service.deleteRecipeCulture(culture.id, newRecipe.id),
    ).rejects.toHaveProperty('message', associationNotFoundMessage);
  });
});
