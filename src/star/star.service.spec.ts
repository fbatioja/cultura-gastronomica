import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { StarEntity } from './star.entity';
import { StarService } from './star.service';
import { faker } from '@faker-js/faker';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { CacheModule } from '@nestjs/common';

describe('StarService', () => {
  let service: StarService;
  let repository: Repository<StarEntity>;
  let repositoryRestaurant: Repository<RestaurantEntity>;
  let starsList: StarEntity[];
  let restaurantsList : RestaurantEntity[];
  const starNotFoundMessage = "La estrella con el id dado no fue encontrada";

  const seedDatabase = async () => {
    repository.clear();
    starsList = [];
    restaurantsList = [];
    
    for(let i = 0; i <= 5; i++){
      const star: StarEntity = await repository.save({
      consecutionDate: faker.date.past()})
      starsList.push(star);
    }


    for(let i = 0; i <= 2; i++){
      const restaurant: RestaurantEntity = await repositoryRestaurant.save({
      name: faker.company.name(),
      city: faker.address.city(),
      stars: []})

      restaurant.stars.push(starsList[0])
      restaurantsList.push(restaurant);
    }

    
  }
 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig(),CacheModule.register({})],
      providers: [StarService],
    }).compile();

    service = module.get<StarService>(StarService);
    repository = module.get<Repository<StarEntity>>(getRepositoryToken(StarEntity));
    repositoryRestaurant = module.get<Repository<RestaurantEntity>>(getRepositoryToken(RestaurantEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all stars', async () => {
    const stars: StarEntity[] = await service.findAll();
    expect(stars).not.toBeNull();
    expect(stars).toHaveLength(starsList.length);
  });

  it('findOne should return a star by id', async () => {
    const storedStar: StarEntity = starsList[0];
    const star: StarEntity = await service.findOne(storedStar.id);
    expect(star).not.toBeNull();
    expect(star.consecutionDate).toEqual(storedStar.consecutionDate)
  });

  it('findOne should throw an exception for an invalid star', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", starNotFoundMessage)
  });
  
  it('create should return a new star', async () => {
    const star: StarEntity = {
      id: "",
      consecutionDate: faker.date.past(),
      restaurant: restaurantsList[0]
    }
 
    const newStar: StarEntity = await service.create(star, star.restaurant.id);
    expect(newStar).not.toBeNull();
 
    const storedStar: StarEntity = await repository.findOne({where: {id: `${newStar.id}`} })
    expect(storedStar).not.toBeNull();
    expect(storedStar.consecutionDate).toEqual(newStar.consecutionDate)
  });

  it('update should modify a star', async () => {
    const star: StarEntity = starsList[0];
    star.consecutionDate = faker.date.future();
    const updatedStar: StarEntity = await service.update(restaurantsList[0].id,star.id, star);
    expect(updatedStar).not.toBeNull();
    
    const storedStar: StarEntity = await repository.findOne({ where: { id: `${star.id}` } })
    expect(storedStar).not.toBeNull();
    expect(storedStar.consecutionDate).toEqual(star.consecutionDate)
  });

  it('delete should remove a star', async () => {
    const star: StarEntity = starsList[0];
    await service.delete(restaurantsList[0].id, star.id);
    const deletedRestaurant: StarEntity = await repository.findOne({ where: { id: `${star.id}` } })
    await expect(deletedRestaurant).toBeNull();
  });

  it('delete should throw an exception for an invalid star', async () => {
    const star: StarEntity = starsList[0];
    await service.delete(restaurantsList[0].id, star.id);
    await expect(() => service.delete(restaurantsList[0].id, star.id)).rejects.toHaveProperty("message", starNotFoundMessage)
  });



});
