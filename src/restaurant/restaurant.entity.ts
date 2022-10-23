import { StarEntity } from '../star/star.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { CountryEntity } from '../country/country.entity';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class RestaurantEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  city: string;

  @Field((type) => [StarEntity])
  @OneToMany(() => StarEntity, (star) => star.restaurant)
  stars: StarEntity[];

  @Field((type) => [CultureEntity])
  @ManyToMany(() => CultureEntity, (culture) => culture.restaurants)
  cultures: CultureEntity[];

  @Field((type) => [CountryEntity])
  @ManyToOne(() => CountryEntity, (country) => country.restaurants)
  @JoinTable()
  country: CountryEntity;
}
