import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { CountryResolver } from './country.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity]), CacheModule.register()],
  providers: [CountryService, CountryResolver],
  controllers: [CountryController],
})
export class CountryModule {}
