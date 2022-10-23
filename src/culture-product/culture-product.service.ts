import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { ProductEntity } from '../product/product.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

@Injectable()
export class CultureProductService {
  cacheKey = 'culture-product';
  private readonly cultureNotFoundMessage: string =
    'La cultura con el id dado no fue encontrado';
  private readonly productNotFoundMessage: string =
    'El product con el id dado no fue encontrado';
  private readonly associationNotFoundMessage: string =
    'La cultura no tiene una asociación con el producto dado';

  constructor(
    @InjectRepository(CultureEntity)
    private readonly cultureRepository: Repository<CultureEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async addProductCulture(
    cultureId: string,
    productId: string,
  ): Promise<CultureEntity> {
    const [product, culture] = await Promise.all([
      this.productRepository.findOne({
        where: { id: productId },
      }),
      this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['products'],
      }),
    ]);
    if (!product)
      throw new BusinessLogicException(
        this.productNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    culture.products.push(product);
    return await this.cultureRepository.save(culture);
  }

  async findProductByCultureId(
    cultureId: string,
    productId: string,
  ): Promise<ProductEntity> {
    const [product, culture] = await Promise.all([
      this.productRepository.findOne({
        where: { id: productId },
      }),
      this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['products'],
      }),
    ]);
    if (!product)
      throw new BusinessLogicException(
        this.productNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const cultureProduct: ProductEntity = culture.products.find(
      ({ id }) => product.id === id,
    );

    if (!cultureProduct)
      throw new BusinessLogicException(
        this.associationNotFoundMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    return cultureProduct;
  }

  async findProductsByCultureId(cultureId: string): Promise<ProductEntity[]> {
    const cached: ProductEntity[] = await this.cacheManager.get<
      ProductEntity[]
    >(this.cacheKey + cultureId);

    if (!cached) {
      const culture: CultureEntity = await this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['products'],
      });
      if (!culture)
        throw new BusinessLogicException(
          this.cultureNotFoundMessage,
          BusinessError.NOT_FOUND,
        );
      await this.cacheManager.set(this.cacheKey + cultureId, culture.products);
      return culture.products;
    }
    return cached;
  }

  async deleteProductCulture(cultureId: string, productId: string) {
    const [product, culture] = await Promise.all([
      this.productRepository.findOne({
        where: { id: productId },
      }),
      this.cultureRepository.findOne({
        where: { id: cultureId },
        relations: ['products'],
      }),
    ]);
    if (!product)
      throw new BusinessLogicException(
        this.productNotFoundMessage,
        BusinessError.NOT_FOUND,
      );
    if (!culture)
      throw new BusinessLogicException(
        this.cultureNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const productCulture: ProductEntity = culture.products.find(
      ({ id }) => id === product.id,
    );

    if (!productCulture)
      throw new BusinessLogicException(
        this.associationNotFoundMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    culture.products = culture.products.filter(
      ({ id }) => id !== productCulture.id,
    );
    await this.cultureRepository.save(culture);
  }
}
