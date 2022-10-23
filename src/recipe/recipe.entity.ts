import { CultureEntity } from '../culture/culture.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class RecipeEntity {
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
  photoURI: string;

  @Field()
  @Column()
  videoURI: string;

  @Field()
  @Column()
  preparationProcess: string;

  @Field((type) => CultureEntity)
  @ManyToOne(() => CultureEntity, (culture) => culture.recipes, {
    nullable: true,
  })
  @JoinTable()
  culture: CultureEntity;
}
