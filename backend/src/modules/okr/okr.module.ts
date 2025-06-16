import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OkrService } from './okr.service';
import { OkrController } from './okr.controller';
import { Objective } from './entities/objective.entity';
import { KeyResult } from './entities/key-result.entity';
import { OkrCategory } from './entities/okr-category.entity';
import { OkrUpdate } from './entities/okr-update.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Objective, KeyResult, OkrCategory, OkrUpdate, Employee]),
    NotificationsModule,
  ],
  controllers: [OkrController],
  providers: [OkrService],
  exports: [OkrService],
})
export class OkrModule {} 