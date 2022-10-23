import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  cacheKey = 'product';

  private readonly notFoundMessage: string =
    'El producto con el id dado no fue encontrado';

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<ProductEntity[]> {
    const cached: ProductEntity[] = await this.cacheManager.get<
      ProductEntity[]
    >(this.cacheKey);

    if (!cached) {
      const products: ProductEntity[] = await this.productRepository.find({
        relations: ['category'],
      });
      await this.cacheManager.set(this.cacheKey, products);

      return products;
    }

    return cached;
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    return product;
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    return await this.productRepository.save(product);
  }

  async update(id: string, product: ProductEntity): Promise<ProductEntity> {
    const persistedProduct: ProductEntity =
      await this.productRepository.findOne({ where: { id } });
    if (!persistedProduct)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    product.id = id;

    return await this.productRepository.save(product);
  }

  async delete(id: string) {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id },
    });
    if (!product)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    await this.productRepository.remove(product);
  }
}
