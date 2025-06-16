import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceReview } from './entities/performance-review.entity';
import { ReviewCycle } from './entities/review-cycle.entity';
import { ReviewTemplate } from './entities/review-template.entity';
import { ReviewSection } from './entities/review-section.entity';
import { ReviewWorkflowStep } from './entities/review-workflow-step.entity';
import { Employee } from '../employees/entities/employee.entity';
import { 
  CreatePerformanceReviewDto,
  CreateReviewCycleDto,
  CreateReviewTemplateDto,
  CreateReviewSectionDto,
  CreateWorkflowStepDto
} from './dto';
import { AIReviewService } from './services/ai-review.service';

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
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private aiReviewService: AIReviewService,
  ) {}

  async createPerformanceReview(createPerformanceReviewDto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const review = this.performanceReviewRepository.create(createPerformanceReviewDto);
    return this.performanceReviewRepository.save(review);
  }

  /**
   * Generate AI-powered performance review
   */
  async generateAIReview(
    employeeId: string,
    reviewerId: string,
    reviewCycleId: string,
    reviewType: 'self' | 'manager' | 'peer' | '360' | 'upward',
    organizationId: string,
  ): Promise<PerformanceReview> {
    console.log('🚀 Starting AI review generation process...');

    // Validate employee exists
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if review cycle exists
    const reviewCycle = await this.reviewCycleRepository.findOne({
      where: { id: reviewCycleId },
    });

    if (!reviewCycle) {
      throw new NotFoundException('Review cycle not found');
    }

    try {
      // Generate AI content
      const aiContent = await this.aiReviewService.generatePerformanceReview(
        employeeId,
        reviewerId,
        reviewType,
        organizationId
      );

      // Validate AI content
      const validation = await this.aiReviewService.validateGeneratedContent(aiContent);

      if (!validation.isValid) {
        console.warn('AI validation failed:', validation.issues);
        // Create empty review for manual completion
        return this.createEmptyReview(employeeId, reviewerId, reviewCycleId, reviewType, organizationId);
      }

      // Create AI-generated review
      const review = this.performanceReviewRepository.create({
        employee_id: employeeId,
        reviewer_id: reviewerId,
        review_cycle_id: reviewCycleId,
        review_type: reviewType,
        status: 'ai_generated',
        organizationId,
        is_ai_generated: true,
        ai_confidence_score: aiContent.confidence_score,
        ai_generated_at: new Date(),
        ai_sources: aiContent.sources,
        strengths: aiContent.strengths,
        areas_for_improvement: aiContent.areas_for_improvement,
        achievements: aiContent.achievements,
        goals_for_next_period: aiContent.goals_for_next_period,
        development_plan: aiContent.development_plan,
        due_date: reviewCycle.end_date,
      });

      const savedReview = await this.performanceReviewRepository.save(review);

      // Send notification (simplified - assuming basic notification structure)
      try {
        // Note: Adjust this based on your actual NotificationsService interface
        console.log('Sending notification for AI review generation');
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError);
      }

      console.log('✅ AI review generated successfully');
      return savedReview;

    } catch (error) {
      console.error('❌ AI review generation failed:', error);
      
      // Fallback to empty review
      const fallbackReview = await this.createEmptyReview(employeeId, reviewerId, reviewCycleId, reviewType, organizationId);
      
      // Notify about fallback (simplified)
      try {
        console.log('Sending fallback notification');
      } catch (notificationError) {
        console.warn('Failed to send fallback notification:', notificationError);
      }

      return fallbackReview;
    }
  }

  /**
   * Create empty review template for manual completion
   */
  private async createEmptyReview(
    employeeId: string,
    reviewerId: string,
    reviewCycleId: string,
    reviewType: string,
    organizationId: string
  ): Promise<PerformanceReview> {
    const reviewCycle = await this.reviewCycleRepository.findOne({
      where: { id: reviewCycleId },
    });

    const review = this.performanceReviewRepository.create({
      employee_id: employeeId,
      reviewer_id: reviewerId,
      review_cycle_id: reviewCycleId,
      review_type: reviewType,
      status: 'draft',
      organizationId,
      is_ai_generated: false,
      due_date: reviewCycle?.end_date || new Date(),
      strengths: '',
      areas_for_improvement: '',
      achievements: '',
      goals_for_next_period: '',
      development_plan: '',
    });

    return this.performanceReviewRepository.save(review);
  }

  /**
   * Edit AI-generated review content
   */
  async editAIReview(
    reviewId: string,
    updates: Partial<PerformanceReview>,
    editorId: string,
    organizationId: string
  ): Promise<PerformanceReview> {
    const review = await this.findPerformanceReview(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Get editor information
    const editor = await this.employeeRepository.findOne({
      where: { id: editorId, organizationId },
    });

    if (!editor) {
      throw new NotFoundException('Editor not found');
    }

    // Update review with human edits
    const updatedData = {
      ...updates,
      human_edited: true,
      human_edited_at: new Date(),
      human_edited_by_id: editor.id,
      status: 'in_progress' as any,
    };

    // Merge with existing review
    Object.assign(review, updatedData);
    const updatedReview = await this.performanceReviewRepository.save(review);

    // Notify about human edits (simplified)
    try {
      console.log('Sending edit notification');
    } catch (notificationError) {
      console.warn('Failed to send edit notification:', notificationError);
    }

    return updatedReview;
  }

  /**
   * Submit review for approval
   */
  async submitReview(reviewId: string): Promise<PerformanceReview> {
    const review = await this.findPerformanceReview(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Update status to submitted
    review.status = 'submitted';
    review.submitted_at = new Date();

    const updatedReview = await this.performanceReviewRepository.save(review);

    // Get employee and manager for notifications
    const employee = await this.employeeRepository.findOne({
      where: { id: review.employee_id },
      relations: ['manager'],
    });

    if (employee?.manager) {
      try {
        console.log('Sending submission notification to manager');
      } catch (notificationError) {
        console.warn('Failed to send submission notification:', notificationError);
      }
    }

    return updatedReview;
  }

  /**
   * Approve review
   */
  async approveReview(reviewId: string, approverId: string, organizationId: string): Promise<PerformanceReview> {
    const review = await this.findPerformanceReview(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Get approver information
    const approver = await this.employeeRepository.findOne({
      where: { id: approverId, organizationId },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    // Update review status
    review.status = 'approved';
    review.approved_at = new Date();
    // Note: Using approved_by instead of approved_by_id based on entity structure
    review.approved_by = approver;

    const approvedReview = await this.performanceReviewRepository.save(review);

    // Send approval notification (simplified)
    try {
      console.log('Sending approval notification');
    } catch (notificationError) {
      console.warn('Failed to send approval notification:', notificationError);
    }

    return approvedReview;
  }

  async findAllPerformanceReviews(organizationId?: string): Promise<PerformanceReview[]> {
    const whereCondition = organizationId ? { organizationId } : {};
    return this.performanceReviewRepository.find({
      where: whereCondition,
      relations: ['employee', 'reviewer'],
    });
  }

  async findPerformanceReview(id: string): Promise<PerformanceReview> {
    const review = await this.performanceReviewRepository.findOne({
      where: { id },
      relations: ['employee', 'reviewer', 'reviewCycle'],
    });

    if (!review) {
      throw new NotFoundException(`Performance review with ID ${id} not found`);
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
      throw new NotFoundException(`Performance review with ID ${id} not found`);
    }
  }

  async findPerformanceReviewsByEmployee(employeeId: string, organizationId?: string): Promise<PerformanceReview[]> {
    const whereCondition: any = { employee_id: employeeId };
    if (organizationId) {
      whereCondition.organizationId = organizationId;
    }

    return this.performanceReviewRepository.find({
      where: whereCondition,
      relations: ['reviewer', 'reviewCycle'],
      order: { created_at: 'DESC' },
    });
  }

  // Review Cycle methods
  async createReviewCycle(createReviewCycleDto: CreateReviewCycleDto): Promise<ReviewCycle> {
    const reviewCycle = this.reviewCycleRepository.create(createReviewCycleDto);
    return this.reviewCycleRepository.save(reviewCycle);
  }

  async findAllReviewCycles(): Promise<ReviewCycle[]> {
    return this.reviewCycleRepository.find({
      relations: ['reviews'],
    });
  }

  async findReviewCycle(id: string): Promise<ReviewCycle> {
    const reviewCycle = await this.reviewCycleRepository.findOne({
      where: { id },
      relations: ['reviews'],
    });

    if (!reviewCycle) {
      throw new NotFoundException(`Review cycle with ID ${id} not found`);
    }

    return reviewCycle;
  }

  async updateReviewCycle(id: string, updateData: Partial<CreateReviewCycleDto>): Promise<ReviewCycle> {
    await this.reviewCycleRepository.update(id, updateData);
    return this.findReviewCycle(id);
  }

  async deleteReviewCycle(id: string): Promise<void> {
    const result = await this.reviewCycleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Review cycle with ID ${id} not found`);
    }
  }

  // Review Template methods
  async createReviewTemplate(createReviewTemplateDto: CreateReviewTemplateDto): Promise<ReviewTemplate> {
    const reviewTemplate = this.reviewTemplateRepository.create(createReviewTemplateDto);
    return this.reviewTemplateRepository.save(reviewTemplate);
  }

  async findAllReviewTemplates(): Promise<ReviewTemplate[]> {
    return this.reviewTemplateRepository.find({
      relations: ['sections'],
    });
  }

  async findReviewTemplate(id: string): Promise<ReviewTemplate> {
    const reviewTemplate = await this.reviewTemplateRepository.findOne({
      where: { id },
      relations: ['sections'],
    });

    if (!reviewTemplate) {
      throw new NotFoundException(`Review template with ID ${id} not found`);
    }

    return reviewTemplate;
  }

  async updateReviewTemplate(id: string, updateData: Partial<CreateReviewTemplateDto>): Promise<ReviewTemplate> {
    await this.reviewTemplateRepository.update(id, updateData);
    return this.findReviewTemplate(id);
  }

  async deleteReviewTemplate(id: string): Promise<void> {
    const result = await this.reviewTemplateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Review template with ID ${id} not found`);
    }
  }

  // Review Section methods
  async createReviewSection(createReviewSectionDto: CreateReviewSectionDto): Promise<ReviewSection> {
    const reviewSection = this.reviewSectionRepository.create(createReviewSectionDto);
    return this.reviewSectionRepository.save(reviewSection);
  }

  async getReviewSections(reviewId: string): Promise<ReviewSection[]> {
    return this.reviewSectionRepository.find({
      where: { reviewId: reviewId },
      order: { section_order: 'ASC' },
    });
  }

  async findReviewSectionsByReviewId(reviewId: string): Promise<ReviewSection[]> {
    return this.getReviewSections(reviewId);
  }

  async createWorkflowStep(createWorkflowStepDto: CreateWorkflowStepDto): Promise<ReviewWorkflowStep> {
    const workflowStep = this.reviewWorkflowStepRepository.create(createWorkflowStepDto);
    return this.reviewWorkflowStepRepository.save(workflowStep);
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

  async getAnalyticsOverview(organizationId?: string): Promise<any> {
    const whereCondition = organizationId ? { organizationId } : {};
    
    const totalReviews = await this.performanceReviewRepository.count({ where: whereCondition });
    const completedReviews = await this.performanceReviewRepository.count({ 
      where: { ...whereCondition, status: 'approved' } 
    });
    const aiGeneratedReviews = await this.performanceReviewRepository.count({ 
      where: { ...whereCondition, is_ai_generated: true } 
    });
    const humanEditedReviews = await this.performanceReviewRepository.count({ 
      where: { ...whereCondition, human_edited: true } 
    });

    // Calculate average confidence score for AI reviews
    const aiReviews = await this.performanceReviewRepository.find({
      where: { ...whereCondition, is_ai_generated: true },
      select: ['ai_confidence_score'],
    });

    const avgConfidenceScore = aiReviews.length > 0 
      ? aiReviews.reduce((sum, review) => sum + (review.ai_confidence_score || 0), 0) / aiReviews.length
      : 0;

    return {
      totalReviews,
      completedReviews,
      aiGeneratedReviews,
      humanEditedReviews,
      completionRate: totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0,
      aiAdoptionRate: totalReviews > 0 ? (aiGeneratedReviews / totalReviews) * 100 : 0,
      humanEditRate: aiGeneratedReviews > 0 ? (humanEditedReviews / aiGeneratedReviews) * 100 : 0,
      avgConfidenceScore: avgConfidenceScore * 100, // Convert to percentage
    };
  }

  async save(review: PerformanceReview): Promise<PerformanceReview> {
    return this.performanceReviewRepository.save(review);
  }
} 