import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { plainToInstance } from 'class-transformer';
import { StarDto } from './star.dto';
import { StarEntity } from './star.entity';
import { StarService } from './star.service';

@Resolver()
export class StarResolver {

    constructor(private starService: StarService) {}

    @Query(() => [StarEntity])
    stars(): Promise<StarEntity[]> {
        return this.starService.findAll();
    }

    @Query(() => StarEntity)
    star(@Args('id') id: string): Promise<StarEntity> {
        return this.starService.findOne(id);
    }

    @Mutation(() => StarEntity)
    createStar(
        @Args('restaurantId') restaurantId: string, 
        @Args('star') starDto: StarDto): Promise<StarEntity> {

        const star = plainToInstance(StarEntity, starDto);
        const restaurant =  plainToInstance(StarEntity, starDto);
        return this.starService.create(star,restaurantId);
    }
 
    @Mutation(() => StarEntity)
    updateStar(
        @Args('restaurantId') restaurantId: string, 
        @Args('id') starId: string, 
        @Args('star') starDto: StarDto): Promise<StarEntity> {
        const star = plainToInstance(StarEntity, starDto);
        return this.starService.update(restaurantId, starId, star);
    }
 
    @Mutation(() => String)
    deleteStar(
        @Args('restaurantId') restaurantId: string, 
        @Args('id') starId: string) {
        this.starService.delete(restaurantId,starId);
        return starId;
    }

}
