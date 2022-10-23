import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CultureService } from './culture.service';
import { CultureEntity } from './culture.entity';
import { plainToInstance } from 'class-transformer';
import { CultureDto } from './culture.dto';

@Resolver()
export class CultureResolver {
  constructor(private cultureService: CultureService) {}

  @Query(() => [CultureEntity])
  cultures(): Promise<CultureEntity[]> {
    return this.cultureService.findAll();
  }

  @Query(() => CultureEntity)
  culture(@Args('id') id: string): Promise<CultureEntity> {
    return this.cultureService.findOne(id);
  }

  @Mutation(() => CultureEntity)
  createCulture(
    @Args('culture') cultureDto: CultureDto,
  ): Promise<CultureEntity> {
    const culture = plainToInstance(CultureEntity, cultureDto);
    return this.cultureService.create(culture);
  }

  @Mutation(() => CultureEntity)
  updateCulture(
    @Args('id') id: string,
    @Args('culture') cultureDto: CultureDto,
  ): Promise<CultureEntity> {
    const culture = plainToInstance(CultureEntity, cultureDto);
    return this.cultureService.update(id, culture);
  }

  @Mutation(() => String)
  deleteCulture(@Args('id') id: string) {
    this.cultureService.delete(id);
    return id;
  }
}
