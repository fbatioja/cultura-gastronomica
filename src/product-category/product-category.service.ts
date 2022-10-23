import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '../category/category.entity';
import { ProductEntity } from '../product/product.entity';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class ProductCategoryService {
  private readonly categoryNotFoundMessage: string =
    'La categoria con el id dado no fue encontrada';

  private readonly productNotFoundMessage: string =
    'El producto con el id dado no fue encontrado';

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findCategoryByProductId(productId: string): Promise<CategoryEntity> {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category'],
    });
    if (!product)
      throw new BusinessLogicException(
        this.productNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    return product.category;
  }

  async associateProductCategory(
    productId: string,
    categoryId: string,
  ): Promise<ProductEntity> {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category'],
    });

    if (!product)
      throw new BusinessLogicException(
        this.productNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    const category: CategoryEntity = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category)
      throw new BusinessLogicException(
        this.categoryNotFoundMessage,
        BusinessError.NOT_FOUND,
      );

    product.category = category;
    return await this.productRepository.save(product);
  }
}
