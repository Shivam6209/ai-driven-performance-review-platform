import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OkrService } from './okr.service';
import { OkrController } from './okr.controller';
import { Objective } from './entities/objective.entity';
import { KeyResult } from './entities/key-result.entity';
import { OkrCategory } from './entities/okr-category.entity';
import { OkrUpdate } from './entities/okr-update.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Objective, KeyResult, OkrCategory, OkrUpdate]),
  ],
  controllers: [OkrController],
  providers: [OkrService],
  exports: [OkrService],
})
export class OkrModule {} 