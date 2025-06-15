import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PerformanceReview } from './entities/performance-review.entity';
import { ReviewCycle } from './entities/review-cycle.entity';
import { ReviewSection } from './entities/review-section.entity';
import { ReviewTemplate } from './entities/review-template.entity';
import { ReviewTemplateSection } from './entities/review-template-section.entity';
import { ReviewWorkflowStep } from './entities/review-workflow-step.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerformanceReview,
      ReviewCycle,
      ReviewSection,
      ReviewTemplate,
      ReviewTemplateSection,
      ReviewWorkflowStep,
    ]),
    RbacModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {} 