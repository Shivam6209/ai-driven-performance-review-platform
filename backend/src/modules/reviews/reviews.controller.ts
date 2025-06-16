import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Performance Review Endpoints
  @Post()
  @RequirePermissions('reviews', 'create')
  async createPerformanceReview(@Body() createReviewDto: any, @Request() req: any) {
    return this.reviewsService.createPerformanceReview({
      ...createReviewDto,
      createdBy: req.user.userId
    });
  }

  @Get()
  @RequirePermissions('reviews', 'read')
  async findAllPerformanceReviews(@Query() query: any, @Request() req: any) {
    // Employees can only see their own reviews unless they're HR/Manager
    if (req.user.role === 'employee') {
      query.employeeId = req.user.userId;
    }
    return this.reviewsService.findAllPerformanceReviews();
  }

  @Get(':id')
  @RequirePermissions('reviews', 'read')
  async findPerformanceReviewById(@Param('id') id: string, @Request() req: any) {
    const review = await this.reviewsService.findPerformanceReview(id);
    
    // Check if employee can access this review
    if (req.user.role === 'employee' && 
        review.employee.id !== req.user.userId && 
        review.reviewer?.id !== req.user.userId) {
      throw new Error('Access denied to this review');
    }
    
    return review;
  }

  @Put(':id')
  @RequirePermissions('reviews', 'update')
  async updatePerformanceReview(
    @Param('id') id: string, 
    @Body() updateReviewDto: any,
    @Request() req: any
  ) {
    return this.reviewsService.updatePerformanceReview(id, {
      ...updateReviewDto,
      updatedBy: req.user.userId
    });
  }

  @Delete(':id')
  @RequirePermissions('reviews', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePerformanceReview(@Param('id') id: string) {
    return this.reviewsService.deletePerformanceReview(id);
  }

  // Review Cycle Endpoints
  @Post('cycles')
  @RequirePermissions('review_cycles', 'create')
  async createReviewCycle(@Body() createCycleDto: any, @Request() req: any) {
    return this.reviewsService.createReviewCycle({
      ...createCycleDto,
      createdBy: req.user.userId
    });
  }

  @Get('cycles')
  @RequirePermissions('review_cycles', 'read')
  async findAllReviewCycles() {
    return this.reviewsService.findAllReviewCycles();
  }

  @Get('cycles/:id')
  @RequirePermissions('review_cycles', 'read')
  async findReviewCycleById(@Param('id') id: string) {
    return this.reviewsService.findReviewCycle(id);
  }

  @Put('cycles/:id')
  @RequirePermissions('review_cycles', 'update')
  async updateReviewCycle(
    @Param('id') id: string, 
    @Body() updateCycleDto: any,
    @Request() req: any
  ) {
    return this.reviewsService.updateReviewCycle(id, {
      ...updateCycleDto,
      updatedBy: req.user.userId
    });
  }

  // Review Template Endpoints
  @Post('templates')
  @RequirePermissions('review_templates', 'create')
  async createReviewTemplate(@Body() createTemplateDto: any, @Request() req: any) {
    return this.reviewsService.createReviewTemplate({
      ...createTemplateDto,
      createdBy: req.user.userId
    });
  }

  @Get('templates')
  @RequirePermissions('review_templates', 'read')
  async findAllReviewTemplates() {
    return this.reviewsService.findAllReviewTemplates();
  }

  @Get('templates/:id')
  @RequirePermissions('review_templates', 'read')
  async findReviewTemplateById(@Param('id') id: string) {
    return this.reviewsService.findReviewTemplate(id);
  }

  @Put('templates/:id')
  @RequirePermissions('review_templates', 'update')
  async updateReviewTemplate(
    @Param('id') id: string, 
    @Body() updateTemplateDto: any,
    @Request() req: any
  ) {
    return this.reviewsService.updateReviewTemplate(id, {
      ...updateTemplateDto,
      updatedBy: req.user.userId
    });
  }

  // Review Section Endpoints
  @Post('sections')
  @RequirePermissions('review_sections', 'create')
  async createReviewSection(@Body() createSectionDto: any, @Request() req: any) {
    return this.reviewsService.createReviewSection({
      ...createSectionDto,
      createdBy: req.user.userId
    });
  }

  @Get(':reviewId/sections')
  @RequirePermissions('review_sections', 'read')
  async findReviewSectionsByReviewId(@Param('reviewId') reviewId: string) {
    return this.reviewsService.findReviewSectionsByReviewId(reviewId);
  }

  @Put('sections/:id')
  @RequirePermissions('review_sections', 'update')
  async updateReviewSection() {
    // TODO: Implement updateReviewSection in service
    throw new Error('Update review section not implemented yet');
  }

  // Workflow Step Endpoints
  @Post('workflow-steps')
  @RequirePermissions('workflow_steps', 'create')
  async createWorkflowStep(@Body() createStepDto: any, @Request() req: any) {
    return this.reviewsService.createWorkflowStep({
      ...createStepDto,
      createdBy: req.user.userId
    });
  }

  @Get(':reviewId/workflow-steps')
  @RequirePermissions('workflow_steps', 'read')
  async findWorkflowStepsByReviewId(@Param('reviewId') reviewId: string) {
    return this.reviewsService.findWorkflowStepsByReviewId(reviewId);
  }

  @Put('workflow-steps/:id')
  @RequirePermissions('workflow_steps', 'update')
  async updateWorkflowStep() {
    // TODO: Implement updateWorkflowStep in service
    throw new Error('Update workflow step not implemented yet');
  }

  // Analytics Endpoints
  @Get('analytics/overview')
  @RequirePermissions('analytics', 'read')
  async getReviewAnalytics(@Query() query: any, @Request() req: any) {
    // Managers can only see their department's analytics
    if (req.user.role === 'manager') {
      query.departmentId = req.user.departmentId;
    }
    return this.reviewsService.getAnalyticsOverview();
  }

  // Employee-specific endpoints
  @Get('employee/:employeeId')
  @RequirePermissions('reviews', 'read')
  async getEmployeeReviews(@Param('employeeId') employeeId: string, @Request() req: any) {
    // Employees can only access their own reviews
    if (req.user.role === 'employee' && employeeId !== req.user.userId) {
      throw new Error('Access denied');
    }
    return this.reviewsService.findAllPerformanceReviews();
  }

  @Get('cycle/:cycleId/reviews')
  @RequirePermissions('reviews', 'read')
  async getReviewsByCycle() {
    return this.reviewsService.findAllPerformanceReviews();
  }
} 