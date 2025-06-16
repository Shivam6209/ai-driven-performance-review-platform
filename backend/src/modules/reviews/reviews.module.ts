import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { AIReviewService } from './services/ai-review.service';
import { PerformanceReview } from './entities/performance-review.entity';
import { ReviewCycle } from './entities/review-cycle.entity';
import { ReviewSection } from './entities/review-section.entity';
import { ReviewTemplate } from './entities/review-template.entity';
import { ReviewTemplateSection } from './entities/review-template-section.entity';
import { ReviewWorkflowStep } from './entities/review-workflow-step.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { Objective } from '../okr/entities/objective.entity';
import { RbacModule } from '../rbac/rbac.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerformanceReview,
      ReviewCycle,
      ReviewSection,
      ReviewTemplate,
      ReviewTemplateSection,
      ReviewWorkflowStep,
      Employee,
      Feedback,
      Objective,
    ]),
    RbacModule,
    NotificationsModule,
    AIModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, AIReviewService],
  exports: [ReviewsService, AIReviewService],
})
export class ReviewsModule {} 