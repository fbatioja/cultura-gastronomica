import { CategoryEntity } from '../category/category.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CultureEntity } from '../culture/culture.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class ProductEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  history: string;

  @Field(() => [ProductEntity])
  @ManyToOne(() => CategoryEntity, (category) => category.products)
  category: CategoryEntity;

  @Field((type) => CultureEntity)
  @ManyToOne(() => CultureEntity, (culture) => culture.products)
  culture: CultureEntity;
}
