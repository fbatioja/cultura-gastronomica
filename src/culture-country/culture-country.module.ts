import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from '../country/country.entity';
import { CultureEntity } from '../culture/culture.entity';
import { CultureCountryService } from './culture-country.service';
import { CultureCountryController } from './culture-country.controller';
import { CultureCountryResolver } from './culture-country.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([CountryEntity, CultureEntity]),
    CacheModule.register(),
  ],
  providers: [CultureCountryService, CultureCountryResolver],
  controllers: [CultureCountryController],
})
export class CultureCountryModule {}
