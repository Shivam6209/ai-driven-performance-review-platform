import axios, { AxiosResponse } from 'axios';
import reviewService from '../reviewService';
import type {
  PerformanceReview,
  ReviewCycle,
  ReviewTemplate,
  ReviewStats,
  AIGenerationRequest,
  AIGenerationResponse,
} from '@/types/review';
import { ReviewService } from '../review.service';
import { ApiService, ApiResponse } from '../api';
import { AxiosRequestConfig } from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../api');

describe('ReviewService', () => {
  let service: ReviewService;
  let mockApiService: jest.Mocked<ApiService>;

  const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });

  const mockReview: PerformanceReview = {
    id: '1',
    employeeId: 'emp1',
    reviewerId: 'rev1',
    reviewCycleId: 'cycle1',
    reviewType: 'manager',
    status: 'draft',
    dueDate: '2024-03-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    sections: [],
  };

  const mockReviewCycle: ReviewCycle = {
    id: '1',
    name: 'Q1 2024 Review',
    cycleType: 'quarterly',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    submissionDeadline: '2024-03-15',
    approvalDeadline: '2024-03-31',
    status: 'active',
    createdBy: 'admin1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockTemplate: ReviewTemplate = {
    id: '1',
    name: 'Performance Review Template',
    reviewType: 'self',
    isDefault: true,
    isActive: true,
    createdBy: 'admin',
    createdAt: '2024-01-01',
    sections: [],
  };

  const mockStats: ReviewStats = {
    totalReviews: 50,
    completedReviews: 30,
    pendingReviews: 15,
    overdueReviews: 5,
    averageCompletionTime: 5.2,
    aiGenerationStats: {
      totalGenerated: 45,
      averageConfidence: 0.85,
      humanEditRate: 0.25,
    },
  };

  beforeEach(() => {
    mockApiService = {
      getInstance: jest.fn().mockReturnThis(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      upload: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;

    (ApiService.getInstance as jest.Mock).mockReturnValue(mockApiService);
    service = ReviewService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Review CRUD operations', () => {
    it('gets all reviews', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockResponse([mockReview]));
      const reviews = await service.getReviews();
      expect(reviews).toEqual([mockReview]);
      expect(mockApiService.get).toHaveBeenCalledWith('/reviews');
    });

    it('gets a review by id', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockResponse(mockReview));
      const review = await service.getReviewById('1');
      expect(review).toEqual(mockReview);
      expect(mockApiService.get).toHaveBeenCalledWith('/reviews/1');
    });

    it('creates a review', async () => {
      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockReview));
      const review = await service.createReview(mockReview);
      expect(review).toEqual(mockReview);
      expect(mockApiService.post).toHaveBeenCalledWith('/reviews', mockReview);
    });

    it('updates a review', async () => {
      mockedAxios.put.mockResolvedValueOnce(createMockResponse(mockReview));
      const review = await service.updateReview('1', mockReview);
      expect(review).toEqual(mockReview);
      expect(mockApiService.patch).toHaveBeenCalledWith('/reviews/1', mockReview);
    });

    it('deletes a review', async () => {
      mockedAxios.delete.mockResolvedValueOnce(createMockResponse(undefined));
      await service.deleteReview('1');
      expect(mockApiService.delete).toHaveBeenCalledWith('/reviews/1');
    });
  });

  describe('Review cycle operations', () => {
    it('gets all review cycles', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockResponse([mockReviewCycle]));
      const cycles = await service.getReviewCycles();
      expect(cycles).toEqual([mockReviewCycle]);
      expect(mockApiService.get).toHaveBeenCalledWith('/review-cycles');
    });

    it('gets a review cycle by id', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockResponse(mockReviewCycle));
      const cycle = await service.getReviewCycleById('1');
      expect(cycle).toEqual(mockReviewCycle);
      expect(mockApiService.get).toHaveBeenCalledWith('/review-cycles/1');
    });

    it('creates a review cycle', async () => {
      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockReviewCycle));
      const cycle = await service.createReviewCycle(mockReviewCycle);
      expect(cycle).toEqual(mockReviewCycle);
      expect(mockApiService.post).toHaveBeenCalledWith('/review-cycles', mockReviewCycle);
    });
  });

  describe('Template operations', () => {
    it('gets all templates', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockResponse([mockTemplate]));
      const templates = await service.getTemplates();
      expect(templates).toEqual([mockTemplate]);
      expect(mockApiService.get).toHaveBeenCalledWith('/templates');
    });

    it('gets a template by id', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockResponse(mockTemplate));
      const template = await service.getTemplateById('1');
      expect(template).toEqual(mockTemplate);
      expect(mockApiService.get).toHaveBeenCalledWith('/templates/1');
    });

    it('creates a template', async () => {
      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockTemplate));
      const template = await service.createTemplate(mockTemplate);
      expect(template).toEqual(mockTemplate);
      expect(mockApiService.post).toHaveBeenCalledWith('/templates', mockTemplate);
    });
  });

  describe('AI Generation', () => {
    const mockRequest: AIGenerationRequest = {
      reviewId: '1',
      sectionId: 'section1',
      employeeId: 'emp1',
      contextData: {
        feedbackHistory: true,
        goalProgress: true,
        timeRange: {
          start: '2024-01-01',
          end: '2024-03-31',
        },
      },
    };

    const mockResponse: AIGenerationResponse = {
      content: 'Generated review content',
      confidenceScore: 0.85,
      sourceReferences: [],
      modelVersion: '1.0',
      generationTimestamp: '2024-01-15T10:00:00Z',
    };

    it('generates review content', async () => {
      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockResponse));
      const response = await service.generateReviewContent(mockRequest);
      expect(response).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/reviews/generate', mockRequest);
    });
  });

  describe('Stats and Analytics', () => {
    it('gets review stats', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockResponse(mockStats));
      const stats = await service.getReviewStats();
      expect(stats).toEqual(mockStats);
      expect(mockApiService.get).toHaveBeenCalledWith('/stats');
    });

    it('gets employee review history', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockResponse([mockReview]));
      const history = await service.getEmployeeReviewHistory('emp1');
      expect(history).toEqual([mockReview]);
      expect(mockApiService.get).toHaveBeenCalledWith('/history/emp1');
    });
  });

  describe('Workflow operations', () => {
    it('submits a review', async () => {
      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockReview));
      const review = await service.submitReview('1');
      expect(review).toEqual(mockReview);
      expect(mockApiService.post).toHaveBeenCalledWith('/reviews/1/submit');
    });

    it('approves a review', async () => {
      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockReview));
      const review = await service.approveReview('1');
      expect(review).toEqual(mockReview);
      expect(mockApiService.post).toHaveBeenCalledWith('/reviews/1/approve');
    });

    it('rejects a review', async () => {
      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockReview));
      const review = await service.rejectReview('1', 'Needs improvement');
      expect(review).toEqual(mockReview);
      expect(mockApiService.post).toHaveBeenCalledWith('/reviews/1/reject', { reason: 'Needs improvement' });
    });
  });

  describe('Error handling', () => {
    it('handles API errors correctly', async () => {
      const errorMessage = 'API Error occurred';
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          data: {
            message: errorMessage,
          },
        },
        message: 'Network Error',
      });

      await expect(service.getReviews()).rejects.toThrow(`API Error: ${errorMessage}`);
    });

    it('handles network errors correctly', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        message: errorMessage,
      });

      await expect(service.getReviews()).rejects.toThrow(`API Error: ${errorMessage}`);
    });

    it('handles unknown errors correctly', async () => {
      const error = new Error('Unknown error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(service.getReviews()).rejects.toThrow(error);
    });
  });

  describe('getReviews', () => {
    it('fetches reviews with filters', async () => {
      const filters = { status: 'draft', employeeId: 'emp1' };
      const config: AxiosRequestConfig = { params: filters };

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [mockReview],
      } as ApiResponse<PerformanceReview[]>);

      const result = await service.getReviews(filters);

      expect(mockApiService.get).toHaveBeenCalledWith('/reviews', config);
      expect(result).toEqual([mockReview]);
    });

    it('handles API errors', async () => {
      mockApiService.get.mockResolvedValueOnce({
        success: false,
        error: { code: 'ERROR', message: 'API Error' },
      } as ApiResponse<PerformanceReview[]>);

      await expect(service.getReviews()).rejects.toThrow('API Error');
    });
  });

  describe('getReviewById', () => {
    it('fetches a single review by ID', async () => {
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockReview,
      } as ApiResponse<PerformanceReview>);

      const result = await service.getReviewById('1');

      expect(mockApiService.get).toHaveBeenCalledWith('/reviews/1');
      expect(result).toEqual(mockReview);
    });
  });

  describe('createReview', () => {
    it('creates a new review', async () => {
      const newReview = { ...mockReview };
      delete newReview.id;
      delete newReview.createdAt;
      delete newReview.updatedAt;

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockReview,
      } as ApiResponse<PerformanceReview>);

      const result = await service.createReview(newReview);

      expect(mockApiService.post).toHaveBeenCalledWith('/reviews', newReview);
      expect(result).toEqual(mockReview);
    });
  });

  describe('updateReview', () => {
    it('updates an existing review', async () => {
      const update = { status: 'submitted' as const };
      mockApiService.patch.mockResolvedValueOnce({
        success: true,
        data: { ...mockReview, ...update },
      } as ApiResponse<PerformanceReview>);

      const result = await service.updateReview('1', update);

      expect(mockApiService.patch).toHaveBeenCalledWith('/reviews/1', update);
      expect(result).toEqual({ ...mockReview, ...update });
    });
  });

  describe('getReviewCycles', () => {
    it('fetches review cycles', async () => {
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [mockReviewCycle],
      } as ApiResponse<ReviewCycle[]>);

      const result = await service.getReviewCycles();

      expect(mockApiService.get).toHaveBeenCalledWith('/review-cycles');
      expect(result).toEqual([mockReviewCycle]);
    });
  });

  describe('createReviewCycle', () => {
    it('creates a new review cycle', async () => {
      const newCycle = { ...mockReviewCycle };
      delete newCycle.id;
      delete newCycle.createdAt;
      delete newCycle.updatedAt;

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockReviewCycle,
      } as ApiResponse<ReviewCycle>);

      const result = await service.createReviewCycle(newCycle);

      expect(mockApiService.post).toHaveBeenCalledWith('/review-cycles', newCycle);
      expect(result).toEqual(mockReviewCycle);
    });
  });
}); 