import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/product/product.entity';
import { CultureEntity } from '../culture/culture.entity';
import { CultureProductService } from './culture-product.service';
import { CultureProductController } from './culture-product.controller';
import { CultureProductResolver } from './culture-product.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, CultureEntity]),
    CacheModule.register(),
  ],
  providers: [CultureProductService, CultureProductResolver],
  controllers: [CultureProductController],
})
export class CultureProductModule {}
