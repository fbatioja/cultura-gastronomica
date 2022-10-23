import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from '../country/country.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { RestaurantCountryController } from './restaurant-country.controller';
import { RestaurantCountryService } from './retaurant-country.service';
import { Cache } from 'cache-manager';
import { RestaurantCountryResolver } from './restaurant-country.resolver';

@Module({
  providers: [RestaurantCountryService, RestaurantCountryResolver],
  imports: [
    TypeOrmModule.forFeature([RestaurantEntity, CountryEntity]),
    CacheModule.register(),
  ],
  controllers: [RestaurantCountryController],
})
export class RetaurantCountryModule {}
