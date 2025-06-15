import { Controller, Post, Body, UseGuards, Logger, HttpException, HttpStatus, Get, Query } from '@nestjs/common';
import { AiService, GenerateReviewRequest, ReviewContent, ReviewSource } from './ai.service';
import { AiMonitoringService } from './ai-monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface SummarizeRequest {
  employeeId: string;
  content: string;
  type: string;
}

interface SuggestFeedbackRequest {
  employeeId: string;
  revieweeId: string;
  context?: string;
}

interface ValidateContentRequest {
  content: string;
  sources: ReviewSource[];
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly aiMonitoringService: AiMonitoringService,
  ) {}

  @Post('generate-review')
  async generateReview(@Body() request: GenerateReviewRequest): Promise<ReviewContent> {
    this.logger.log(`Received request to generate review for employee: ${request.employeeId}`);
    try {
      return await this.aiService.generateReview(request);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error generating review';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error generating review: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Post('summarize')
  async summarizeSelfAssessment(@Body() request: SummarizeRequest): Promise<ReviewContent> {
    this.logger.log(`Received request to summarize content for employee: ${request.employeeId}`);
    try {
      return await this.aiService.summarizeSelfAssessment(request.employeeId, request.content);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error summarizing content';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error summarizing content: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Post('suggest-feedback')
  async suggestFeedback(@Body() request: SuggestFeedbackRequest): Promise<{ suggestion: string }> {
    this.logger.log(`Received request to suggest feedback from ${request.employeeId} to ${request.revieweeId}`);
    try {
      const suggestion = await this.aiService.suggestFeedback(
        request.employeeId,
        request.revieweeId,
        request.context,
      );
      return { suggestion };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error suggesting feedback';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error suggesting feedback: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Post('validate')
  async validateContent(@Body() request: ValidateContentRequest): Promise<{ isValid: boolean; issues?: string[] }> {
    this.logger.log('Received request to validate content');
    try {
      return await this.aiService.validateContent(request.content, request.sources);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error validating content';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error validating content: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Get('metrics')
  async getPerformanceMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log('Received request for AI performance metrics');
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      return await this.aiMonitoringService.getPerformanceMetrics(start, end);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching AI metrics';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error fetching AI metrics: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Get('health')
  async getHealthStatus() {
    this.logger.log('Received request for AI health status');
    try {
      return await this.aiMonitoringService.getHealthStatus();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching AI health status';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error fetching AI health status: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Get('recent-generations')
  async getRecentGenerations(@Query('limit') limit?: string) {
    this.logger.log('Received request for recent AI generations');
    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;
      return await this.aiMonitoringService.getRecentGenerations(limitNum);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching recent generations';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error fetching recent generations: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }
} 