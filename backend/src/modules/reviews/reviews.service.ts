import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceReview } from './entities/performance-review.entity';
import { ReviewCycle } from './entities/review-cycle.entity';
import { ReviewTemplate } from './entities/review-template.entity';
import { ReviewSection } from './entities/review-section.entity';
import { ReviewWorkflowStep } from './entities/review-workflow-step.entity';
import { CreatePerformanceReviewDto, CreateReviewCycleDto, CreateReviewTemplateDto, CreateReviewSectionDto, CreateWorkflowStepDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(PerformanceReview)
    private performanceReviewRepository: Repository<PerformanceReview>,
    @InjectRepository(ReviewCycle)
    private reviewCycleRepository: Repository<ReviewCycle>,
    @InjectRepository(ReviewTemplate)
    private reviewTemplateRepository: Repository<ReviewTemplate>,
    @InjectRepository(ReviewSection)
    private reviewSectionRepository: Repository<ReviewSection>,
    @InjectRepository(ReviewWorkflowStep)
    private reviewWorkflowStepRepository: Repository<ReviewWorkflowStep>,
  ) {}

  // Performance Reviews
  async createPerformanceReview(createPerformanceReviewDto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const review = this.performanceReviewRepository.create(createPerformanceReviewDto);
    return this.performanceReviewRepository.save(review);
  }

  async findAllPerformanceReviews(): Promise<PerformanceReview[]> {
    return this.performanceReviewRepository.find({
      relations: ['employee', 'reviewer', 'review_cycle'],
    });
  }

  async findPerformanceReview(id: string): Promise<PerformanceReview> {
    const review = await this.performanceReviewRepository.findOne({
      where: { id },
      relations: ['employee', 'reviewer', 'review_cycle', 'sections'],
    });
    
    if (!review) {
      throw new Error(`Performance review with ID ${id} not found`);
    }
    
    return review;
  }

  async updatePerformanceReview(id: string, updateData: Partial<CreatePerformanceReviewDto>): Promise<PerformanceReview> {
    await this.performanceReviewRepository.update(id, updateData);
    return this.findPerformanceReview(id);
  }

  async deletePerformanceReview(id: string): Promise<void> {
    const result = await this.performanceReviewRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Performance review with ID ${id} not found`);
    }
  }

  async findPerformanceReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    return this.performanceReviewRepository.find({
      where: { employee_id: employeeId },
      relations: ['reviewer', 'review_cycle'],
      order: { created_at: 'DESC' },
    });
  }

  // Review Cycles
  async createReviewCycle(createReviewCycleDto: CreateReviewCycleDto): Promise<ReviewCycle> {
    const cycle = this.reviewCycleRepository.create(createReviewCycleDto);
    return this.reviewCycleRepository.save(cycle);
  }

  async findAllReviewCycles(): Promise<ReviewCycle[]> {
    return this.reviewCycleRepository.find({
      relations: ['department', 'created_by'],
    });
  }

  async findReviewCycle(id: string): Promise<ReviewCycle> {
    const cycle = await this.reviewCycleRepository.findOne({
      where: { id },
      relations: ['department', 'created_by', 'reviews'],
    });
    
    if (!cycle) {
      throw new Error(`Review cycle with ID ${id} not found`);
    }
    
    return cycle;
  }

  async updateReviewCycle(id: string, updateData: Partial<CreateReviewCycleDto>): Promise<ReviewCycle> {
    await this.reviewCycleRepository.update(id, updateData);
    return this.findReviewCycle(id);
  }

  async deleteReviewCycle(id: string): Promise<void> {
    const result = await this.reviewCycleRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Review cycle with ID ${id} not found`);
    }
  }

  // Review Templates
  async createReviewTemplate(createReviewTemplateDto: CreateReviewTemplateDto): Promise<ReviewTemplate> {
    const template = this.reviewTemplateRepository.create(createReviewTemplateDto);
    return this.reviewTemplateRepository.save(template);
  }

  async findAllReviewTemplates(): Promise<ReviewTemplate[]> {
    return this.reviewTemplateRepository.find({
      relations: ['department', 'created_by'],
    });
  }

  async findReviewTemplate(id: string): Promise<ReviewTemplate> {
    const template = await this.reviewTemplateRepository.findOne({
      where: { id },
      relations: ['department', 'created_by', 'sections'],
    });
    
    if (!template) {
      throw new Error(`Review template with ID ${id} not found`);
    }
    
    return template;
  }

  async updateReviewTemplate(id: string, updateData: Partial<CreateReviewTemplateDto>): Promise<ReviewTemplate> {
    await this.reviewTemplateRepository.update(id, updateData);
    return this.findReviewTemplate(id);
  }

  async deleteReviewTemplate(id: string): Promise<void> {
    const result = await this.reviewTemplateRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Review template with ID ${id} not found`);
    }
  }

  // Review Sections
  async createReviewSection(createReviewSectionDto: CreateReviewSectionDto): Promise<ReviewSection> {
    const section = this.reviewSectionRepository.create(createReviewSectionDto);
    return this.reviewSectionRepository.save(section);
  }

  async getReviewSections(reviewId: string): Promise<ReviewSection[]> {
    return this.reviewSectionRepository.find({
      where: { reviewId },
      order: { created_at: 'ASC' },
    });
  }

  async findReviewSectionsByReviewId(reviewId: string): Promise<ReviewSection[]> {
    return this.getReviewSections(reviewId);
  }

  // Workflow Steps
  async createWorkflowStep(createWorkflowStepDto: CreateWorkflowStepDto): Promise<ReviewWorkflowStep> {
    const step = this.reviewWorkflowStepRepository.create(createWorkflowStepDto);
    return this.reviewWorkflowStepRepository.save(step);
  }

  async getWorkflowSteps(reviewId: string): Promise<ReviewWorkflowStep[]> {
    return this.reviewWorkflowStepRepository.find({
      where: { review: { id: reviewId } },
      order: { step_order: 'ASC' },
    });
  }

  async findWorkflowStepsByReviewId(reviewId: string): Promise<ReviewWorkflowStep[]> {
    return this.getWorkflowSteps(reviewId);
  }

  // Analytics
  async getAnalyticsOverview(): Promise<any> {
    const totalReviews = await this.performanceReviewRepository.count();
    const completedReviews = await this.performanceReviewRepository.count({
      where: { status: 'completed' },
    });
    const activeCycles = await this.reviewCycleRepository.count({
      where: { status: 'active' },
    });

    return {
      totalReviews,
      completedReviews,
      activeCycles,
      completionRate: totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0,
    };
  }

  async save(review: PerformanceReview): Promise<PerformanceReview> {
    return this.performanceReviewRepository.save(review);
  }
} 