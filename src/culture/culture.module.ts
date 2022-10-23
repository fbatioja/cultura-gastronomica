import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultureEntity } from './culture.entity';
import { CultureService } from './culture.service';
import { CultureController } from './culture.controller';
import { CultureResolver } from './culture.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([CultureEntity]), CacheModule.register()],
  providers: [CultureService, CultureResolver],
  controllers: [CultureController],
})
export class CultureModule {}
