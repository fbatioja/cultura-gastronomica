import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { RestaurantResolver } from './restaurant.resolver';

@Module({
  providers: [RestaurantService, RestaurantResolver],
  imports: [
    TypeOrmModule.forFeature([RestaurantEntity]),
    CacheModule.register()],
  controllers: [RestaurantController],

})

export class RestaurantModule {}
