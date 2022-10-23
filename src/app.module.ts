import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ProductEntity } from './product/product.entity';
import { CategoryEntity } from './category/category.entity';
import { ProductCategoryModule } from './product-category/product-category.module';
import { RestaurantEntity } from './restaurant/restaurant.entity';
import { StarEntity } from './star/star.entity';
import { CultureModule } from './culture/culture.module';
import { CountryModule } from './country/country.module';
import { RecipeModule } from './recipe/recipe.module';
import { RecipeEntity } from './recipe/recipe.entity';
import { CultureRecipeModule } from './culture-recipe/culture-recipe.module';
import { CultureProductModule } from './culture-product/culture-product.module';
import { CultureRestaurantModule } from './culture-restaurant/culture-restaurant.module';
import { CultureCountryModule } from './culture-country/culture-country.module';
import { CountryEntity } from './country/country.entity';
import { CultureEntity } from './culture/culture.entity';
import { RestaurantModule } from './restaurant/restaurant.module';
import { RetaurantCountryModule } from './restaurant-country/retaurant-country.module';
import { StarModule } from './star/star.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    ProductModule,
    CategoryModule,
    ProductCategoryModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'gastronomic',
      entities: [
        ProductEntity,
        CategoryEntity,
        RestaurantEntity,
        StarEntity,
        RecipeEntity,
        CountryEntity,
        CultureEntity,
      ],
      dropSchema: false,
      synchronize: true,
      keepConnectionAlive: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      driver: ApolloDriver,
    }),
    CultureModule,
    CountryModule,
    CultureCountryModule,
    RecipeModule,
    CultureRecipeModule,
    CultureProductModule,
    CultureRestaurantModule,
    RestaurantModule,
    RetaurantCountryModule,
    StarModule,
    UserModule,
    AuthModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      driver: ApolloDriver,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
