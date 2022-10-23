/* eslint-disable prettier/prettier */

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
@InputType()
export class RecipeDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @Field()
  @IsUrl()
  @IsNotEmpty()
  readonly photoURI: string;

  @Field()
  @IsUrl()
  @IsNotEmpty()
  readonly videoURI: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly preparationProcess: string;
}
