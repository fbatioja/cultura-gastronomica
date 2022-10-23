import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../category/category.entity';
import { ProductEntity } from '../../product/product.entity';
import { RestaurantEntity } from '../../restaurant/restaurant.entity';
import { StarEntity } from '../../star/star.entity';
import { CultureEntity } from '../../culture/culture.entity';
import { CountryEntity } from '../../country/country.entity';
import { RecipeEntity } from '../../recipe/recipe.entity';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [
      ProductEntity,
      CategoryEntity,
      RestaurantEntity,
      StarEntity,
      CultureEntity,
      CountryEntity,
      RecipeEntity,
    ],
    synchronize: true,
    keepConnectionAlive: true,
  }),
  TypeOrmModule.forFeature([
    ProductEntity,
    CategoryEntity,
    RestaurantEntity,
    StarEntity,
    CultureEntity,
    CountryEntity,
    RecipeEntity,
  ]),
];
