import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CultureEntity } from 'src/culture/culture.entity';
import { ProductEntity } from 'src/product/product.entity';
import { CultureProductService } from './culture-product.service';

@Resolver()
export class CultureProductResolver {
  constructor(private readonly cultureProductService: CultureProductService) {}

  @Mutation(() => CultureEntity)
  addProductCulture(
    @Args('cultureId') cultureId: string,
    @Args('productId') productId: string,
  ) {
    return this.cultureProductService.addProductCulture(cultureId, productId);
  }

  @Query(() => ProductEntity)
  findProductByCultureIdProductId(
    @Args('cultureId') cultureId: string,
    @Args('productId') productId: string,
  ) {
    return this.cultureProductService.findProductByCultureId(
      cultureId,
      productId,
    );
  }

  @Query(() => [ProductEntity])
  findProductsByCultureId(@Args('cultureId') cultureId: string) {
    return this.cultureProductService.findProductsByCultureId(cultureId);
  }

  @Mutation(() => String)
  deleteProductCulture(
    @Args('cultureId') cultureId: string,
    @Args('productId') productId: string,
  ) {
    this.cultureProductService.deleteProductCulture(cultureId, productId);
    return productId;
  }
}
