import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CountryEntity } from 'src/country/country.entity';
import { CultureEntity } from 'src/culture/culture.entity';
import { CultureCountryService } from './culture-country.service';

@Resolver()
export class CultureCountryResolver {
  constructor(private readonly cultureCountryService: CultureCountryService) {}

  @Mutation(() => CultureEntity)
  addCountryCulture(
    @Args('cultureId') cultureId: string,
    @Args('countryId') countryId: string,
  ) {
    return this.cultureCountryService.addCountryCulture(cultureId, countryId);
  }

  @Query(() => [CountryEntity])
  findCountriesByCultureId(@Args('cultureId') cultureId: string) {
    return this.cultureCountryService.findCountriesByCultureId(cultureId);
  }

  @Mutation(() => String)
  deleteCountryCulture(
    @Args('cultureId') cultureId: string,
    @Args('countryId') countryId: string,
  ) {
    this.cultureCountryService.deleteCountryCulture(cultureId, countryId);
    return cultureId;
  }
}
