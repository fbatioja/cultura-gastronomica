import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Cache } from 'cache-manager';

@Injectable()
export class RestaurantService {

    cacheKey: string = "restaurant";

    constructor(
        @InjectRepository(RestaurantEntity)
        private readonly restaurantRepository: Repository<RestaurantEntity>,
    
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    
    ){}

    async findAll(): Promise<RestaurantEntity[]> {
        const cached: RestaurantEntity[] = await this.cacheManager.get<RestaurantEntity[]>(this.cacheKey);
      
        if(!cached){
            const restaurants: RestaurantEntity[] = await await this.restaurantRepository.find({ relations: ["stars"] });
            await this.cacheManager.set(this.cacheKey, restaurants);
            return restaurants;
        }
 
        return cached;
    }

    async findOne(id: string): Promise<RestaurantEntity> {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({where: {id}, relations: ["stars"] } );
        if (!restaurant)
          throw new BusinessLogicException("El restaurante con el id dado no fue encontrado", BusinessError.NOT_FOUND);
   
        return restaurant;
    }

    async create(restaurant: RestaurantEntity): Promise<RestaurantEntity> {
        return await this.restaurantRepository.save(restaurant);
    }

    async update(id: string, restaurant: RestaurantEntity): Promise<RestaurantEntity> {
        const persistedRestaurant: RestaurantEntity = await this.restaurantRepository.findOne({where:{id}});
        if (!persistedRestaurant)
          throw new BusinessLogicException("El restaurante con el id dado no fue encontrado", BusinessError.NOT_FOUND);
        
        return await this.restaurantRepository.save({...persistedRestaurant, ...restaurant});
    }

    async delete(id: string) {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({where:{id}});
        if (!restaurant)
          throw new BusinessLogicException("El restaurante con el id dado no fue encontrado", BusinessError.NOT_FOUND);
     
        await this.restaurantRepository.remove(restaurant);
    }

}
