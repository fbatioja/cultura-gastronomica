import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { CultureRestaurantService } from './culture-restaurant.service';
import { CultureRestaurantController } from './culture-restaurant.controller';
import { CultureRestaurantResolver } from './culture-restaurant.resolver';

@Module({
  providers: [CultureRestaurantService, CultureRestaurantResolver],
  imports: [
    TypeOrmModule.forFeature([RestaurantEntity, CultureEntity]),
    CacheModule.register()],
  controllers: [CultureRestaurantController],
})
export class CultureRestaurantModule {}
