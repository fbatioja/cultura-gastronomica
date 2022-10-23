import { CultureEntity } from '../culture/culture.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class CountryEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Field()
  @Column()
  name: string;

  @Field((type) => [CultureEntity])
  @ManyToMany(() => CultureEntity, (culture) => culture.countries)
  cultures: CultureEntity[];

  @Field((type) => [RestaurantEntity])
  @OneToMany(() => RestaurantEntity, (restaurant) => restaurant.country)
  restaurants: RestaurantEntity[];
}
