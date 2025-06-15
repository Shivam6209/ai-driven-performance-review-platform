import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { SentimentService } from './sentiment.service';
import { SentimentController } from './sentiment.controller';
import { AiMonitoringService } from './ai-monitoring.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiGeneration } from './entities/ai-generation.entity';
import { EmployeesModule } from '../employees/employees.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { OkrModule } from '../okr/okr.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiGeneration]),
    EmployeesModule,
    FeedbackModule,
    OkrModule,
    ProjectsModule,
  ],
  controllers: [AiController, SentimentController],
  providers: [AiService, EmbeddingService, SentimentService, AiMonitoringService],
  exports: [AiService, EmbeddingService, SentimentService, AiMonitoringService],
})
export class AiModule {} 