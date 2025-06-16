import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenAIService } from './services/openai.service';
import { PineconeService } from './services/pinecone.service';
import { VectorEmbeddingService } from './services/vector-embedding.service';
import { AIReviewGeneratorService } from './services/ai-review-generator.service';
import { Employee } from '../employees/entities/employee.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { Objective } from '../okr/entities/objective.entity';
import { KeyResult } from '../okr/entities/key-result.entity';
import { PerformanceReview } from '../reviews/entities/performance-review.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Employee,
      Feedback,
      Objective,
      KeyResult,
      PerformanceReview,
    ]),
  ],
  providers: [
    OpenAIService,
    PineconeService,
    VectorEmbeddingService,
    AIReviewGeneratorService,
  ],
  exports: [
    OpenAIService,
    PineconeService,
    VectorEmbeddingService,
    AIReviewGeneratorService,
  ],
})
export class AIModule {} 