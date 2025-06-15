export interface ReviewContent {
  strengths: string[];
  areasForImprovement: string[];
  specificExamples: string[];
  developmentSuggestions: string[];
  overallRating: number;
  summary: string;
}

export interface AIGenerationRequest {
  employeeId: string;
  reviewType: 'self' | 'peer' | 'manager';
  context?: string;
}

export interface AIGenerationResponse {
  content: ReviewContent;
  confidence: number;
  sources: string[];
}

export class AIService {
  private static instance: AIService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateReview(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async suggestFeedback(content: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/ai/suggest-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.suggestion;
  }

  async analyzeSentiment(text: string): Promise<{
    tone: string;
    quality: number;
    specificity: number;
    actionability: number;
  }> {
    const response = await fetch(`${this.baseUrl}/api/ai/analyze-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async generateSelfAssessmentSuggestions(employeeId: string, reviewCycleId: string): Promise<{
    achievements: string;
    challenges: string;
    skillsGained: string;
    goalsProgress: string;
    improvementAreas: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-self-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, reviewCycleId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const aiService = AIService.getInstance(); 