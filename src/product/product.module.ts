import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductResolver } from './product.resolver';

@Module({
  providers: [ProductService, ProductResolver],
  imports: [TypeOrmModule.forFeature([ProductEntity]), CacheModule.register()],
  controllers: [ProductController],
})
export class ProductModule {}
