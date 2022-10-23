import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StarEntity } from './star.entity';
import { StarService } from './star.service';
import { StarController } from './star.controller';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { Cache } from 'cache-manager';
import { StarResolver } from './star.resolver';

@Module({
  providers: [StarService, StarResolver],
  imports: [
    TypeOrmModule.forFeature([RestaurantEntity, StarEntity]),
    CacheModule.register()],
  controllers: [StarController],

})
export class StarModule {}
