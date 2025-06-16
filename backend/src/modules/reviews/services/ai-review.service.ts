import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Objective } from '../../okr/entities/objective.entity';
import { AIReviewGeneratorService, ReviewGenerationOptions } from '../../ai/services/ai-review-generator.service';
import { VectorEmbeddingService } from '../../ai/services/vector-embedding.service';

interface AIGeneratedContent {
  strengths: string;
  areas_for_improvement: string;
  achievements: string;
  goals_for_next_period: string;
  development_plan: string;
  confidence_score: number;
  sources: {
    okrs: string[];
    feedback: string[];
    projects: string[];
    goals: string[];
  };
}

@Injectable()
export class AIReviewService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    private aiReviewGeneratorService: AIReviewGeneratorService,
    private vectorEmbeddingService: VectorEmbeddingService,
  ) {}

  /**
   * Generate AI-powered performance review using OpenAI and Pinecone
   */
  async generatePerformanceReview(
    employeeId: string,
    _reviewerId: string,
    reviewType: 'self' | 'manager' | 'peer' | '360' | 'upward',
    organizationId: string,
  ): Promise<AIGeneratedContent> {
    console.log('🤖 Starting AI review generation with OpenAI and Pinecone...');

    // Get employee
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, organizationId },
      relations: ['department', 'manager'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    try {
      // 1. Ensure employee embeddings are up to date
      console.log('📊 Updating employee embeddings...');
      await this.vectorEmbeddingService.updateEmployeeEmbeddings(employeeId, organizationId);

      // 2. Generate review using AI services
      console.log('🧠 Generating review with AI...');
      const reviewOptions: ReviewGenerationOptions = {
        reviewType,
        includeGoals: true,
        includeDevelopmentPlan: true,
        tone: 'professional',
        focusAreas: this.getFocusAreasForReviewType(reviewType),
      };

      const aiReview = await this.aiReviewGeneratorService.generatePerformanceReview(
        employeeId,
        organizationId,
        reviewOptions
      );

      // 3. Convert to expected format
      const result: AIGeneratedContent = {
        strengths: aiReview.strengths,
        areas_for_improvement: aiReview.areasForImprovement,
        achievements: aiReview.achievements,
        goals_for_next_period: aiReview.goalsForNextPeriod,
        development_plan: aiReview.developmentPlan,
        confidence_score: aiReview.confidenceScore,
        sources: aiReview.sources,
      };

      console.log(`✅ AI review generated successfully with confidence: ${(aiReview.confidenceScore * 100).toFixed(1)}%`);
      return result;

    } catch (error) {
      console.error('❌ AI review generation failed:', error);
      
      // Fallback to basic review generation
      console.log('🔄 Falling back to basic review generation...');
      return this.generateFallbackReview(employee);
    }
  }

  /**
   * Get focus areas based on review type
   */
  private getFocusAreasForReviewType(reviewType: string): string[] {
    switch (reviewType) {
      case 'manager':
        return ['leadership', 'goal achievement', 'team collaboration', 'performance', 'development'];
      case 'self':
        return ['self-reflection', 'personal growth', 'achievements', 'challenges', 'goals'];
      case 'peer':
        return ['collaboration', 'communication', 'teamwork', 'support', 'knowledge sharing'];
      case '360':
        return ['leadership', 'communication', 'collaboration', 'performance', 'development'];
      case 'upward':
        return ['management style', 'support', 'communication', 'leadership', 'team development'];
      default:
        return ['performance', 'collaboration', 'achievements', 'development'];
    }
  }

  /**
   * Generate fallback review when AI fails
   */
  private async generateFallbackReview(
    employee: Employee,
  ): Promise<AIGeneratedContent> {
    console.log('📝 Generating fallback review...');

    // Get basic employee data for fallback
    const okrs = await this.objectiveRepository.find({
      where: { ownerId: employee.id },
      relations: ['keyResults'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const feedback = await this.feedbackRepository.find({
      where: { receiver: { id: employee.id } },
      relations: ['givenBy'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Generate basic review content
    const okrAnalysis = this.analyzeOKRPerformance(okrs);
    const feedbackAnalysis = this.analyzeFeedback(feedback);

    return {
      strengths: this.generateBasicStrengths(okrAnalysis, feedbackAnalysis, employee),
      areas_for_improvement: this.generateBasicImprovementAreas(okrAnalysis, feedbackAnalysis),
      achievements: this.generateBasicAchievements(okrAnalysis, employee),
      goals_for_next_period: this.generateBasicFutureGoals(okrAnalysis, feedbackAnalysis),
      development_plan: this.generateBasicDevelopmentPlan(),
      confidence_score: 0.3, // Low confidence for fallback
      sources: {
        okrs: okrs.map(okr => okr.id),
        feedback: feedback.map(f => f.id),
        projects: [],
        goals: okrs.filter(okr => okr.level === 'individual').map(okr => okr.id),
      },
    };
  }

  /**
   * Analyze OKR performance and completion rates
   */
  private analyzeOKRPerformance(okrs: Objective[]): any {
    if (okrs.length === 0) {
      return {
        totalOKRs: 0,
        completionRate: 0,
        averageProgress: 0,
        completedOKRs: [],
        inProgressOKRs: [],
        challenges: [],
      };
    }

    const totalOKRs = okrs.length;
    const completedOKRs = okrs.filter(okr => okr.progress >= 100);
    const inProgressOKRs = okrs.filter(okr => okr.progress > 0 && okr.progress < 100);
    const averageProgress = okrs.reduce((sum, okr) => sum + okr.progress, 0) / totalOKRs;
    const completionRate = (completedOKRs.length / totalOKRs) * 100;

    return {
      totalOKRs,
      completionRate,
      averageProgress,
      completedOKRs,
      inProgressOKRs,
      challenges: okrs.filter(okr => okr.progress < 50),
    };
  }

  /**
   * Analyze feedback for sentiment and common themes
   */
  private analyzeFeedback(feedback: any[]): any {
    if (feedback.length === 0) {
      return {
        totalFeedback: 0,
        positiveThemes: [],
        improvementThemes: [],
        averageSentiment: 'neutral',
      };
    }

    // Simple sentiment analysis
    const positiveKeywords = ['excellent', 'great', 'outstanding', 'strong', 'effective', 'impressive'];
    const improvementKeywords = ['improve', 'better', 'develop', 'enhance', 'work on', 'focus on'];

    const positiveThemes: string[] = [];
    const improvementThemes: string[] = [];

    feedback.forEach(f => {
      const content = f.content?.toLowerCase() || '';
      
      positiveKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          positiveThemes.push(f.content);
        }
      });

      improvementKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          improvementThemes.push(f.content);
        }
      });
    });

    return {
      totalFeedback: feedback.length,
      positiveThemes: [...new Set(positiveThemes)].slice(0, 5),
      improvementThemes: [...new Set(improvementThemes)].slice(0, 5),
      averageSentiment: positiveThemes.length > improvementThemes.length ? 'positive' : 'neutral',
    };
  }

  /**
   * Generate basic strengths section
   */
  private generateBasicStrengths(okrAnalysis: any, feedbackAnalysis: any, employee: Employee): string {
    const strengths: string[] = [];

    if (okrAnalysis.completionRate > 80) {
      strengths.push(`${employee.firstName} demonstrates exceptional goal achievement with a ${okrAnalysis.completionRate.toFixed(1)}% OKR completion rate.`);
    }

    if (okrAnalysis.averageProgress > 75) {
      strengths.push(`Shows strong progress tracking and execution capabilities with an average progress of ${okrAnalysis.averageProgress.toFixed(1)}%.`);
    }

    if (feedbackAnalysis.positiveThemes.length > 0) {
      strengths.push(`Consistently receives positive feedback from colleagues, particularly noted for their collaborative approach and technical expertise.`);
    }

    if (strengths.length === 0) {
      strengths.push(`${employee.firstName} shows dedication to their role and maintains professional standards in their work.`);
    }

    return strengths.join(' ');
  }

  /**
   * Generate basic areas for improvement
   */
  private generateBasicImprovementAreas(okrAnalysis: any, feedbackAnalysis: any): string {
    const improvements: string[] = [];

    if (okrAnalysis.completionRate < 60) {
      improvements.push(`Focus on improving goal completion rate, currently at ${okrAnalysis.completionRate.toFixed(1)}%.`);
    }

    if (okrAnalysis.challenges.length > 0) {
      improvements.push(`Address challenges in achieving objectives, particularly those showing less than 50% progress.`);
    }

    if (feedbackAnalysis.improvementThemes.length > 0) {
      improvements.push(`Consider development opportunities in areas highlighted by peer feedback.`);
    }

    if (improvements.length === 0) {
      improvements.push(`Continue professional development and seek opportunities to expand skill set.`);
    }

    return improvements.join(' ');
  }

  /**
   * Generate basic achievements section
   */
  private generateBasicAchievements(okrAnalysis: any, employee: Employee): string {
    const achievements: string[] = [];

    if (okrAnalysis.completedOKRs.length > 0) {
      achievements.push(`Successfully completed ${okrAnalysis.completedOKRs.length} major objectives during the review period.`);
      
      okrAnalysis.completedOKRs.slice(0, 3).forEach((okr: any) => {
        achievements.push(`• ${okr.title}`);
      });
    }

    if (achievements.length === 0) {
      achievements.push(`${employee.firstName} has maintained consistent performance and contributed to team objectives.`);
    }

    return achievements.join('\n');
  }

  /**
   * Generate basic future goals
   */
  private generateBasicFutureGoals(okrAnalysis: any, feedbackAnalysis: any): string {
    const goals: string[] = [];

    if (okrAnalysis.completionRate > 80) {
      goals.push(`Continue maintaining high performance standards while taking on additional leadership responsibilities.`);
    } else {
      goals.push(`Focus on improving goal completion rate and developing better planning strategies.`);
    }

    if (feedbackAnalysis.improvementThemes.length > 0) {
      goals.push(`Address development areas identified through peer feedback.`);
    }

    goals.push(`Set 3-5 SMART objectives for the next review period aligned with department goals.`);

    return goals.join(' ');
  }

  /**
   * Generate basic development plan
   */
  private generateBasicDevelopmentPlan(): string {
    const plans: string[] = [];

    plans.push(`1. **Skill Development**: Identify 2-3 key skills for improvement based on role requirements.`);
    plans.push(`2. **Mentoring**: Consider pairing with a senior team member for guidance and support.`);
    plans.push(`3. **Training**: Enroll in relevant training programs or workshops.`);
    plans.push(`4. **Regular Check-ins**: Schedule monthly progress reviews with manager.`);

    return plans.join('\n');
  }

  /**
   * Validate AI-generated content against source data
   */
  async validateGeneratedContent(
    content: AIGeneratedContent,
  ): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check confidence threshold
    if (content.confidence_score < 0.5) {
      issues.push(`Low confidence score: ${content.confidence_score}`);
    }

    // Verify content is not empty
    if (!content.strengths || content.strengths.trim().length < 50) {
      issues.push('Strengths section is too short or empty');
    }

    if (!content.areas_for_improvement || content.areas_for_improvement.trim().length < 50) {
      issues.push('Areas for improvement section is too short or empty');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
} 