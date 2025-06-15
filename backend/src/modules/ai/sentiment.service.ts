import { Injectable, Logger } from '@nestjs/common';
import { LangChainService } from '../../config/langchain.config';

export interface SentimentAnalysisResult {
  tone: 'positive' | 'neutral' | 'constructive' | 'negative';
  quality: number; // 0-100 score
  specificity: number; // 0-100 score
  actionability: number; // 0-100 score
  biasIndicators: string[];
  keywords: string[];
  summary: string;
}

@Injectable()
export class SentimentService {
  private readonly logger = new Logger(SentimentService.name);

  /**
   * Analyze the sentiment and quality of feedback content
   */
  async analyzeFeedback(content: string): Promise<SentimentAnalysisResult> {
    try {
      this.logger.log('Analyzing feedback sentiment');

      const prompt = `
      Analyze the following feedback text for tone, quality, specificity, and actionability.
      Return a JSON object with the following properties:
      
      - tone: One of "positive", "neutral", "constructive", or "negative"
      - quality: A score from 0-100 indicating overall feedback quality
      - specificity: A score from 0-100 indicating how specific the feedback is
      - actionability: A score from 0-100 indicating how actionable the feedback is
      - biasIndicators: An array of strings indicating potential bias in the feedback
      - keywords: An array of key terms/themes from the feedback
      - summary: A one-sentence summary of the feedback
      
      Feedback text:
      "${content}"
      `;

      const response = await LangChainService.generateResponse(prompt);
      
      try {
        const result = JSON.parse(response);
        return {
          tone: this.validateTone(result.tone),
          quality: this.normalizeScore(result.quality),
          specificity: this.normalizeScore(result.specificity),
          actionability: this.normalizeScore(result.actionability),
          biasIndicators: Array.isArray(result.biasIndicators) ? result.biasIndicators : [],
          keywords: Array.isArray(result.keywords) ? result.keywords : [],
          summary: result.summary || '',
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error parsing sentiment analysis result';
        this.logger.error(`Error parsing sentiment analysis result: ${errorMessage}`);
        return this.getDefaultResult();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing feedback sentiment';
      this.logger.error(`Error analyzing feedback sentiment: ${errorMessage}`);
      return this.getDefaultResult();
    }
  }

  /**
   * Detect potential bias in feedback
   */
  async detectBias(content: string): Promise<string[]> {
    try {
      this.logger.log('Detecting bias in feedback');

      const prompt = `
      Analyze the following feedback text for potential bias.
      Look for gender bias, racial bias, age bias, favoritism, recency bias, or any other forms of bias.
      Return an array of strings describing any bias detected, or an empty array if none is found.
      
      Feedback text:
      "${content}"
      `;

      const response = await LangChainService.generateResponse(prompt);
      
      try {
        const result = JSON.parse(response);
        return Array.isArray(result) ? result : [];
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error parsing bias detection result';
        this.logger.error(`Error parsing bias detection result: ${errorMessage}`);
        return [];
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error detecting bias';
      this.logger.error(`Error detecting bias: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Suggest improvements to feedback quality
   */
  async suggestImprovements(content: string): Promise<{ original: string; improved: string; changes: string[] }> {
    try {
      this.logger.log('Suggesting feedback improvements');

      const prompt = `
      Analyze the following feedback text and suggest improvements to make it more specific, actionable, and balanced.
      Return a JSON object with the following properties:
      
      - improved: The improved feedback text
      - changes: An array of strings describing the changes made
      
      Feedback text:
      "${content}"
      `;

      const response = await LangChainService.generateResponse(prompt);
      
      try {
        const result = JSON.parse(response);
        return {
          original: content,
          improved: result.improved || content,
          changes: Array.isArray(result.changes) ? result.changes : [],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error parsing improvement suggestions';
        this.logger.error(`Error parsing improvement suggestions: ${errorMessage}`);
        return {
          original: content,
          improved: content,
          changes: ['Error generating improvements'],
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error suggesting improvements';
      this.logger.error(`Error suggesting improvements: ${errorMessage}`);
      return {
        original: content,
        improved: content,
        changes: ['Error generating improvements'],
      };
    }
  }

  /**
   * Track sentiment trends over time
   */
  async analyzeSentimentTrend(feedbackItems: { content: string; date: string }[]): Promise<{
    trend: 'improving' | 'stable' | 'declining';
    averageQuality: number;
    periodComparisons: { period: string; quality: number }[];
  }> {
    try {
      this.logger.log('Analyzing sentiment trends');

      // Handle empty feedback items
      if (feedbackItems.length === 0) {
        return {
          trend: 'stable',
          averageQuality: 50,
          periodComparisons: [],
        };
      }

      // Sort feedback by date
      const sortedFeedback = [...feedbackItems].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Analyze each feedback item
      const analyses = await Promise.all(
        sortedFeedback.map(item => this.analyzeFeedback(item.content))
      );

      // Calculate average quality
      const averageQuality = analyses.reduce((sum, item) => sum + item.quality, 0) / analyses.length;

      // Group by periods (e.g., months)
      const periodMap = new Map<string, { total: number; count: number }>();
      
      sortedFeedback.forEach((item, index) => {
        const date = new Date(item.date);
        const period = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!periodMap.has(period)) {
          periodMap.set(period, { total: 0, count: 0 });
        }
        
        const periodData = periodMap.get(period);
        if (periodData) {
          periodData.total += analyses[index].quality;
          periodData.count += 1;
        }
      });

      // Calculate period averages
      const periodComparisons = Array.from(periodMap.entries()).map(([period, data]) => ({
        period,
        quality: data.total / data.count,
      }));

      // Determine trend
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      
      if (periodComparisons.length >= 2) {
        const firstPeriod = periodComparisons[0].quality;
        const lastPeriod = periodComparisons[periodComparisons.length - 1].quality;
        
        if (lastPeriod - firstPeriod > 10) {
          trend = 'improving';
        } else if (firstPeriod - lastPeriod > 10) {
          trend = 'declining';
        }
      }

      return {
        trend,
        averageQuality,
        periodComparisons,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing sentiment trends';
      this.logger.error(`Error analyzing sentiment trends: ${errorMessage}`);
      return {
        trend: 'stable',
        averageQuality: 50,
        periodComparisons: [],
      };
    }
  }

  // Helper methods

  private validateTone(tone: string): 'positive' | 'neutral' | 'constructive' | 'negative' {
    const validTones = ['positive', 'neutral', 'constructive', 'negative'];
    return validTones.includes(tone) ? tone as any : 'neutral';
  }

  private normalizeScore(score: number): number {
    if (typeof score !== 'number') return 50;
    return Math.min(100, Math.max(0, score));
  }

  private getDefaultResult(): SentimentAnalysisResult {
    return {
      tone: 'neutral',
      quality: 50,
      specificity: 50,
      actionability: 50,
      biasIndicators: [],
      keywords: [],
      summary: 'Unable to analyze feedback.',
    };
  }
} 