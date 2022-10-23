import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class StarEntity {

    @Field()
    @PrimaryGeneratedColumn("uuid")
    id: string;
 
    @Field()
    @Column()
    consecutionDate: Date;

    @Field(type => RestaurantEntity)
    @ManyToOne(() => RestaurantEntity, restaurant => restaurant.stars)
    restaurant: RestaurantEntity;

}
