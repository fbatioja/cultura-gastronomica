import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {IsDate, IsNotEmpty, IsString, IsUrl} from 'class-validator';
import { RestaurantEntity } from 'src/restaurant/restaurant.entity';

@InputType()
export class StarDto {

 @Field()
 @IsDate()
 @IsNotEmpty()
 @Transform( ({ value }) => new Date(value))
 readonly consecutionDate: Date;

}