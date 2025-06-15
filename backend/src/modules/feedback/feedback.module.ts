import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from './entities/feedback.entity';
import { FeedbackTag } from './entities/feedback-tag.entity';
import { FeedbackResponse } from './entities/feedback-response.entity';
import { Employee } from '../employees/entities/employee.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback, FeedbackTag, FeedbackResponse, Employee]),
    RbacModule,
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {} 