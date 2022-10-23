import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CultureEntity } from 'src/culture/culture.entity';
import { RestaurantEntity } from 'src/restaurant/restaurant.entity';
import { CultureRestaurantService } from './culture-restaurant.service';

@Resolver()
export class CultureRestaurantResolver {
  constructor(
    private readonly cultureRestaurantService: CultureRestaurantService,
  ) {}

  @Query(() => [RestaurantEntity])
  findRestaurantsByCultureId(
    @Args('cultureId') cultureId: string,
  ): Promise<RestaurantEntity[]> {
    return this.cultureRestaurantService.findRestaurantsByCultureId(cultureId);
  }

  @Query(() => RestaurantEntity)
  findRecipeByCultureId(
    @Args('cultureId') cultureId: string,
    @Args('restaurantId') restaurantId: string,
  ): Promise<RestaurantEntity> {
    return this.cultureRestaurantService.findRestaurantByCultureId(
      cultureId,
      restaurantId,
    );
  }

  @Mutation(() => CultureEntity)
  addRecipeCulture(
    @Args('cultureId') cultureId: string,
    @Args('restaurantId') restaurantId: string,
  ): Promise<CultureEntity> {
    return this.cultureRestaurantService.addRestaurantCulture(
      cultureId,
      restaurantId,
    );
  }

  @Mutation(() => CultureEntity)
  deleteRecipeCulture(
    @Args('cultureId') cultureId: string,
    @Args('restaurantId') restaurantId: string,
  ) {
    return this.cultureRestaurantService.deleteRestaurantCulture(
      cultureId,
      restaurantId,
    );
  }
}
