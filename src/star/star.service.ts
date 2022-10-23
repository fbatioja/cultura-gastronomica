import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { StarEntity } from './star.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { Cache } from 'cache-manager';


@Injectable()
export class StarService {

    cacheKey: string = "star";
    constructor(

        @InjectRepository(RestaurantEntity)
        private readonly restaurantRepository: Repository<RestaurantEntity>,
    
        @InjectRepository(StarEntity)
        private readonly starRepository: Repository<StarEntity>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache

    ){}

    private readonly restaurantNotFoundMessage: string =
    'El restaurante con el id dado no fue encontrado';

    private readonly restaurantMaxStars: string =
    'El restaurante ya tiene 3 estrellas michelin';

    private readonly starNotFoundMessage: string = 
    "La estrella con el id dado no fue encontrada";

    async findAll(): Promise<StarEntity[]> {
        const cached: StarEntity[] = await this.cacheManager.get<StarEntity[]>(this.cacheKey);
      
        if(!cached){
            const stars: StarEntity[] = await await this.starRepository.find();
            await this.cacheManager.set(this.cacheKey, stars);
            return stars;
        }
 
        return cached;
    }

    async findAllByRestaurant(restaurantId:string): Promise<StarEntity[]> {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({
            where: { id: restaurantId },
            relations: ['stars'],
        });

        if (!restaurant)
        throw new BusinessLogicException(
            this.restaurantNotFoundMessage,
            BusinessError.NOT_FOUND,
        ) 

        return restaurant.stars;

    }

    async findOne(id: string): Promise<StarEntity> {
        const star: StarEntity = await this.starRepository.findOne({where: {id}});
        if (!star)
          throw new BusinessLogicException(this.starNotFoundMessage, BusinessError.NOT_FOUND);
   
        return star;
    }

    async create(star: StarEntity, restaurantId: string): Promise<StarEntity> {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({
            where: { id: restaurantId },
            relations: ['stars'],
        });
        
        if (!restaurant)
        throw new BusinessLogicException(
            this.restaurantNotFoundMessage,
            BusinessError.NOT_FOUND,
        ) 

        if(restaurant.stars?.length >= 3)
        throw new BusinessLogicException(
            this.restaurantMaxStars,
            BusinessError.PRECONDITION_FAILED,
        );
        
        star.restaurant = restaurant;
        return await this.starRepository.save(star);
    }
    
    async update(restaurantId: string, id: string, star: StarEntity): Promise<StarEntity> {
        
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({
            where: { id: restaurantId },
            relations: ['stars'],
        });
        
        if (!restaurant)
        throw new BusinessLogicException(
            this.restaurantNotFoundMessage,
            BusinessError.NOT_FOUND,
        )         
        
        const persistedstar: StarEntity = await this.starRepository.findOne({where:{id}});
        if (!persistedstar)
          throw new BusinessLogicException(this.starNotFoundMessage, BusinessError.NOT_FOUND);
        
        return await this.starRepository.save({...persistedstar, ...star});
    }

    async delete(restaurantId: string, id: string) {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({
            where: { id: restaurantId },
            relations: ['stars'],
        });
        
        if (!restaurant)
        throw new BusinessLogicException(
            this.restaurantNotFoundMessage,
            BusinessError.NOT_FOUND,
        )

        const star: StarEntity = await this.starRepository.findOne({where:{id}});
        if (!star)
          throw new BusinessLogicException(this.starNotFoundMessage, BusinessError.NOT_FOUND);
     
        await this.starRepository.remove(star);
    }

}
