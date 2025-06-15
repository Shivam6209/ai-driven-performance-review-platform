import { Controller, Post, Body, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SentimentService, SentimentAnalysisResult } from './sentiment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AnalyzeFeedbackRequest {
  content: string;
}

interface DetectBiasRequest {
  content: string;
}

interface SuggestImprovementsRequest {
  content: string;
}

interface AnalyzeTrendRequest {
  feedbackItems: { content: string; date: string }[];
}

@Controller('ai/sentiment')
@UseGuards(JwtAuthGuard)
export class SentimentController {
  private readonly logger = new Logger(SentimentController.name);

  constructor(private readonly sentimentService: SentimentService) {}

  @Post('analyze')
  async analyzeFeedback(@Body() request: AnalyzeFeedbackRequest): Promise<SentimentAnalysisResult> {
    this.logger.log('Received request to analyze feedback sentiment');
    try {
      return await this.sentimentService.analyzeFeedback(request.content);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing feedback';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error analyzing feedback: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Post('detect-bias')
  async detectBias(@Body() request: DetectBiasRequest): Promise<{ biasIndicators: string[] }> {
    this.logger.log('Received request to detect bias in feedback');
    try {
      const biasIndicators = await this.sentimentService.detectBias(request.content);
      return { biasIndicators };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error detecting bias';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error detecting bias: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Post('suggest-improvements')
  async suggestImprovements(@Body() request: SuggestImprovementsRequest): Promise<{
    original: string;
    improved: string;
    changes: string[];
  }> {
    this.logger.log('Received request to suggest feedback improvements');
    try {
      return await this.sentimentService.suggestImprovements(request.content);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error suggesting improvements';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error suggesting improvements: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  @Post('analyze-trend')
  async analyzeTrend(@Body() request: AnalyzeTrendRequest): Promise<{
    trend: 'improving' | 'stable' | 'declining';
    averageQuality: number;
    periodComparisons: { period: string; quality: number }[];
  }> {
    this.logger.log('Received request to analyze sentiment trend');
    try {
      return await this.sentimentService.analyzeSentimentTrend(request.feedbackItems);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing trend';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorStatus = (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      
      this.logger.error(`Error analyzing trend: ${errorMessage}`, errorStack);
      throw new HttpException(errorMessage, errorStatus);
    }
  }
} 