import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductCategoryService } from './product-category.service';
import { CategoryEntity } from '../category/category.entity';
import { ProductEntity } from '../product/product.entity';

@Resolver()
export class ProductCategoryResolver {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Query(() => CategoryEntity)
  productCategory(
    @Args('productId') productId: string,
  ): Promise<CategoryEntity> {
    return this.productCategoryService.findCategoryByProductId(productId);
  }

  @Mutation(() => ProductEntity)
  updateProductCategory(
    @Args('productId') productId: string,
    @Args('categoryId') categoryId: string,
  ): Promise<ProductEntity> {
    return this.productCategoryService.associateProductCategory(
      productId,
      categoryId,
    );
  }
}
