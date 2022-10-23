import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CountryEntity } from 'src/country/country.entity';
import { RestaurantEntity } from 'src/restaurant/restaurant.entity';
import { RestaurantCountryService } from './retaurant-country.service';

@Resolver()
export class RestaurantCountryResolver {
  constructor(
    private readonly restaurantCountryService: RestaurantCountryService,
  ) {}

  @Query(() => CountryEntity)
  rsetaurantCountry(
    @Args('restaurantId') restaurantId: string,
  ): Promise<CountryEntity> {
    return this.restaurantCountryService.findCountryByRestaurantId(
      restaurantId,
    );
  }

  @Mutation(() => RestaurantEntity)
  updateRestaurantCountry(
    @Args('restaurantId') restaurantId: string,
    @Args('countryId') countryId: string,
  ): Promise<RestaurantEntity> {
    return this.restaurantCountryService.associateCountryRestaurant(
      restaurantId,
      countryId,
    );
  }
}
