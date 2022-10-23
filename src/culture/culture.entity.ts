import { CountryEntity } from '../country/country.entity';
import { ProductEntity } from '../product/product.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecipeEntity } from '../recipe/recipe.entity';
import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType()
@Entity()
export class CultureEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field((type) => [CountryEntity])
  @ManyToMany(() => CountryEntity, (country) => country.cultures)
  @JoinTable()
  countries: CountryEntity[];

  @Field((type) => [ProductEntity])
  @OneToMany(() => ProductEntity, (product) => product.culture)
  @JoinTable()
  products: ProductEntity[];

  @Field((type) => [RestaurantEntity])
  @ManyToMany(() => RestaurantEntity, (restaurant) => restaurant.cultures)
  @JoinTable()
  restaurants: RestaurantEntity[];

  @Field((type) => [RecipeEntity])
  @OneToMany(() => RecipeEntity, (recipe) => recipe.culture)
  recipes: RecipeEntity[];
}
