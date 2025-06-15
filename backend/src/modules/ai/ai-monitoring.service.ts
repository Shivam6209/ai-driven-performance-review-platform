import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AiGeneration } from './entities/ai-generation.entity';
// import { Cron, CronExpression } from '@nestjs/schedule'; // Temporarily disabled

export interface AIPerformanceMetrics {
  generationStats: {
    totalGenerations: number;
    successRate: number;
    averageConfidence: number;
    averageResponseTime: number;
  };
  qualityMetrics: {
    acceptanceRate: number;
    editRate: number;
    validationPassRate: number;
    biasDetectionRate: number;
  };
  usageStats: {
    reviewGenerations: number;
    feedbackSuggestions: number;
    sentimentAnalyses: number;
    contentValidations: number;
  };
  timeSeriesData: Array<{
    date: string;
    generations: number;
    successRate: number;
    averageConfidence: number;
  }>;
}

export interface AIHealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  lastUpdated: Date;
}

@Injectable()
export class AiMonitoringService {
  private readonly logger = new Logger(AiMonitoringService.name);

  constructor(
    @InjectRepository(AiGeneration)
    private aiGenerationRepository: Repository<AiGeneration>,
  ) {}

  async getPerformanceMetrics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIPerformanceMetrics> {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    const [
      totalGenerations,
      successfulGenerations,
      editedGenerations,
      timeSeriesData,
    ] = await Promise.all([
      this.getTotalGenerations(dateFilter),
      this.getSuccessfulGenerations(dateFilter),
      this.getEditedGenerations(dateFilter),
      this.getTimeSeriesData(dateFilter),
    ]);

    const averageConfidence = await this.getAverageConfidence(dateFilter);
    const averageResponseTime = await this.getAverageResponseTime(dateFilter);
    const usageStats = await this.getUsageStatsByType(dateFilter);

    const successRate = totalGenerations > 0 
      ? (successfulGenerations / totalGenerations) * 100 
      : 0;
    
    const editRate = totalGenerations > 0 
      ? (editedGenerations / totalGenerations) * 100 
      : 0;

    const acceptanceRate = totalGenerations > 0 
      ? ((totalGenerations - editedGenerations) / totalGenerations) * 100 
      : 0;

    return {
      generationStats: {
        totalGenerations,
        successRate: Math.round(successRate * 100) / 100,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      },
      qualityMetrics: {
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        editRate: Math.round(editRate * 100) / 100,
        validationPassRate: 96.8, // Mock data - implement actual validation tracking
        biasDetectionRate: 2.3, // Mock data - implement actual bias detection tracking
      },
      usageStats,
      timeSeriesData,
    };
  }

  async getHealthStatus(): Promise<AIHealthStatus> {
    const metrics = await this.getPerformanceMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check success rate
    if (metrics.generationStats.successRate < 80) {
      status = 'critical';
      issues.push('Low AI generation success rate');
      recommendations.push('Review AI model configuration and prompts');
    } else if (metrics.generationStats.successRate < 90) {
      status = 'warning';
      issues.push('Below optimal AI generation success rate');
      recommendations.push('Monitor AI model performance trends');
    }

    // Check average confidence
    if (metrics.generationStats.averageConfidence < 0.6) {
      status = 'critical';
      issues.push('Low average confidence in AI generations');
      recommendations.push('Review training data and model parameters');
    } else if (metrics.generationStats.averageConfidence < 0.8) {
      if (status !== 'critical') status = 'warning';
      issues.push('Below optimal average confidence');
      recommendations.push('Consider model fine-tuning');
    }

    // Check response time
    if (metrics.generationStats.averageResponseTime > 5) {
      if (status !== 'critical') status = 'warning';
      issues.push('High average response time');
      recommendations.push('Optimize AI model inference or consider caching');
    }

    // Check edit rate
    if (metrics.qualityMetrics.editRate > 40) {
      if (status !== 'critical') status = 'warning';
      issues.push('High content edit rate');
      recommendations.push('Review AI prompt engineering and context quality');
    }

    return {
      status,
      issues,
      recommendations,
      lastUpdated: new Date(),
    };
  }

  async getRecentGenerations(limit: number = 10) {
    return this.aiGenerationRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['employee'],
    });
  }

  async getGenerationsByEmployee(employeeId: string, limit: number = 50) {
    return this.aiGenerationRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getGenerationsByType(generationType: string, limit: number = 100) {
    return this.aiGenerationRepository.find({
      where: { generationType },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // @Cron(CronExpression.EVERY_HOUR) // Temporarily disabled due to crypto issue
  async performHealthCheck() {
    try {
      const healthStatus = await this.getHealthStatus();
      
      if (healthStatus.status === 'critical') {
        this.logger.error('AI System Health Check: CRITICAL', {
          issues: healthStatus.issues,
          recommendations: healthStatus.recommendations,
        });
        // Here you could send alerts to administrators
      } else if (healthStatus.status === 'warning') {
        this.logger.warn('AI System Health Check: WARNING', {
          issues: healthStatus.issues,
          recommendations: healthStatus.recommendations,
        });
      } else {
        this.logger.log('AI System Health Check: HEALTHY');
      }
    } catch (error) {
      this.logger.error('Error performing AI health check:', error);
    }
  }

  private buildDateFilter(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) {
      // Default to last 30 days
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      return { createdAt: Between(start, end) };
    }
    
    if (startDate && endDate) {
      return { createdAt: Between(startDate, endDate) };
    }
    
    return {};
  }

  private async getTotalGenerations(dateFilter: any): Promise<number> {
    return this.aiGenerationRepository.count({ where: dateFilter });
  }

  private async getSuccessfulGenerations(dateFilter: any): Promise<number> {
    return this.aiGenerationRepository.count({
      where: { ...dateFilter, isEdited: false },
    });
  }

  private async getEditedGenerations(dateFilter: any): Promise<number> {
    return this.aiGenerationRepository.count({
      where: { ...dateFilter, isEdited: true },
    });
  }

  private async getAverageConfidence(dateFilter: any): Promise<number> {
    const result = await this.aiGenerationRepository
      .createQueryBuilder('generation')
      .select('AVG(generation.confidence)', 'avgConfidence')
      .where(dateFilter.createdAt ? 'generation.createdAt BETWEEN :start AND :end' : '1=1')
      .setParameters(dateFilter.createdAt ? {
        start: dateFilter.createdAt.from,
        end: dateFilter.createdAt.to,
      } : {})
      .getRawOne();

    return parseFloat(result.avgConfidence) || 0;
  }

  private async getAverageResponseTime(_dateFilter: any): Promise<number> {
    // Mock implementation - you would track actual response times
    return 1.8;
  }

  private async getUsageStatsByType(dateFilter: any) {
    const usageStats = await this.aiGenerationRepository
      .createQueryBuilder('generation')
      .select('generation.generationType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(dateFilter.createdAt ? 'generation.createdAt BETWEEN :start AND :end' : '1=1')
      .setParameters(dateFilter.createdAt ? {
        start: dateFilter.createdAt.from,
        end: dateFilter.createdAt.to,
      } : {})
      .groupBy('generation.generationType')
      .getRawMany();

    const stats = {
      reviewGenerations: 0,
      feedbackSuggestions: 0,
      sentimentAnalyses: 0,
      contentValidations: 0,
    };

    usageStats.forEach(stat => {
      const count = parseInt(stat.count);
      if (stat.type.includes('review')) {
        stats.reviewGenerations += count;
      } else if (stat.type.includes('feedback')) {
        stats.feedbackSuggestions += count;
      } else if (stat.type.includes('sentiment')) {
        stats.sentimentAnalyses += count;
      } else if (stat.type.includes('validation')) {
        stats.contentValidations += count;
      }
    });

    return stats;
  }

  private async getTimeSeriesData(dateFilter: any) {
    const timeSeriesData = await this.aiGenerationRepository
      .createQueryBuilder('generation')
      .select('DATE(generation.createdAt)', 'date')
      .addSelect('COUNT(*)', 'generations')
      .addSelect('AVG(generation.confidence)', 'averageConfidence')
      .addSelect('COUNT(CASE WHEN generation.isEdited = false THEN 1 END)', 'successful')
      .where(dateFilter.createdAt ? 'generation.createdAt BETWEEN :start AND :end' : '1=1')
      .setParameters(dateFilter.createdAt ? {
        start: dateFilter.createdAt.from,
        end: dateFilter.createdAt.to,
      } : {})
      .groupBy('DATE(generation.createdAt)')
      .orderBy('DATE(generation.createdAt)', 'ASC')
      .getRawMany();

    return timeSeriesData.map(data => ({
      date: data.date,
      generations: parseInt(data.generations),
      successRate: data.generations > 0 
        ? Math.round((parseInt(data.successful) / parseInt(data.generations)) * 100 * 100) / 100
        : 0,
      averageConfidence: Math.round(parseFloat(data.averageConfidence || '0') * 100) / 100,
    }));
  }
} 